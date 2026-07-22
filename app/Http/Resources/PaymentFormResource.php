<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class PaymentFormResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing('registration.batch', 'registration.paymentProofFile', 'registration.paymentForStage');
        $registration = $this->resource->registration;
        $originalAmount = $registration?->batch?->price === null ? null : (float) $registration->batch->price;
        $hasSubmittedPayment = $registration?->payment_submitted_at !== null;

        return [
            'registrationId' => $registration?->id,
            'originalAmount' => $originalAmount,
            'amount' => $hasSubmittedPayment ? (float) $registration->amount_paid : $originalAmount,
            'discountPercent' => $hasSubmittedPayment ? (float) $registration->discount_percent : 0,
            'discountAmount' => $hasSubmittedPayment ? (float) $registration->discount_amount : 0,
            'promoApplied' => $hasSubmittedPayment && $registration->promo_code !== null,
            'promoCode' => $hasSubmittedPayment ? $registration->promo_code : null,
            'paymentMethods' => config('registration.payment_methods'),
            'paymentInstructions' => config('registration.payment_instructions'),
            'qrImageUrl' => config('registration.qr_image_url'),
            'paymentStatus' => $registration?->status?->value,
            'existingProof' => $registration?->paymentProofFile === null ? null : new FileResource($registration->paymentProofFile),
            'rejectionReason' => $registration?->payment_rejection_reason,
            'paymentSubmittedAt' => $registration?->payment_submitted_at?->toISOString(),
            'paymentForStage' => $registration?->paymentForStage === null ? null : [
                'id' => $registration->paymentForStage->id,
                'name' => $registration->paymentForStage->name,
            ],
        ];
    }
}
