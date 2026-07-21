<?php

namespace App\Http\Resources;

use App\Models\Batch;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Batch $resource
 */
class BatchResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'competitionId' => $this->competition_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'startDate' => $this->start_date?->toISOString(),
            'endDate' => $this->end_date?->toISOString(),
            'price' => $this->price,
            'moduleFileId' => $this->module_file_id,
            'quota' => $this->quota,
            'currentRegistrations' => $this->current_registrations,
            'remainingQuota' => $this->quota === null
                ? null
                : max(0, $this->quota - $this->current_registrations),
            'status' => $this->status?->value,
            'createdAt' => $this->created_at?->toISOString(),
            'updatedAt' => $this->updated_at?->toISOString(),
        ];
    }
}
