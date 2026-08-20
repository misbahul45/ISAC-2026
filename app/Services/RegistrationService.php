<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegistrationService
{
    public function selectCompetition(Team $team, array $data): Registration
    {
        return DB::transaction(function () use ($team, $data): Registration {
            $existing = Registration::query()->where('team_id', $team->id)->lockForUpdate()->first();
            if ($existing !== null) {
                if ($existing->competition_id === $data['competition_id']) {
                    return $existing;
                }

                throw ValidationException::withMessages(['competition_id' => ['Tim sudah terdaftar pada kompetisi lain.']]);
            }

            $competition = Competition::query()->lockForUpdate()->findOrFail($data['competition_id']);
            if ($competition->status !== Competition::STATUS_REGISTRATION_OPEN) {
                throw ValidationException::withMessages(['competition_id' => ['Pendaftaran kompetisi belum dibuka.']]);
            }

            // Batch is resolved at the exact registration time on the server.
            // The latest valid opening is selected, so client input can never
            // bind a Team to a closed, full, or unrelated Batch.
            $batch = Batch::query()
                ->where('competition_id', $competition->id)
                ->where('status', BatchStatus::OPEN)
                ->where('start_date', '<=', now())
                ->where('end_date', '>=', now())
                ->where(fn ($query) => $query->whereNull('quota')->orWhereColumn('current_registrations', '<', 'quota'))
                ->orderByDesc('start_date')
                ->lockForUpdate()
                ->first();

            if ($batch === null) {
                throw ValidationException::withMessages(['competition_id' => ['Belum ada Batch aktif dengan kuota tersedia untuk kompetisi ini.']]);
            }

            $isOlympiad = $competition->type === Competition::TYPE_OLIMPIADE;
            // A Team owns exactly one Registration. Repeating the save is
            // idempotent and must never assign a different Batch or price.
            $registration = Registration::query()->updateOrCreate(['team_id' => $team->id], [
                'competition_id' => $competition->id,
                'batch_id' => $batch->id,
                'status' => $isOlympiad ? RegistrationStatus::WAITING_PAYMENT : RegistrationStatus::VERIFIED,
                'payment_required_at' => $isOlympiad ? now() : null,
                'payment_verified_at' => $isOlympiad ? null : now(),
            ]);

            if ($registration->wasRecentlyCreated) {
                $batch->increment('current_registrations');
            }

            return $registration;
        });
    }

    public function updateTeamData(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        $this->assertEditable($team, $registration, 'TEAM');
        $this->assertInstitutionMatchesCompetition($data['institution_name'], $registration->competition);

        DB::transaction(function () use ($team, $data, $registration): void {
            Team::query()->updateOrCreate(['id' => $team->id], Arr::only($data, [
                'name', 'phone', 'institution_name', 'institution_address',
            ]));
            $registration->update(['team_completed_at' => $registration->team_completed_at ?? now()]);
            $this->resolveDataRevision($team, 'TEAM');
        });

        return $team->fresh()->load('registration.competition');
    }

    /**
     * Update every registration data section from an Admin correction flow.
     *
     * This intentionally bypasses the Team-facing edit lock. The Admin policy
     * and audit log are the controls for this path; the competition-specific
     * member validation remains the same as the public registration flow.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateByAdmin(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        $teamData = $data['team'];
        $documentData = $data['documents'] ?? [];
        $this->assertInstitutionMatchesCompetition($teamData['institution_name'], $registration->competition);

        $competition = $registration->competition;
        [$minimum, $maximum] = match ($competition->type) {
            Competition::TYPE_OLIMPIADE => [1, 1],
            Competition::TYPE_BUSINESS_PLAN, Competition::TYPE_BUSINESS_IT_CASE => [3, 3],
            default => throw ValidationException::withMessages(['members' => ['Tipe kompetisi tidak valid.']]),
        };

        $members = array_values($data['members']);
        if (count($members) < $minimum || count($members) > $maximum) {
            $message = $minimum === $maximum
                ? "Jumlah peserta harus tepat {$minimum} orang."
                : "Jumlah peserta harus {$minimum} sampai {$maximum} orang.";
            throw ValidationException::withMessages(['members' => [$message]]);
        }

        $isOlympiad = $competition->type === Competition::TYPE_OLIMPIADE;
        $isUniversity = $competition->type === Competition::TYPE_BUSINESS_IT_CASE;

        if ($isOlympiad) {
            $members[0]['role'] = 'LEADER';
        } elseif (count(array_filter($members, fn (array $member): bool => $member['role'] === 'LEADER')) !== 1) {
            throw ValidationException::withMessages(['members' => ['Harus memiliki tepat satu ketua tim (LEADER).']]);
        }

        $memberErrors = [];
        foreach ($members as $index => &$member) {
            $identityLabel = $isUniversity ? 'NIM' : 'NISN';
            if (mb_strlen(trim($member['student_id'])) < 3) {
                $memberErrors["members.{$index}.student_id"] = ["{$identityLabel} minimal 3 karakter."];
            }

            if ($isUniversity) {
                foreach (['major' => 'Jurusan', 'faculty' => 'Fakultas'] as $field => $label) {
                    if (blank($member[$field] ?? null)) {
                        $memberErrors["members.{$index}.{$field}"] = ["{$label} wajib diisi untuk mahasiswa."];
                    }
                }
            } else {
                $member['major'] = null;
                $member['faculty'] = null;
            }

            if (! empty($member['photo_file_id'])) {
                $this->assertAdminMemberPhoto($team, $member['photo_file_id'], 'photo_file_id');
            }
        }
        unset($member);

        if ($memberErrors !== []) {
            throw ValidationException::withMessages($memberErrors);
        }

        DB::transaction(function () use ($team, $teamData, $documentData, $members, $registration): void {
            $team->update(Arr::only($teamData, [
                'name', 'phone', 'institution_name', 'institution_address',
            ]));

            $keptIds = [];
            foreach (array_values($members) as $index => $payload) {
                $member = null;
                if (! empty($payload['id'])) {
                    $member = $team->members()->whereKey($payload['id'])->first();
                    if ($member === null) {
                        throw ValidationException::withMessages(['members' => ['Anggota tidak dimiliki oleh Team ini.']]);
                    }
                }

                $photoFileId = array_key_exists('photo_file_id', $payload)
                    ? ($payload['photo_file_id'] ?: null)
                    : $member?->photo_file_id;
                $attributes = [
                    'name' => $payload['name'],
                    'role' => $payload['role'],
                    'email' => strtolower(trim($payload['email'])),
                    'major' => $payload['major'] ?? null,
                    'faculty' => $payload['faculty'] ?? null,
                    'student_id' => $payload['student_id'],
                    'photo_file_id' => $photoFileId,
                    'sort_order' => $index + 1,
                ];

                if ($member === null) {
                    $member = $team->members()->create($attributes);
                } else {
                    $member->update($attributes);
                }
                $keptIds[] = $member->id;
            }

            $team->members()->whereNotIn('id', $keptIds)->delete();
            $documentUpdates = Arr::only($documentData, ['document_url', 'twibbon_url']);
            if ($documentUpdates !== []) {
                $team->update($documentUpdates);
            }
            $team->refresh();
            $documentsCompleted = filled($team->document_url) && filled($team->twibbon_url);

            if ($team->status === Team::STATUS_REVISION_REQUIRED && $documentsCompleted) {
                $team->update([
                    'status' => Team::STATUS_WAITING_VERIFICATION,
                    'verified_at' => null,
                    'verified_by' => null,
                    'verification_note' => null,
                    'revision_step' => null,
                ]);
            }
            $registration->update([
                'team_completed_at' => $registration->team_completed_at ?? now(),
                'members_completed_at' => $registration->members_completed_at ?? now(),
                'documents_completed_at' => $documentsCompleted ? ($registration->documents_completed_at ?? now()) : null,
            ]);
        });

        return $team->fresh()->load([
            'members' => fn ($query) => $query->orderBy('sort_order'),
            'registration.competition',
            'registration.batch',
            'registration.paymentProofFile',
            'currentStage',
        ]);
    }

    public function getMembers(Team $team): Team
    {
        return $team->load(['members' => fn ($query) => $query->orderBy('sort_order'), 'registration.competition']);
    }

    public function finalizeMembers(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        $this->assertEditable($team, $registration, 'MEMBERS');
        if ($registration->team_completed_at === null) {
            throw ValidationException::withMessages(['team' => ['Lengkapi data tim terlebih dahulu.']]);
        }

        $competition = $registration->competition;
        [$minimum, $maximum] = match ($competition->type) {
            Competition::TYPE_OLIMPIADE => [1, 1],
            Competition::TYPE_BUSINESS_PLAN, Competition::TYPE_BUSINESS_IT_CASE => [3, 3],
            default => throw ValidationException::withMessages(['members' => ['Tipe kompetisi tidak valid.']]),
        };

        $members = array_values($data['members']);
        if (count($members) < $minimum || count($members) > $maximum) {
            $message = $minimum === $maximum
                ? "Jumlah peserta harus tepat {$minimum} orang."
                : "Jumlah peserta harus {$minimum} sampai {$maximum} orang.";
            throw ValidationException::withMessages(['members' => [$message]]);
        }

        $isOlympiad = $competition->type === Competition::TYPE_OLIMPIADE;
        $isUniversity = $competition->type === Competition::TYPE_BUSINESS_IT_CASE;

        if ($isOlympiad) {
            $members[0]['role'] = 'LEADER';
        } elseif (count(array_filter($members, fn (array $member): bool => $member['role'] === 'LEADER')) !== 1) {
            throw ValidationException::withMessages(['members' => ['Harus memiliki tepat satu ketua tim (LEADER).']]);
        }

        $memberErrors = [];
        foreach ($members as $index => &$member) {
            $identityLabel = $isUniversity ? 'NIM' : 'NISN';
            if (mb_strlen(trim($member['student_id'])) < 3) {
                $memberErrors["members.{$index}.student_id"] = ["{$identityLabel} minimal 3 karakter."];
            }

            if ($isUniversity) {
                foreach (['major' => 'Jurusan', 'faculty' => 'Fakultas'] as $field => $label) {
                    if (blank($member[$field] ?? null)) {
                        $memberErrors["members.{$index}.{$field}"] = ["{$label} wajib diisi untuk mahasiswa."];
                    }
                }
            } else {
                $member['major'] = null;
                $member['faculty'] = null;
            }

            if (! empty($member['photo_file_id'])) {
                $this->assertOwnedFile($team, $member['photo_file_id'], 'MEMBER_PHOTO', 'photo_file_id');
            }
        }
        unset($member);

        if ($memberErrors !== []) {
            throw ValidationException::withMessages($memberErrors);
        }

        DB::transaction(function () use ($team, $members, $registration): void {
            foreach (array_values($members) as $index => $payload) {
                if (! empty($payload['id'])) {
                    if (! $team->members()->whereKey($payload['id'])->exists()) {
                        throw ValidationException::withMessages(['members' => ['Anggota tidak dimiliki oleh Team ini.']]);
                    }
                }

                $attributes = [
                    'name' => $payload['name'],
                    'role' => $payload['role'],
                    'email' => strtolower(trim($payload['email'])),
                    'major' => $payload['major'] ?? null,
                    'faculty' => $payload['faculty'] ?? null,
                    'student_id' => $payload['student_id'],
                    'photo_file_id' => $payload['photo_file_id'] ?? null,
                    'sort_order' => $index + 1,
                ];

                $team->members()->updateOrCreate(['sort_order' => $index + 1], $attributes);
            }

            $registration->update(['members_completed_at' => $registration->members_completed_at ?? now()]);
            $this->resolveDataRevision($team, 'MEMBERS');
        });

        return $team->fresh()->load(['members' => fn ($query) => $query->orderBy('sort_order'), 'registration.competition']);
    }

    public function updateDocuments(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        $this->assertEditable($team, $registration, 'DOCUMENTS');
        if ($registration->team_completed_at === null || $registration->members_completed_at === null) {
            throw ValidationException::withMessages(['documents' => ['Lengkapi data Team dan Member terlebih dahulu.']]);
        }

        DB::transaction(function () use ($team, $data, $registration): void {
            Team::query()->updateOrCreate(['id' => $team->id], [
                'document_url' => $data['document_url'],
                'twibbon_url' => $data['twibbon_url'],
            ]);
            $registration->update(['documents_completed_at' => $registration->documents_completed_at ?? now()]);

            if ($registration->competition->type !== Competition::TYPE_OLIMPIADE) {
                $registration->update(['submitted_at' => $registration->submitted_at ?? now()]);
                $team->update(['status' => Team::STATUS_WAITING_VERIFICATION]);
            }

            $this->resolveDataRevision($team, 'DOCUMENTS');
        });

        return $team->fresh()->load('registration.competition');
    }

    public function getPaymentData(Team $team): Team
    {
        return $team->load('registration.batch', 'registration.paymentProofFile', 'registration.paymentForStage');
    }

    /**
     * @return array{originalAmount: float, discountPercent: int, discountAmount: float, amount: float, promoApplied: bool, promoCode: ?string}
     */
    public function quotePayment(Team $team, ?string $promoCode): array
    {
        return $this->paymentQuote($this->registration($team), $promoCode);
    }

    public function submitPayment(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        if ($registration->team_completed_at === null || $registration->members_completed_at === null || $registration->documents_completed_at === null) {
            throw ValidationException::withMessages(['payment' => ['Lengkapi seluruh data pendaftaran terlebih dahulu.']]);
        }

        $paymentGateActive = $registration->competition->type === Competition::TYPE_OLIMPIADE || $registration->payment_for_stage_id !== null;
        if (! $paymentGateActive || ! in_array($registration->status, [RegistrationStatus::WAITING_PAYMENT, RegistrationStatus::REVISION_REQUIRED], true)) {
            $requestedPromoCode = Str::upper(trim((string) ($data['promo_code'] ?? '')));
            $submittedPromoCode = Str::upper(trim((string) $registration->promo_code));
            if ($registration->payment_submitted_at !== null
                && $registration->payment_proof_file_id === $data['payment_proof_file_id']
                && $submittedPromoCode === $requestedPromoCode) {
                return $this->getPaymentData($team);
            }
            throw ValidationException::withMessages(['payment' => ['Pembayaran tidak tersedia pada tahap ini.']]);
        }

        $this->assertOwnedFile($team, $data['payment_proof_file_id'], 'PAYMENT_PROOF', 'payment_proof_file_id');
        $quote = $this->paymentQuote($registration, $data['promo_code'] ?? null);

        DB::transaction(function () use ($team, $data, $registration, $quote): void {
            $registration->update([
                'payment_proof_file_id' => $data['payment_proof_file_id'],
                'amount_paid' => $quote['amount'],
                'payment_method' => $data['payment_method'],
                'promo_code' => $quote['promoCode'],
                'discount_percent' => $quote['discountPercent'],
                'discount_amount' => $quote['discountAmount'],
                'payment_submitted_at' => now(),
                'payment_rejection_reason' => null,
                'status' => RegistrationStatus::WAITING_VERIFICATION,
                'submitted_at' => $registration->submitted_at ?? now(),
            ]);

            if ($registration->payment_for_stage_id === null) {
                $team->update(['status' => Team::STATUS_WAITING_VERIFICATION]);
            }
        });

        return $team->fresh()->load('registration.batch', 'registration.paymentProofFile', 'registration.paymentForStage');
    }

    /**
     * @return array{originalAmount: float, discountPercent: int, discountAmount: float, amount: float, promoApplied: bool, promoCode: ?string}
     */
    private function paymentQuote(Registration $registration, ?string $promoCode): array
    {
        $originalAmount = round((float) $registration->batch->price, 2);
        $normalizedPromoCode = Str::upper(trim((string) $promoCode));
        $configuredPromoCode = Str::upper(trim((string) config('registration.promo.code')));
        $promoApplied = $normalizedPromoCode !== ''
            && $configuredPromoCode !== ''
            && hash_equals($configuredPromoCode, $normalizedPromoCode);

        if ($normalizedPromoCode !== '' && ! $promoApplied) {
            throw ValidationException::withMessages([
                'promo_code' => ['Kode promo tidak valid.'],
            ]);
        }

        $discountPercent = $promoApplied
            ? max(0, min(100, (int) config('registration.promo.discount_percent', 15)))
            : 0;
        $discountAmount = round($originalAmount * $discountPercent / 100, 2);
        $amount = max(0, round($originalAmount - $discountAmount, 2));

        return [
            'originalAmount' => $originalAmount,
            'discountPercent' => $discountPercent,
            'discountAmount' => $discountAmount,
            'amount' => $amount,
            'promoApplied' => $promoApplied,
            'promoCode' => $promoApplied ? $normalizedPromoCode : null,
        ];
    }

    public function submitForVerification(Team $team): Team
    {
        $registration = $this->registration($team);
        foreach (['team_completed_at' => 'team', 'members_completed_at' => 'members', 'documents_completed_at' => 'documents'] as $column => $field) {
            if ($registration->{$column} === null) {
                throw ValidationException::withMessages([$field => ['Tahap ini belum lengkap.']]);
            }
        }

        if ($registration->competition->type === Competition::TYPE_OLIMPIADE && $registration->payment_submitted_at === null) {
            throw ValidationException::withMessages(['payment' => ['Lengkapi pembayaran terlebih dahulu.']]);
        }

        DB::transaction(function () use ($team, $registration): void {
            $registration->update(['submitted_at' => $registration->submitted_at ?? now()]);
            $team->update([
                'status' => Team::STATUS_WAITING_VERIFICATION,
                'revision_step' => null,
                'verification_note' => null,
            ]);
        });

        return $team->fresh()->load('registration.competition', 'registration.batch', 'members');
    }

    private function registration(Team $team): Registration
    {
        $registration = $team->registration()->with('competition', 'batch')->first();
        if ($registration === null) {
            throw ValidationException::withMessages(['registration' => ['Tim belum memilih kompetisi.']]);
        }

        return $registration;
    }

    private function assertInstitutionMatchesCompetition(string $institutionName, Competition $competition): void
    {
        $institution = Str::lower(trim($institutionName));
        $isUniversityInstitution = collect([
            'universitas', 'university', 'institut', 'politeknik', 'akademi', 'sekolah tinggi', 'college',
        ])->contains(fn (string $keyword): bool => str_contains($institution, $keyword));
        $isHighSchoolInstitution = preg_match('/\b(sma|sman|smk|smkn|ma|man|mas)\b/u', $institution) === 1
            || str_contains($institution, 'madrasah aliyah');

        if ($competition->type === Competition::TYPE_BUSINESS_IT_CASE && ! $isUniversityInstitution) {
            throw ValidationException::withMessages([
                'institution_name' => ['Business IT Case hanya diperuntukkan bagi mahasiswa perguruan tinggi.'],
            ]);
        }

        if (in_array($competition->type, [Competition::TYPE_OLIMPIADE, Competition::TYPE_BUSINESS_PLAN], true)
            && ! $isHighSchoolInstitution) {
            throw ValidationException::withMessages([
                'institution_name' => ['Olimpiade dan Business Plan hanya diperuntukkan bagi siswa SMA, SMK, atau MA.'],
            ]);
        }
    }

    private function assertOwnedFile(Team $team, string $fileId, string $purpose, string $field): File
    {
        $file = File::query()->find($fileId);
        if ($file === null || $file->uploaded_by !== $team->id || $file->purpose !== $purpose) {
            throw ValidationException::withMessages([$field => ['File tidak valid atau bukan milik Team ini.']]);
        }

        return $file;
    }

    private function assertAdminMemberPhoto(Team $team, string $fileId, string $field): File
    {
        $file = File::query()->find($fileId);
        if ($file === null
            || $file->purpose !== 'MEMBER_PHOTO'
            || ($file->uploaded_by !== null && $file->uploaded_by !== $team->id)) {
            throw ValidationException::withMessages([$field => ['Foto member tidak valid atau bukan milik Team ini.']]);
        }

        return $file;
    }

    private function assertEditable(Team $team, Registration $registration, string $phase): void
    {
        if ($registration->submitted_at === null) {
            return;
        }

        if ($team->status === Team::STATUS_REVISION_REQUIRED && $team->revision_step === $phase) {
            return;
        }

        throw ValidationException::withMessages(['registration' => ['Pendaftaran sudah dikunci dan tidak dapat diubah pada tahap ini.']]);
    }

    private function resolveDataRevision(Team $team, string $phase): void
    {
        if ($team->status !== Team::STATUS_REVISION_REQUIRED || $team->revision_step !== $phase) {
            return;
        }

        $team->update([
            'status' => Team::STATUS_WAITING_VERIFICATION,
            'verified_at' => null,
            'verified_by' => null,
            'verification_note' => null,
            'revision_step' => null,
        ]);
    }
}
