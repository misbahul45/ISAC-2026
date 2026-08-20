<?php

namespace App\Jobs;

use App\Models\AdminOperation;
use App\Services\AdminOperationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ProcessAdminOperationJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public function __construct(public readonly string $operationId) {}

    public function backoff(): array
    {
        return [60, 300, 900];
    }

    public function handle(AdminOperationService $service): void
    {
        $operation = AdminOperation::query()->find($this->operationId);

        if ($operation !== null) {
            $service->process($operation);
        }
    }

    public function failed(\Throwable $exception): void
    {
        AdminOperation::query()
            ->whereKey($this->operationId)
            ->whereNotIn('status', [AdminOperation::STATUS_COMPLETED, AdminOperation::STATUS_PARTIAL])
            ->update(['status' => AdminOperation::STATUS_FAILED, 'completed_at' => now()]);
    }
}
