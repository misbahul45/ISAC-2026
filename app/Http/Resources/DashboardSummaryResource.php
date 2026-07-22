<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class DashboardSummaryResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $registration = $this->resource->registration;
        $context = (new RegistrationContextResource($this->resource))->toArray($request);

        return [
            ...$context,
            'team' => [
                ...$context['team'],
                'memberCount' => $this->resource->members->count(),
                'currentStage' => $this->resource->currentStage === null ? null : [
                    'id' => $this->resource->currentStage->id,
                    'name' => $this->resource->currentStage->name,
                    'type' => $this->resource->currentStage->type,
                ],
            ],
            'payment' => $registration === null ? null : [
                'status' => $registration->status?->value,
                'amount' => (float) $registration->amount_paid,
                'method' => $registration->payment_method?->value,
                'submittedAt' => $registration->payment_submitted_at?->toISOString(),
                'verifiedAt' => $registration->payment_verified_at?->toISOString(),
                'rejectionReason' => $registration->payment_rejection_reason,
            ],
            'nextAction' => $context['currentStep'] === 'DASHBOARD'
                ? $this->statusMessage($this->resource)
                : 'Lanjutkan proses pendaftaran.',
        ];
    }

    private function statusMessage(Team $team): string
    {
        return match ($team->status) {
            Team::STATUS_WAITING_VERIFICATION => 'Data sedang diverifikasi panitia.',
            Team::STATUS_REVISION_REQUIRED => 'Perbaiki data sesuai catatan panitia.',
            Team::STATUS_REJECTED => 'Pendaftaran ditolak. Hubungi panitia jika memerlukan bantuan.',
            Team::STATUS_VERIFIED => 'Pendaftaran telah terverifikasi.',
            default => 'Lanjutkan proses pendaftaran.',
        };
    }
}
