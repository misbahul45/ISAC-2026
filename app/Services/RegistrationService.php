<?php

namespace App\Services;

use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Member;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class RegistrationService
{
    public function selectCompetition(Team $team, array $data): Registration
    {
        return DB::transaction(function () use ($team, $data): Registration {
            $batch = Batch::query()
                ->where('id', $data['batch_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if ($batch->competition_id !== $data['competition_id']) {
                throw ValidationException::withMessages([
                    'batch_id' => ['Batch tidak terdaftar pada kompetisi yang dipilih.'],
                ]);
            }

            $competition = $batch->competition;

            if ($competition->status !== Competition::STATUS_REGISTRATION_OPEN) {
                throw ValidationException::withMessages([
                    'competition_id' => ['Pendaftaran kompetisi belum dibuka.'],
                ]);
            }

            if ($batch->status !== BatchStatus::OPEN) {
                throw ValidationException::withMessages([
                    'batch_id' => ['Batch belum dibuka.'],
                ]);
            }

            if ($batch->quota !== null && $batch->current_registrations >= $batch->quota) {
                throw ValidationException::withMessages([
                    'batch_id' => ['Kuota batch sudah penuh.'],
                ]);
            }

            if ($team->registration()->exists()) {
                throw ValidationException::withMessages([
                    'batch_id' => ['Tim sudah terdaftar pada kompetisi lain.'],
                ]);
            }

            $isOlimpiade = $competition->type === Competition::TYPE_OLIMPIADE;

            $registration = Registration::query()->create([
                'competition_id' => $data['competition_id'],
                'batch_id' => $data['batch_id'],
                'team_id' => $team->id,
                'status' => $isOlimpiade ? RegistrationStatus::WAITING_PAYMENT : RegistrationStatus::WAITING_VERIFICATION,
            ]);

            $batch->increment('current_registrations');

            return $registration;
        });
    }

    public function getTeamData(Team $team): Team
    {
        return $team;
    }

    public function updateTeamData(Team $team, array $data): Team
    {
        $registration = $team->registration;

        if ($registration === null) {
            throw ValidationException::withMessages([
                'team' => ['Tim belum memilih kompetisi.'],
            ]);
        }

        DB::transaction(function () use ($team, $data, $registration): void {
            $team->update([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'school_name' => $data['school_name'],
                'school_address' => $data['school_address'],
                'school_province' => $data['school_province'],
                'school_city' => $data['school_city'],
            ]);

            if ($registration->team_completed_at === null) {
                $registration->update(['team_completed_at' => now()]);
            }

            if ($team->status === Team::STATUS_REVISION_REQUIRED) {
                $team->update([
                    'status' => Team::STATUS_WAITING_VERIFICATION,
                    'verified_at' => null,
                    'verified_by' => null,
                ]);
            }
        });

        return $team->fresh();
    }

    public function getMembers(Team $team): Team
    {
        return $team->load('members');
    }

    public function finalizeMembers(Team $team, array $data): Team
    {
        $registration = $team->registration;

        if ($registration === null) {
            throw ValidationException::withMessages([
                'team' => ['Tim belum memilih kompetisi.'],
            ]);
        }

        if ($registration->team_completed_at === null) {
            throw ValidationException::withMessages([
                'team' => ['Lengkapi data tim terlebih dahulu.'],
            ]);
        }

        $competition = $registration->competition;

        $allowedCounts = match ($competition->type) {
            Competition::TYPE_OLIMPIADE => [1, 1],
            Competition::TYPE_BUSINESS_PLAN => [2, 3],
            Competition::TYPE_BUSINESS_IT_CASE => [2, 3],
            default => throw ValidationException::withMessages([
                'members' => ['Tipe kompetisi tidak valid.'],
            ]),
        };

        $memberCount = count($data['members']);
        if ($memberCount < $allowedCounts[0] || $memberCount > $allowedCounts[1]) {
            throw ValidationException::withMessages([
                'members' => ['Jumlah anggota tidak sesuai ketentuan kompetisi.'],
            ]);
        }

        $leaders = array_filter($data['members'], fn (array $m): bool => ($m['role'] ?? '') === 'LEADER');
        if (count($leaders) !== 1) {
            throw ValidationException::withMessages([
                'members' => ['Harus memiliki tepat satu ketua tim (LEADER).'],
            ]);
        }

        DB::transaction(function () use ($team, $data, $registration): void {
            $team->members()->delete();

            $membersData = array_map(fn (int $i, array $m): array => [
                'id' => (string) Str::uuid(),
                'team_id' => $team->id,
                'name' => $m['name'],
                'role' => $m['role'],
                'email' => $m['email'],
                'phone' => $m['phone'],
                'major' => $m['major'],
                'faculty' => $m['faculty'],
                'student_id' => $m['studentId'] ?? '',
                'birth_date' => $m['birthDate'] ?? null,
                'education_level' => $m['educationLevel'] ?? null,
                'photo_file_id' => $m['photoFileId'] ?? null,
                'sort_order' => $i + 1,
            ], array_keys($data['members']), array_values($data['members']));

            Member::query()->insert($membersData);

            if ($registration->members_completed_at === null) {
                $registration->update(['members_completed_at' => now()]);
            }
        });

        return $team->fresh()->load('members');
    }

    public function getDocuments(Team $team): Team
    {
        return $team;
    }

    public function updateDocuments(Team $team, array $data): Team
    {
        $registration = $team->registration;

        if ($registration === null) {
            throw ValidationException::withMessages([
                'team' => ['Tim belum memilih kompetisi.'],
            ]);
        }

        $competition = $registration->competition;

        DB::transaction(function () use ($team, $data, $registration, $competition): void {
            $team->update([
                'document_url' => $data['documentUrl'],
                'twibbon_url' => $data['twibbonUrl'],
            ]);

            if ($registration->documents_completed_at === null) {
                $registration->update(['documents_completed_at' => now()]);
            }

            if ($competition->type !== Competition::TYPE_OLIMPIADE) {
                $registration->update(['submitted_at' => now()]);
                $team->update(['status' => Team::STATUS_WAITING_VERIFICATION]);
            }
        });

        return $team->fresh();
    }

    public function getPaymentData(Team $team): Team
    {
        return $team->load('registration.batch');
    }

    public function submitPayment(Team $team, array $data): Team
    {
        $registration = $team->registration;

        if ($registration === null) {
            throw ValidationException::withMessages([
                'team' => ['Tim belum memilih kompetisi.'],
            ]);
        }

        if ($registration->payment_submitted_at !== null) {
            throw ValidationException::withMessages([
                'payment' => ['Pembayaran sudah pernah dikirim.'],
            ]);
        }

        $batch = $registration->batch;

        DB::transaction(function () use ($team, $data, $registration, $batch): void {
            $registration->update([
                'payment_proof_file_id' => $data['paymentProofFileId'],
                'amount_paid' => $batch->price,
                'payment_submitted_at' => now(),
                'status' => RegistrationStatus::WAITING_VERIFICATION,
            ]);

            if ($registration->submitted_at === null) {
                $registration->update(['submitted_at' => now()]);
                $team->update(['status' => Team::STATUS_WAITING_VERIFICATION]);
            }
        });

        return $team->fresh()->load('registration.batch');
    }

    public function getSummary(Team $team): Team
    {
        return $team;
    }

    public function submitForVerification(Team $team): Team
    {
        $registration = $team->registration;

        if ($registration === null) {
            throw ValidationException::withMessages([
                'team' => ['Tim belum memilih kompetisi.'],
            ]);
        }

        if ($registration->team_completed_at === null) {
            throw ValidationException::withMessages([
                'team' => ['Lengkapi data tim terlebih dahulu.'],
            ]);
        }

        if ($registration->members_completed_at === null) {
            throw ValidationException::withMessages([
                'members' => ['Lengkapi data anggota terlebih dahulu.'],
            ]);
        }

        if ($registration->documents_completed_at === null) {
            throw ValidationException::withMessages([
                'documents' => ['Lengkapi dokumen terlebih dahulu.'],
            ]);
        }

        $competition = $registration->competition;

        if ($competition->type === Competition::TYPE_OLIMPIADE && $registration->payment_submitted_at === null) {
            throw ValidationException::withMessages([
                'payment' => ['Lengkapi pembayaran terlebih dahulu.'],
            ]);
        }

        DB::transaction(function () use ($team, $registration): void {
            if ($registration->submitted_at === null) {
                $registration->update(['submitted_at' => now()]);
            }

            $registration->update(['status' => RegistrationStatus::WAITING_VERIFICATION]);
            $team->update(['status' => Team::STATUS_WAITING_VERIFICATION]);
        });

        return $team->fresh();
    }
}
