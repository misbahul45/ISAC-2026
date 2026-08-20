<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\AdminOperation */
class AdminOperationResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'action' => $this->action,
            'status' => $this->status,
            'totalItems' => $this->total_items,
            'processedItems' => $this->processed_items,
            'successCount' => $this->success_count,
            'skippedCount' => $this->skipped_count,
            'failedCount' => $this->failed_count,
            'announcement' => [
                'title' => $this->announcement_title,
                'template' => $this->announcement_template,
            ],
            'targetStage' => $this->whenLoaded('targetStage', fn () => $this->targetStage ? [
                'id' => $this->targetStage->id,
                'name' => $this->targetStage->name,
                'order' => $this->targetStage->order,
            ] : null),
            'requestedBy' => $this->whenLoaded('requestedBy', fn () => [
                'id' => $this->requestedBy->id,
                'name' => $this->requestedBy->name,
            ]),
            'startedAt' => $this->started_at?->toISOString(),
            'completedAt' => $this->completed_at?->toISOString(),
            'createdAt' => $this->created_at?->toISOString(),
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'team' => $item->relationLoaded('team') && $item->team ? [
                    'id' => $item->team->id,
                    'code' => $item->team->code,
                    'name' => $item->team->name,
                ] : null,
                'statusBefore' => $item->status_before,
                'statusAfter' => $item->status_after,
                'processingStatus' => $item->processing_status,
                'spreadsheetStatus' => $item->spreadsheet_status,
                'lastError' => $item->last_error,
                'event' => $item->relationLoaded('integrationEvent') && $item->integrationEvent ? [
                    'eventId' => $item->integrationEvent->event_id,
                    'status' => $item->integrationEvent->status,
                    'emailStatus' => $item->integrationEvent->email_status,
                ] : null,
            ])->values()),
        ];
    }
}
