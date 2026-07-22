<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminRegistrationService
{
    public function teams(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return Team::query()
            ->with('registration.competition', 'registration.batch', 'currentStage')
            ->when($filters['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->when($filters['competition_id'] ?? null, fn ($query, $id) => $query->whereHas('registration', fn ($registration) => $registration->where('competition_id', $id)))
            ->when($filters['batch_id'] ?? null, fn ($query, $id) => $query->whereHas('registration', fn ($registration) => $registration->where('batch_id', $id)))
            ->latest()
            ->paginate(min(max($perPage, 1), 100));
    }

    public function detail(Team $team): Team
    {
        return $team->load('members', 'registration.competition', 'registration.batch', 'registration.paymentProofFile', 'currentStage');
    }

    public function verifyTeam(Admin $admin, Team $team, ?string $requestId): Team
    {
        if ($team->status === Team::STATUS_VERIFIED) {
            return $this->detail($team);
        }
        if ($team->status !== Team::STATUS_WAITING_VERIFICATION) {
            throw ValidationException::withMessages(['team' => ['Team tidak sedang menunggu verifikasi data.']]);
        }

        DB::transaction(function () use ($admin, $team, $requestId): void {
            $before = $team->toArray();
            $team->update([
                'status' => Team::STATUS_VERIFIED,
                'verified_by' => $admin->id,
                'verified_at' => now(),
                'verification_note' => null,
                'revision_step' => null,
            ]);
            $this->activateIfEligible($team);
            $this->audit($admin, 'team.verify', $team, $before, $team->fresh()->toArray(), null, $requestId);
        });

        return $this->detail($team->fresh());
    }

    public function reviseTeam(Admin $admin, Team $team, string $step, string $note, ?string $requestId): Team
    {
        if ($team->status === Team::STATUS_REVISION_REQUIRED && $team->revision_step === $step && $team->verification_note === $note) {
            return $this->detail($team);
        }
        if ($team->status !== Team::STATUS_WAITING_VERIFICATION) {
            throw ValidationException::withMessages(['team' => ['Team tidak sedang menunggu verifikasi data.']]);
        }

        DB::transaction(function () use ($admin, $team, $step, $note, $requestId): void {
            $before = $team->toArray();
            $team->update([
                'status' => Team::STATUS_REVISION_REQUIRED,
                'revision_step' => $step,
                'verification_note' => $note,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);
            $this->audit($admin, 'team.revision_requested', $team, $before, $team->fresh()->toArray(), $note, $requestId);
        });

        return $this->detail($team->fresh());
    }

    public function rejectTeam(Admin $admin, Team $team, string $note, ?string $requestId): Team
    {
        if ($team->status === Team::STATUS_REJECTED && $team->verification_note === $note) {
            return $this->detail($team);
        }
        if ($team->status !== Team::STATUS_WAITING_VERIFICATION) {
            throw ValidationException::withMessages(['team' => ['Team tidak sedang menunggu verifikasi data.']]);
        }

        DB::transaction(function () use ($admin, $team, $note, $requestId): void {
            $before = $team->toArray();
            $team->update([
                'status' => Team::STATUS_REJECTED,
                'revision_step' => null,
                'verification_note' => $note,
                'verified_by' => $admin->id,
                'verified_at' => now(),
            ]);
            $this->audit($admin, 'team.rejected', $team, $before, $team->fresh()->toArray(), $note, $requestId);
        });

        return $this->detail($team->fresh());
    }

    public function verifyPayment(Admin $admin, Registration $registration, ?string $requestId): Registration
    {
        if ($registration->status === RegistrationStatus::VERIFIED) {
            return $registration->fresh();
        }
        if ($registration->status !== RegistrationStatus::WAITING_VERIFICATION || $registration->payment_proof_file_id === null) {
            throw ValidationException::withMessages(['payment' => ['Pembayaran tidak sedang menunggu verifikasi.']]);
        }

        DB::transaction(function () use ($admin, $registration, $requestId): void {
            $before = $registration->toArray();
            $registration->update([
                'status' => RegistrationStatus::VERIFIED,
                'payment_verified_by' => $admin->id,
                'payment_verified_at' => now(),
                'paid_at' => now(),
                'payment_rejection_reason' => null,
            ]);

            $team = $registration->team;
            if ($registration->payment_for_stage_id !== null) {
                $team->update(['current_stage_id' => $registration->payment_for_stage_id]);
                $registration->update(['payment_for_stage_id' => null]);
            } else {
                $this->activateIfEligible($team);
            }
            $this->audit($admin, 'payment.verify', $registration, $before, $registration->fresh()->toArray(), null, $requestId);
        });

        return $registration->fresh()->load('team', 'paymentProofFile');
    }

    public function revisePayment(Admin $admin, Registration $registration, string $note, ?string $requestId): Registration
    {
        return $this->setPaymentStatus($admin, $registration, RegistrationStatus::REVISION_REQUIRED, $note, 'payment.revision_requested', $requestId);
    }

    public function rejectPayment(Admin $admin, Registration $registration, string $note, ?string $requestId): Registration
    {
        return $this->setPaymentStatus($admin, $registration, RegistrationStatus::REJECTED, $note, 'payment.rejected', $requestId);
    }

    public function advanceStage(Admin $admin, Team $team, Stage $stage, ?string $requestId): Team
    {
        $registration = $team->registration()->with('competition')->firstOrFail();
        if ($stage->competition_id !== $registration->competition_id) {
            throw ValidationException::withMessages(['stage' => ['Stage bukan milik Competition Team.']]);
        }
        if ($team->status !== Team::STATUS_VERIFIED || $registration->status !== RegistrationStatus::VERIFIED) {
            throw ValidationException::withMessages(['stage' => ['Team dan pembayaran harus terverifikasi sebelum pindah Stage.']]);
        }

        $currentStage = $team->currentStage()->first();
        if ($currentStage?->is($stage)) {
            return $this->detail($team);
        }
        if ((int) $stage->order !== ((int) ($currentStage?->order ?? 0)) + 1) {
            throw ValidationException::withMessages(['stage' => ['Stage harus diproses berurutan.']]);
        }

        DB::transaction(function () use ($admin, $team, $stage, $registration, $requestId): void {
            $before = $team->toArray();
            $needsSemifinalPayment = $registration->competition->payment_flow === Competition::PAYMENT_SEMIFINAL
                && str_contains(strtolower($stage->name), 'semifinal');

            if ($needsSemifinalPayment) {
                $registration->update([
                    'status' => RegistrationStatus::WAITING_PAYMENT,
                    'payment_required_at' => now(),
                    'payment_for_stage_id' => $stage->id,
                    'payment_proof_file_id' => null,
                    'payment_submitted_at' => null,
                    'payment_verified_by' => null,
                    'payment_verified_at' => null,
                    'paid_at' => null,
                    'amount_paid' => 0,
                ]);
            } else {
                $team->update(['current_stage_id' => $stage->id]);
            }

            $this->audit($admin, 'stage.advance', $team, $before, $team->fresh()->toArray(), null, $requestId);
        });

        return $this->detail($team->fresh());
    }

    private function setPaymentStatus(Admin $admin, Registration $registration, RegistrationStatus $status, string $note, string $action, ?string $requestId): Registration
    {
        if ($registration->status === $status && $registration->payment_rejection_reason === $note) {
            return $registration->fresh()->load('team', 'paymentProofFile');
        }
        if ($registration->status !== RegistrationStatus::WAITING_VERIFICATION || $registration->payment_proof_file_id === null) {
            throw ValidationException::withMessages(['payment' => ['Pembayaran tidak sedang menunggu verifikasi.']]);
        }

        DB::transaction(function () use ($admin, $registration, $status, $note, $action, $requestId): void {
            $before = $registration->toArray();
            $registration->update([
                'status' => $status,
                'payment_rejection_reason' => $note,
                'payment_verified_by' => $admin->id,
                'payment_verified_at' => now(),
            ]);
            $this->audit($admin, $action, $registration, $before, $registration->fresh()->toArray(), $note, $requestId);
        });

        return $registration->fresh()->load('team', 'paymentProofFile');
    }

    private function activateIfEligible(Team $team): void
    {
        $registration = $team->registration()->with('competition')->first();
        if ($registration === null || $registration->submitted_at === null || $team->status !== Team::STATUS_VERIFIED || $registration->status !== RegistrationStatus::VERIFIED) {
            return;
        }

        if ($team->current_stage_id === null) {
            $stageId = Stage::query()->where('competition_id', $registration->competition_id)->where('is_active', true)->orderBy('order')->value('id');
            if ($stageId !== null) {
                $team->update(['current_stage_id' => $stageId]);
            }
        }
    }

    private function audit(Admin $admin, string $action, Team|Registration $subject, array $before, array $after, ?string $reason, ?string $requestId): void
    {
        AdminAuditLog::query()->create([
            'admin_id' => $admin->id,
            'action' => $action,
            'subject_type' => $subject::class,
            'subject_id' => $subject->id,
            'before_data' => $before,
            'after_data' => $after,
            'reason' => $reason,
            'request_id' => $requestId,
            'created_at' => now(),
        ]);
    }
}
