<?php

namespace App\Services;

use App\Jobs\ProcessAdminOperationJob;
use App\Jobs\SyncSpreadsheetIntegrationEventJob;
use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\AdminOperation;
use App\Models\AdminOperationItem;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\SpreadsheetIntegrationEvent;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AdminOperationService
{
    public function __construct(private readonly AdminRegistrationService $registrationService) {}

    /**
     * @param array<string, mixed> $data
     */
    public function create(Admin $admin, array $data, ?string $idempotencyKey): AdminOperation
    {
        $teamIds = array_values(array_unique($data['team_ids']));
        sort($teamIds);
        $requestHash = hash('sha256', json_encode([
            'action' => $data['action'],
            'team_ids' => $teamIds,
            'target_stage_id' => $data['target_stage_id'] ?? null,
            'announcement' => $data['announcement'] ?? null,
            'sync_spreadsheet' => $data['sync_spreadsheet'] ?? true,
        ], JSON_THROW_ON_ERROR));

        return DB::transaction(function () use ($admin, $data, $idempotencyKey, $teamIds, $requestHash): AdminOperation {
            if ($idempotencyKey !== null && $idempotencyKey !== '') {
                $existing = AdminOperation::query()
                    ->where('requested_by', $admin->id)
                    ->where('idempotency_key', $idempotencyKey)
                    ->lockForUpdate()
                    ->first();

                if ($existing !== null) {
                    if (! hash_equals($existing->request_hash, $requestHash)) {
                        throw ValidationException::withMessages([
                            'idempotency' => ['Idempotency-Key sudah dipakai untuk payload yang berbeda.'],
                        ]);
                    }

                    return $existing->load('items.integrationEvent', 'targetStage', 'requestedBy');
                }
            }

            $teams = Team::query()->whereIn('id', $teamIds)->pluck('id')->all();

            if (count($teams) !== count($teamIds)) {
                throw ValidationException::withMessages(['team_ids' => ['Satu atau lebih Team tidak ditemukan.']]);
            }

            $targetStageId = $data['target_stage_id'] ?? null;
            if ($data['action'] === AdminOperation::ACTION_ADVANCE_STAGE && $targetStageId === null) {
                throw ValidationException::withMessages(['target_stage_id' => ['Target Stage wajib dipilih.']]);
            }

            if ($targetStageId !== null) {
                $targetStage = Stage::query()->find($targetStageId);

                if ($targetStage === null) {
                    throw ValidationException::withMessages(['target_stage_id' => ['Target Stage tidak ditemukan.']]);
                }

                $invalidTeam = Team::query()
                    ->whereIn('id', $teamIds)
                    ->whereHas('registration', fn ($query) => $query->where('competition_id', '!=', $targetStage->competition_id))
                    ->exists();

                if ($invalidTeam) {
                    throw ValidationException::withMessages(['target_stage_id' => ['Target Stage harus berasal dari Competition Team yang dipilih.']]);
                }
            }

            $announcement = $data['announcement'] ?? [];
            $operation = AdminOperation::query()->create([
                'requested_by' => $admin->id,
                'target_stage_id' => $targetStageId,
                'action' => $data['action'],
                'status' => AdminOperation::STATUS_PENDING,
                'idempotency_key' => $idempotencyKey ?: null,
                'request_hash' => $requestHash,
                'total_items' => count($teamIds),
                'announcement_title' => $announcement['title'] ?? null,
                'announcement_template' => $announcement['template'] ?? null,
                'metadata' => [
                    'sync_spreadsheet' => (bool) ($data['sync_spreadsheet'] ?? true),
                    'send_notification' => (bool) ($announcement['send_notification'] ?? false),
                    'announcement_message' => $announcement['message'] ?? null,
                    'request_id' => $data['request_id'] ?? null,
                ],
            ]);

            foreach ($teamIds as $teamId) {
                $operation->items()->create([
                    'team_id' => $teamId,
                    'processing_status' => AdminOperation::STATUS_PENDING,
                    'spreadsheet_status' => SpreadsheetIntegrationEvent::STATUS_PENDING,
                ]);
            }

            return $operation->load('items.integrationEvent', 'targetStage', 'requestedBy');
        });
    }

    public function queue(AdminOperation $operation): void
    {
        ProcessAdminOperationJob::dispatch($operation->id)->afterCommit();
    }

    public function process(AdminOperation $operation): void
    {
        $operation = DB::transaction(function () use ($operation): ?AdminOperation {
            $locked = AdminOperation::query()
                ->with('requestedBy', 'targetStage')
                ->lockForUpdate()
                ->find($operation->id);

            if ($locked === null || in_array($locked->status, [AdminOperation::STATUS_PROCESSING, AdminOperation::STATUS_COMPLETED, AdminOperation::STATUS_PARTIAL], true)) {
                return null;
            }

            $locked->update([
                'status' => AdminOperation::STATUS_PROCESSING,
                'started_at' => $locked->started_at ?? now(),
            ]);

            return $locked->fresh(['requestedBy', 'targetStage']);
        });

        if ($operation === null) {
            return;
        }

        $itemIds = $operation->items()
            ->whereNotIn('processing_status', ['COMPLETED', 'SKIPPED'])
            ->pluck('id');

        foreach ($itemIds as $itemId) {
            try {
                $this->processItem($operation, $itemId);
            } catch (\Throwable $exception) {
                $this->markItemFailed($itemId, $exception);
            }
        }

        $this->refreshOperation($operation);
        try {
            $this->retrySpreadsheet($operation);
        } catch (\Throwable $exception) {
            report($exception);
        }
    }

    public function retrySpreadsheet(AdminOperation $operation): int
    {
        $events = $operation->integrationEvents()
            ->whereIn('status', [
                SpreadsheetIntegrationEvent::STATUS_PENDING,
                SpreadsheetIntegrationEvent::STATUS_FAILED,
            ])
            ->get();

        foreach ($events as $event) {
            SyncSpreadsheetIntegrationEventJob::dispatch($event->event_id);
        }

        return $events->count();
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return AdminOperation::query()
            ->with('requestedBy', 'targetStage')
            ->latest()
            ->paginate(min(max($perPage, 1), 100));
    }

    public function detail(AdminOperation $operation): AdminOperation
    {
        return $operation->load([
            'requestedBy',
            'targetStage',
            'items.team.registration.competition',
            'items.team.registration.batch',
            'items.team.currentStage',
            'items.integrationEvent',
        ]);
    }

    private function processItem(AdminOperation $operation, string $itemId): void
    {
        DB::transaction(function () use ($operation, $itemId): void {
            $item = AdminOperationItem::query()->lockForUpdate()->findOrFail($itemId);

            if (in_array($item->processing_status, ['PROCESSING', 'COMPLETED', 'SKIPPED'], true)) {
                return;
            }

            $item->update([
                'processing_status' => 'PROCESSING',
                'last_error' => null,
            ]);

            $team = Team::query()
                ->with(['registration.competition', 'registration.batch', 'registration.paymentForStage', 'currentStage'])
                ->lockForUpdate()
                ->find($item->team_id);

            if ($team === null) {
                $item->update([
                    'processing_status' => 'FAILED',
                    'last_error' => 'Team tidak ditemukan.',
                    'processed_at' => now(),
                ]);

                return;
            }

            $before = $this->snapshot($team);
            $outcome = $this->applyAction($operation, $team);
            $freshTeam = $this->loadTeam($team->id);
            $after = $this->snapshot($freshTeam);

            if ($outcome === 'SKIPPED') {
                $item->update([
                    'status_before' => $this->statusFor($operation, $before),
                    'status_after' => $this->statusFor($operation, $after),
                    'processing_status' => 'SKIPPED',
                    'spreadsheet_status' => SpreadsheetIntegrationEvent::STATUS_SKIPPED,
                    'processed_at' => now(),
                ]);

                return;
            }

            $eventId = "operation:{$operation->id}:team:{$team->id}";
            $payload = $this->eventPayload($operation, $freshTeam, $before, $after, $eventId);
            $syncEnabled = (bool) data_get($operation->metadata, 'sync_spreadsheet', true);
            $notify = (bool) data_get($operation->metadata, 'send_notification', false);

            $event = SpreadsheetIntegrationEvent::query()->firstOrCreate(
                ['event_id' => $eventId],
                [
                    'operation_id' => $operation->id,
                    'operation_item_id' => $item->id,
                    'team_id' => $freshTeam->id,
                    'action' => $operation->action,
                    'payload' => $payload,
                    'status' => $syncEnabled
                        ? SpreadsheetIntegrationEvent::STATUS_PENDING
                        : SpreadsheetIntegrationEvent::STATUS_SKIPPED,
                    'email_status' => $notify ? 'PENDING' : 'NOT_REQUESTED',
                ],
            );

            $item->update([
                'event_id' => $event->event_id,
                'status_before' => $this->statusFor($operation, $before),
                'status_after' => $this->statusFor($operation, $after),
                'processing_status' => 'COMPLETED',
                'spreadsheet_status' => $event->status,
                'last_error' => null,
                'processed_at' => now(),
            ]);

        });
    }

    private function applyAction(AdminOperation $operation, Team $team): string
    {
        $admin = $operation->requestedBy;
        $requestId = data_get($operation->metadata, 'request_id');
        $registration = $team->registration;

        return match ($operation->action) {
            AdminOperation::ACTION_VERIFY_TEAM => $this->verifyTeam($admin, $team, $requestId),
            AdminOperation::ACTION_VERIFY_PAYMENT => $this->verifyPayment($admin, $registration, $requestId),
            AdminOperation::ACTION_ADVANCE_STAGE => $this->advanceStage($admin, $team, $operation->targetStage, $requestId),
            AdminOperation::ACTION_ANNOUNCE_RESULT => $this->announce($admin, $team, $operation, $requestId),
            default => throw ValidationException::withMessages(['action' => ['Aksi operation tidak valid.']]),
        };
    }

    private function verifyTeam(Admin $admin, Team $team, ?string $requestId): string
    {
        if ($team->status === Team::STATUS_VERIFIED) {
            return 'SKIPPED';
        }

        $this->registrationService->verifyTeam($admin, $team, $requestId);

        return 'COMPLETED';
    }

    private function verifyPayment(Admin $admin, ?Registration $registration, ?string $requestId): string
    {
        if ($registration === null) {
            throw ValidationException::withMessages(['payment' => ['Registration Team tidak ditemukan.']]);
        }
        if ($registration->status === RegistrationStatus::VERIFIED) {
            return 'SKIPPED';
        }

        $this->registrationService->verifyPayment($admin, $registration, $requestId);

        return 'COMPLETED';
    }

    private function advanceStage(Admin $admin, Team $team, ?Stage $stage, ?string $requestId): string
    {
        if ($stage === null) {
            throw ValidationException::withMessages(['stage' => ['Target Stage tidak ditemukan.']]);
        }
        if ($team->current_stage_id === $stage->id) {
            return 'SKIPPED';
        }

        $this->registrationService->advanceStage($admin, $team, $stage, $requestId);

        return 'COMPLETED';
    }

    private function announce(Admin $admin, Team $team, AdminOperation $operation, ?string $requestId): string
    {
        AdminAuditLog::query()->create([
            'admin_id' => $admin->id,
            'action' => 'competition.result_announced',
            'subject_type' => Team::class,
            'subject_id' => $team->id,
            'before_data' => $this->snapshot($team),
            'after_data' => $this->snapshot($team),
            'reason' => $operation->announcement_title,
            'request_id' => $requestId,
            'created_at' => now(),
        ]);

        return 'COMPLETED';
    }

    private function markItemFailed(string $itemId, \Throwable $exception): void
    {
        AdminOperationItem::query()
            ->whereKey($itemId)
            ->update([
                'processing_status' => 'FAILED',
                'last_error' => str($exception->getMessage())->limit(2000)->toString(),
                'processed_at' => now(),
            ]);
    }

    private function refreshOperation(AdminOperation $operation): void
    {
        DB::transaction(function () use ($operation): void {
            $locked = AdminOperation::query()->lockForUpdate()->findOrFail($operation->id);
            $items = $locked->items()->selectRaw('processing_status, count(*) as total')->groupBy('processing_status')->pluck('total', 'processing_status');

            $success = (int) ($items['COMPLETED'] ?? 0);
            $skipped = (int) ($items['SKIPPED'] ?? 0);
            $failed = (int) ($items['FAILED'] ?? 0);
            $processed = $success + $skipped + $failed;
            $status = $failed > 0
                ? ($success + $skipped > 0 ? AdminOperation::STATUS_PARTIAL : AdminOperation::STATUS_FAILED)
                : AdminOperation::STATUS_COMPLETED;

            $locked->update([
                'status' => $status,
                'processed_items' => $processed,
                'success_count' => $success,
                'skipped_count' => $skipped,
                'failed_count' => $failed,
                'completed_at' => now(),
            ]);
        });
    }

    /** @return array<string, mixed> */
    private function snapshot(Team $team): array
    {
        $registration = $team->registration;

        return [
            'team_status' => $team->status,
            'registration_status' => $registration?->status?->value,
            'current_stage' => $team->currentStage?->name,
            'payment_for_stage' => $registration?->paymentForStage?->name,
        ];
    }

    private function statusFor(AdminOperation $operation, array $snapshot): ?string
    {
        return match ($operation->action) {
            AdminOperation::ACTION_VERIFY_TEAM => $snapshot['team_status'],
            AdminOperation::ACTION_VERIFY_PAYMENT => $snapshot['registration_status'],
            AdminOperation::ACTION_ADVANCE_STAGE => $snapshot['payment_for_stage'] ?? $snapshot['current_stage'],
            default => $snapshot['current_stage'] ?? $snapshot['team_status'],
        };
    }

    /** @return array<string, mixed> */
    private function eventPayload(AdminOperation $operation, Team $team, array $before, array $after, string $eventId): array
    {
        $registration = $team->registration;
        $announcement = [
            'title' => $operation->announcement_title ?: $this->defaultAnnouncementTitle($operation),
            'template' => $operation->announcement_template ?: strtolower($operation->action),
            'message' => data_get($operation->metadata, 'announcement_message') ?: $this->defaultAnnouncementMessage($operation, $team),
        ];

        return [
            'eventId' => $eventId,
            'operationId' => $operation->id,
            'team' => [
                'id' => $team->id,
                'code' => $team->code,
                'name' => $team->name,
                'email' => $team->email,
            ],
            'competition' => [
                'id' => $registration?->competition?->id,
                'type' => $registration?->competition?->type,
                'name' => $registration?->competition?->name,
                'batch' => $registration?->batch?->name,
            ],
            'currentStage' => $after['payment_for_stage'] ?? $after['current_stage'] ?? 'REGISTRATION',
            'action' => $operation->action,
            'statusBefore' => $this->statusFor($operation, $before),
            'statusAfter' => $this->statusFor($operation, $after),
            'announcement' => $announcement,
            'requestedBy' => $operation->requestedBy->name,
            'requestedAt' => now()->toISOString(),
        ];
    }

    private function defaultAnnouncementTitle(AdminOperation $operation): string
    {
        return match ($operation->action) {
            AdminOperation::ACTION_VERIFY_TEAM => 'Verifikasi Data Team',
            AdminOperation::ACTION_VERIFY_PAYMENT => 'Verifikasi Pembayaran',
            AdminOperation::ACTION_ADVANCE_STAGE => 'Pengumuman Kelolosan Tahap',
            default => 'Pengumuman Hasil ISAC 2026',
        };
    }

    private function defaultAnnouncementMessage(AdminOperation $operation, Team $team): string
    {
        return match ($operation->action) {
            AdminOperation::ACTION_VERIFY_TEAM => "Data Team {$team->name} telah diverifikasi oleh panitia ISAC 2026.",
            AdminOperation::ACTION_VERIFY_PAYMENT => "Pembayaran Team {$team->name} telah diverifikasi oleh panitia ISAC 2026.",
            AdminOperation::ACTION_ADVANCE_STAGE => "Selamat, Team {$team->name} diproses ke tahap berikutnya ISAC 2026.",
            default => "Terdapat pengumuman hasil kompetisi untuk Team {$team->name}.",
        };
    }

    private function loadTeam(string $teamId): Team
    {
        return Team::query()
            ->with(['registration.competition', 'registration.batch', 'registration.paymentForStage', 'currentStage'])
            ->findOrFail($teamId);
    }
}
