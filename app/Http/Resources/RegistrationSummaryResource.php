<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class RegistrationSummaryResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing('members', 'registration.competition', 'registration.batch');

        $registration = $this->resource->registration;

        return [
            'team' => new TeamFormResource($this->resource),
            'members' => MembersFormResource::collection($this->resource->members),
            'registration' => $registration !== null
                ? [
                    'id' => $registration->id,
                    'status' => $registration->status?->value,
                    'teamCompletedAt' => $registration->team_completed_at?->toISOString(),
                    'membersCompletedAt' => $registration->members_completed_at?->toISOString(),
                    'documentsCompletedAt' => $registration->documents_completed_at?->toISOString(),
                    'submittedAt' => $registration->submitted_at?->toISOString(),
                    'paymentRequiredAt' => $registration->payment_required_at?->toISOString(),
                    'paymentSubmittedAt' => $registration->payment_submitted_at?->toISOString(),
                    'competition' => new CompetitionResource($registration->competition),
                    'batch' => new BatchResource($registration->batch),
                ]
                : null,
        ];
    }
}
