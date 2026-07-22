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
use Illuminate\Validation\ValidationException;

class RegistrationService
{
    public function selectCompetition(Team $team, array $data): Registration
    {
        return DB::transaction(function () use ($team, $data): Registration {
            $existing = Registration::query()->where('team_id', $team->id)->lockForUpdate()->first();
            if ($existing !== null) {
                if ($existing->competition_id === $data['competition_id'] && $existing->batch_id === $data['batch_id']) {
                    return $existing;
                }

                throw ValidationException::withMessages(['batch_id' => ['Tim sudah terdaftar pada kompetisi lain.']]);
            }

            $batch = Batch::query()->with('competition')->whereKey($data['batch_id'])->lockForUpdate()->firstOrFail();
            if ($batch->competition_id !== $data['competition_id']) {
                throw ValidationException::withMessages(['batch_id' => ['Batch tidak terdaftar pada kompetisi yang dipilih.']]);
            }

            $competition = $batch->competition;
            if ($competition->status !== Competition::STATUS_REGISTRATION_OPEN) {
                throw ValidationException::withMessages(['competition_id' => ['Pendaftaran kompetisi belum dibuka.']]);
            }

            if ($batch->status !== BatchStatus::OPEN || now()->lt($batch->start_date) || now()->gt($batch->end_date)) {
                throw ValidationException::withMessages(['batch_id' => ['Batch tidak sedang menerima pendaftaran.']]);
            }

            if ($batch->quota !== null && $batch->current_registrations >= $batch->quota) {
                throw ValidationException::withMessages(['batch_id' => ['Kuota batch sudah penuh.']]);
            }

            $isOlympiad = $competition->type === Competition::TYPE_OLIMPIADE;
            $registration = Registration::query()->create([
                'competition_id' => $competition->id,
                'batch_id' => $batch->id,
                'team_id' => $team->id,
                'status' => $isOlympiad ? RegistrationStatus::WAITING_PAYMENT : RegistrationStatus::VERIFIED,
                'payment_required_at' => $isOlympiad ? now() : null,
                'payment_verified_at' => $isOlympiad ? null : now(),
            ]);

            $batch->increment('current_registrations');

            return $registration;
        });
    }

    public function updateTeamData(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        $this->assertEditable($team, $registration, 'TEAM');

        DB::transaction(function () use ($team, $data, $registration): void {
            $team->update(Arr::only($data, [
                'name', 'phone', 'school_name', 'school_address', 'school_province', 'school_city',
            ]));
            $registration->update(['team_completed_at' => $registration->team_completed_at ?? now()]);
            $this->resolveDataRevision($team, 'TEAM');
        });

        return $team->fresh()->load('registration.competition');
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
            Competition::TYPE_BUSINESS_PLAN, Competition::TYPE_BUSINESS_IT_CASE => [2, 3],
            default => throw ValidationException::withMessages(['members' => ['Tipe kompetisi tidak valid.']]),
        };

        $members = $data['members'];
        if (count($members) < $minimum || count($members) > $maximum) {
            throw ValidationException::withMessages(['members' => ["Jumlah anggota harus {$minimum} sampai {$maximum} orang."]]);
        }

        if (count(array_filter($members, fn (array $member): bool => $member['role'] === 'LEADER')) !== 1) {
            throw ValidationException::withMessages(['members' => ['Harus memiliki tepat satu ketua tim (LEADER).']]);
        }

        foreach ($members as $member) {
            if (! empty($member['photo_file_id'])) {
                $this->assertOwnedFile($team, $member['photo_file_id'], 'MEMBER_PHOTO', 'photo_file_id');
            }
        }

        DB::transaction(function () use ($team, $members, $registration): void {
            $keptIds = [];
            foreach (array_values($members) as $index => $payload) {
                $member = null;
                if (! empty($payload['id'])) {
                    $member = $team->members()->whereKey($payload['id'])->first();
                    if ($member === null) {
                        throw ValidationException::withMessages(['members' => ['Anggota tidak dimiliki oleh Team ini.']]);
                    }
                }

                $attributes = [
                    'name' => $payload['name'],
                    'role' => $payload['role'],
                    'email' => strtolower(trim($payload['email'])),
                    'phone' => $payload['phone'],
                    'education_level' => $payload['education_level'],
                    'major' => $payload['major'] ?? null,
                    'faculty' => $payload['faculty'] ?? null,
                    'student_id' => $payload['student_id'],
                    'birth_date' => $payload['birth_date'],
                    'photo_file_id' => $payload['photo_file_id'] ?? null,
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
            $registration->update(['members_completed_at' => now()]);
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
            $team->update([
                'document_url' => $data['document_url'],
                'twibbon_url' => $data['twibbon_url'],
            ]);
            $registration->update(['documents_completed_at' => now()]);

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

    public function submitPayment(Team $team, array $data): Team
    {
        $registration = $this->registration($team);
        if ($registration->team_completed_at === null || $registration->members_completed_at === null || $registration->documents_completed_at === null) {
            throw ValidationException::withMessages(['payment' => ['Lengkapi seluruh data pendaftaran terlebih dahulu.']]);
        }

        $paymentGateActive = $registration->competition->type === Competition::TYPE_OLIMPIADE || $registration->payment_for_stage_id !== null;
        if (! $paymentGateActive || ! in_array($registration->status, [RegistrationStatus::WAITING_PAYMENT, RegistrationStatus::REVISION_REQUIRED], true)) {
            if ($registration->payment_submitted_at !== null && $registration->payment_proof_file_id === $data['payment_proof_file_id']) {
                return $this->getPaymentData($team);
            }
            throw ValidationException::withMessages(['payment' => ['Pembayaran tidak tersedia pada tahap ini.']]);
        }

        $this->assertOwnedFile($team, $data['payment_proof_file_id'], 'PAYMENT_PROOF', 'payment_proof_file_id');

        DB::transaction(function () use ($team, $data, $registration): void {
            $registration->update([
                'payment_proof_file_id' => $data['payment_proof_file_id'],
                'amount_paid' => $registration->batch->price,
                'payment_method' => $data['payment_method'],
                'transaction_id' => $data['transaction_id'] ?? null,
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

    private function assertOwnedFile(Team $team, string $fileId, string $purpose, string $field): File
    {
        $file = File::query()->find($fileId);
        if ($file === null || $file->uploaded_by !== $team->id || $file->purpose !== $purpose) {
            throw ValidationException::withMessages([$field => ['File tidak valid atau bukan milik Team ini.']]);
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
