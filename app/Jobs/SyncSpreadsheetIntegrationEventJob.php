<?php

namespace App\Jobs;

use App\Models\SpreadsheetIntegrationEvent;
use App\Services\Integrations\SpreadsheetIntegrationClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\DB;

class SyncSpreadsheetIntegrationEventJob implements ShouldQueue
{
    use Queueable;

    public int $tries = 5;

    public function __construct(public readonly string $eventId) {}

    public function backoff(): array
    {
        return [60, 300, 900, 1800, 3600];
    }

    public function handle(SpreadsheetIntegrationClient $client): void
    {
        $event = DB::transaction(function (): ?SpreadsheetIntegrationEvent {
            $event = SpreadsheetIntegrationEvent::query()
                ->where('event_id', $this->eventId)
                ->lockForUpdate()
                ->first();

            if ($event === null || $event->status === SpreadsheetIntegrationEvent::STATUS_SYNCED) {
                return null;
            }

            $event->update([
                'status' => SpreadsheetIntegrationEvent::STATUS_PROCESSING,
                'attempt_count' => $event->attempt_count + 1,
                'last_error' => null,
            ]);

            return $event->fresh();
        });

        if ($event === null) {
            return;
        }

        try {
            $result = $client->batchUpsert($event->payload);

            DB::transaction(function () use ($event, $result): void {
                $fresh = SpreadsheetIntegrationEvent::query()->lockForUpdate()->findOrFail($event->id);
                $status = ($result['skipped'] ?? false)
                    ? SpreadsheetIntegrationEvent::STATUS_SKIPPED
                    : SpreadsheetIntegrationEvent::STATUS_SYNCED;

                $fresh->update([
                    'status' => $status,
                    'synced_at' => now(),
                    'last_error' => null,
                ]);
                $fresh->item()?->update(['spreadsheet_status' => $status, 'last_error' => null]);

                if ($status === SpreadsheetIntegrationEvent::STATUS_SYNCED && $fresh->email_status === 'PENDING') {
                    SendCompetitionAnnouncementJob::dispatch($fresh->event_id)->afterCommit();
                }
            });
        } catch (\Throwable $exception) {
            DB::transaction(function () use ($event, $exception): void {
                $fresh = SpreadsheetIntegrationEvent::query()->lockForUpdate()->find($event->id);

                if ($fresh === null) {
                    return;
                }

                $error = str($exception->getMessage())->limit(2000)->toString();
                $fresh->update([
                    'status' => SpreadsheetIntegrationEvent::STATUS_FAILED,
                    'last_error' => $error,
                ]);
                $fresh->item()?->update([
                    'spreadsheet_status' => SpreadsheetIntegrationEvent::STATUS_FAILED,
                    'last_error' => $error,
                ]);
            });

            throw $exception;
        }
    }
}
