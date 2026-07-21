<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Team $resource
 */
class RegistrationContextResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $registration = $this->resource->relationLoaded('registration')
            ? $this->resource->registration
            : null;

        return [
            'team' => [
                'id' => $this->id,
                'code' => $this->code,
                'name' => $this->name,
                'email' => $this->email,
                'status' => $this->status,
                'schoolName' => $this->school_name,
                'schoolProvince' => $this->school_province,
                'schoolCity' => $this->school_city,
                'emailVerifiedAt' => $this->email_verified_at?->toISOString(),
                'nextRedirect' => $this->next_redirect,
            ],
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
                    'competition' => $registration->relationLoaded('competition') && $registration->competition !== null
                        ? new CompetitionResource($registration->competition)
                        : null,
                    'batch' => $registration->relationLoaded('batch') && $registration->batch !== null
                        ? new BatchResource($registration->batch)
                        : null,
                ]
                : null,
        ];
    }
}
