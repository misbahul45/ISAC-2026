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
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminRegistrationService
{
    public function __construct(private readonly RegistrationService $registrationService) {}

    /** @param array<string, mixed> $filters */
    public function payments(array $filters, int $perPage = 15): LengthAwarePaginator
    {
        return $this->paymentQuery()
            ->when($filters['search'] ?? null, function (Builder $query, string $search): void {
                $query->whereHas('team', function (Builder $team) use ($search): void {
                    $team->where(function (Builder $values) use ($search): void {
                        $like = "%{$search}%";
                        $values->where('code', 'like', $like)
                            ->orWhere('name', 'like', $like)
                            ->orWhere('email', 'like', $like)
                            ->orWhere('institution_name', 'like', $like);
                    });
                });
            })
            ->when($filters['status'] ?? null, fn (Builder $query, string $status) => $query->where('status', $status))
            ->when($filters['competition_id'] ?? null, fn (Builder $query, string $id) => $query->where('competition_id', $id))
            ->when($filters['batch_id'] ?? null, fn (Builder $query, string $id) => $query->where('batch_id', $id))
            ->when($filters['payment_method'] ?? null, fn (Builder $query, string $method) => $query->where('payment_method', $method))
            ->orderByRaw("CASE status WHEN 'WAITING_VERIFICATION' THEN 1 WHEN 'REVISION_REQUIRED' THEN 2 WHEN 'WAITING_PAYMENT' THEN 3 WHEN 'REJECTED' THEN 4 WHEN 'VERIFIED' THEN 5 WHEN 'CANCELLED' THEN 6 ELSE 7 END")
            ->orderByRaw('COALESCE(payment_submitted_at, payment_required_at, created_at) DESC')
            ->paginate(min(max($perPage, 1), 100));
    }

    public function paymentDetail(Registration $registration): Registration
    {
        abort_unless($this->paymentQuery()->whereKey($registration->id)->exists(), 404);

        return $this->loadPayment($registration);
    }

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

    /**
     * Apply an Admin correction to the complete registration payload.
     *
     * @param  array<string, mixed>  $data
     */
    public function updateTeamRegistration(Admin $admin, Team $team, array $data, ?string $requestId): Team
    {
        return DB::transaction(function () use ($admin, $team, $data, $requestId): Team {
            $team = Team::query()->lockForUpdate()->findOrFail($team->id);
            $before = $this->registrationSnapshot($team);
            $updated = $this->registrationService->updateByAdmin($team, $data);
            $after = $this->registrationSnapshot($updated);

            $this->audit(
                $admin,
                'team.registration_updated',
                $updated,
                $before,
                $after,
                $data['reason'] ?? null,
                $requestId,
            );

            return $this->detail($updated);
        });
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
        return DB::transaction(function () use ($admin, $registration, $requestId): Registration {
            $registration = Registration::query()->lockForUpdate()->findOrFail($registration->id);
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

            return $this->loadPayment($registration->fresh());
        });
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
                    'promo_code' => null,
                    'discount_percent' => 0,
                    'discount_amount' => 0,
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
        return DB::transaction(function () use ($admin, $registration, $status, $note, $action, $requestId): Registration {
            $registration = Registration::query()->lockForUpdate()->findOrFail($registration->id);
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

            return $this->loadPayment($registration->fresh());
        });
    }

    private function paymentQuery(): Builder
    {
        return Registration::query()
            ->with([
                'team.currentStage',
                'competition',
                'batch',
                'paymentProofFile',
                'paymentVerifiedBy',
                'paymentForStage',
            ])
            ->where(function (Builder $query): void {
                $query->whereHas('competition', fn (Builder $competition) => $competition->where('payment_flow', Competition::PAYMENT_UPFRONT))
                    ->orWhereNotNull('payment_required_at');
            });
    }

    private function loadPayment(Registration $registration): Registration
    {
        return $registration->load([
            'team.currentStage',
            'competition',
            'batch',
            'paymentProofFile',
            'paymentVerifiedBy',
            'paymentForStage',
        ]);
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

    private function registrationSnapshot(Team $team): array
    {
        $snapshot = $team->fresh()->load([
            'members' => fn ($query) => $query->orderBy('sort_order'),
            'registration',
        ]);

        return [
            'team' => Arr::only($snapshot->toArray(), [
                'id', 'code', 'email', 'name', 'phone', 'institution_name', 'institution_address',
                'document_url', 'twibbon_url', 'status', 'verification_note', 'revision_step',
            ]),
            'members' => $snapshot->members
                ->map(fn ($member): array => Arr::only($member->toArray(), [
                    'id', 'name', 'role', 'email', 'major', 'faculty', 'student_id', 'photo_file_id', 'sort_order',
                ]))
                ->values()
                ->all(),
            'registration' => $snapshot->registration === null
                ? null
                : Arr::only($snapshot->registration->toArray(), [
                    'id', 'competition_id', 'batch_id', 'status', 'team_completed_at', 'members_completed_at',
                    'documents_completed_at', 'submitted_at', 'payment_required_at', 'payment_submitted_at',
                ]),
        ];
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
