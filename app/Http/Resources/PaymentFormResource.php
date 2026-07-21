<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class PaymentFormResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $registration = $this->resource->relationLoaded('registration')
            ? $this->resource->registration
            : null;

        $batch = $registration !== null && $registration->relationLoaded('batch')
            ? $registration->batch
            : null;

        return [
            'price' => $batch?->price !== null ? (string) $batch->price : null,
            'paymentProofFileId' => $registration?->payment_proof_file_id,
            'amountPaid' => $registration?->amount_paid !== null ? (string) $registration->amount_paid : null,
            'paymentMethod' => $registration?->payment_method?->value,
            'paymentSubmittedAt' => $registration?->payment_submitted_at?->toISOString(),
            'paymentRequiredAt' => $registration?->payment_required_at?->toISOString(),
            'paidAt' => $registration?->paid_at?->toISOString(),
            'status' => $registration?->status?->value,
        ];
    }
}
