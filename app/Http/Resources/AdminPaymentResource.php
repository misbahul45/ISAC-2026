<?php

namespace App\Http\Resources;

use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Registration $resource */
class AdminPaymentResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing([
            'team.currentStage',
            'competition',
            'batch',
            'paymentProofFile',
            'paymentVerifiedBy',
            'paymentForStage',
        ]);

        $submitted = $this->payment_submitted_at !== null;
        $originalAmount = $submitted
            ? (float) $this->amount_paid + (float) $this->discount_amount
            : (float) $this->batch->price;

        return [
            'registrationId' => $this->id,
            'status' => $this->status?->value,
            'paymentContext' => $this->competition->payment_flow === Competition::PAYMENT_UPFRONT
                ? 'REGISTRATION'
                : 'SEMIFINAL',
            'isSubmitted' => $submitted,
            'canBeReviewed' => $this->status === RegistrationStatus::WAITING_VERIFICATION
                && $this->payment_proof_file_id !== null,
            'team' => [
                'id' => $this->team->id,
                'code' => $this->team->code,
                'name' => $this->team->name,
                'email' => $this->team->email,
                'phone' => $this->team->phone,
                'institutionName' => $this->team->institution_name,
                'institutionAddress' => $this->team->institution_address,
                'status' => $this->team->status,
                'currentStage' => $this->team->currentStage === null ? null : [
                    'id' => $this->team->currentStage->id,
                    'name' => $this->team->currentStage->name,
                ],
            ],
            'competition' => [
                'id' => $this->competition->id,
                'name' => $this->competition->name,
                'type' => $this->competition->type,
                'paymentFlow' => $this->competition->payment_flow,
            ],
            'batch' => [
                'id' => $this->batch->id,
                'name' => $this->batch->name,
                'price' => (string) $this->batch->price,
            ],
            'payment' => [
                'method' => $this->payment_method?->value,
                'originalAmount' => number_format($originalAmount, 2, '.', ''),
                'amountPaid' => (string) $this->amount_paid,
                'promoCode' => $this->promo_code,
                'discountPercent' => (string) $this->discount_percent,
                'discountAmount' => (string) $this->discount_amount,
                'proof' => $this->paymentProofFile === null ? null : new FileResource($this->paymentProofFile),
                'requiredAt' => $this->payment_required_at?->toISOString(),
                'submittedAt' => $this->payment_submitted_at?->toISOString(),
                'reviewedAt' => $this->payment_verified_at?->toISOString(),
                'paidAt' => $this->paid_at?->toISOString(),
                'rejectionReason' => $this->payment_rejection_reason,
                'targetStage' => $this->paymentForStage === null ? null : [
                    'id' => $this->paymentForStage->id,
                    'name' => $this->paymentForStage->name,
                ],
                'reviewedBy' => $this->paymentVerifiedBy === null ? null : [
                    'id' => $this->paymentVerifiedBy->id,
                    'name' => $this->paymentVerifiedBy->name,
                ],
            ],
        ];
    }
}
