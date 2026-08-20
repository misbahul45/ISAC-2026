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
                    'order' => $this->resource->currentStage->order,
                    'description' => $this->resource->currentStage->description,
                    'startDate' => $this->resource->currentStage->start_date?->toISOString(),
                    'endDate' => $this->resource->currentStage->end_date?->toISOString(),
                ],
            ],
            'payment' => $registration === null ? null : [
                'status' => $registration->status?->value,
                'amount' => $registration->payment_submitted_at === null
                    ? (float) $registration->batch->price
                    : (float) $registration->amount_paid,
                'originalAmount' => (float) $registration->batch->price,
                'promoCode' => $registration->promo_code,
                'discountPercent' => (float) $registration->discount_percent,
                'discountAmount' => (float) $registration->discount_amount,
                'method' => $registration->payment_method?->value,
                'submittedAt' => $registration->payment_submitted_at?->toISOString(),
                'verifiedAt' => $registration->payment_verified_at?->toISOString(),
                'rejectionReason' => $registration->payment_rejection_reason,
                'proof' => $registration->paymentProofFile === null ? null : [
                    'id' => $registration->paymentProofFile->id,
                    'url' => $registration->paymentProofFile->url,
                    'downloadUrl' => route('files.show', ['file' => $registration->paymentProofFile->id]),
                ],
            ],
            'activities' => [
                'exams' => $this->resource->currentStage === null
                    ? []
                    : $this->resource->currentStage->exams->map(fn ($exam): array => [
                        'id' => $exam->id,
                        'title' => $exam->title,
                        'description' => $exam->description,
                        'startDate' => $exam->start_date?->toISOString(),
                        'endDate' => $exam->end_date?->toISOString(),
                        'duration' => $exam->duration,
                        'maxAttempts' => $exam->max_attempts,
                    ])->values()->all(),
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
