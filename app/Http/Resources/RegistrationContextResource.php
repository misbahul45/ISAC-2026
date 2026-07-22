<?php

namespace App\Http\Resources;

use App\Models\Competition;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @property-read Team $resource */
class RegistrationContextResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing('registration.competition', 'registration.batch');
        $registration = $this->resource->registration;
        $currentStep = $this->currentStep($registration);

        return [
            'team' => [
                'id' => $this->id,
                'code' => $this->code,
                'name' => $this->name,
                'email' => $this->email,
                'status' => $this->status,
                'institutionName' => $this->institution_name,
                'institutionAddress' => $this->institution_address,
                'emailVerifiedAt' => $this->email_verified_at?->toISOString(),
                'revisionStep' => $this->revision_step,
                'verificationNote' => $this->verification_note,
            ],
            'registration' => $registration === null ? null : [
                'id' => $registration->id,
                'status' => $registration->status?->value,
                'competition' => new CompetitionResource($registration->competition),
                'batch' => new BatchResource($registration->batch),
                'paymentRequiredAt' => $registration->payment_required_at?->toISOString(),
                'paymentSubmittedAt' => $registration->payment_submitted_at?->toISOString(),
                'paymentRejectionReason' => $registration->payment_rejection_reason,
            ],
            'progress' => [
                'teamCompleted' => $registration?->team_completed_at !== null,
                'membersCompleted' => $registration?->members_completed_at !== null,
                'documentsCompleted' => $registration?->documents_completed_at !== null,
                'submitted' => $registration?->submitted_at !== null,
            ],
            'currentStep' => $currentStep,
            'allowedActions' => $this->allowedActions($registration, $currentStep),
            'redirectTo' => $this->redirectFor($currentStep),
        ];
    }

    private function currentStep(mixed $registration): string
    {
        if (! $this->resource->isEmailVerified()) {
            return 'VERIFY_EMAIL';
        }
        if ($registration === null) {
            return 'COMPETITION';
        }
        if ($this->status === Team::STATUS_REVISION_REQUIRED && $this->revision_step !== null) {
            return $this->revision_step === 'MEMBERS' ? 'BIODATA' : $this->revision_step;
        }
        if ($registration->team_completed_at === null) {
            return 'TEAM';
        }
        if ($registration->members_completed_at === null) {
            return 'BIODATA';
        }
        if ($registration->documents_completed_at === null) {
            return 'DOCUMENTS';
        }
        if ($registration->status === RegistrationStatus::WAITING_PAYMENT || $registration->status === RegistrationStatus::REVISION_REQUIRED) {
            return 'PAYMENT';
        }
        if ($registration->competition->type === Competition::TYPE_OLIMPIADE && $registration->payment_submitted_at === null) {
            return 'PAYMENT';
        }

        return 'DASHBOARD';
    }

    /** @return list<string> */
    private function allowedActions(mixed $registration, string $currentStep): array
    {
        if ($registration?->submitted_at !== null && $this->status !== Team::STATUS_REVISION_REQUIRED && $registration->status !== RegistrationStatus::REVISION_REQUIRED) {
            return ['VIEW_STATUS'];
        }

        return match ($currentStep) {
            'COMPETITION' => ['SELECT_COMPETITION'],
            'TEAM' => ['UPDATE_TEAM'],
            'BIODATA' => ['UPDATE_MEMBERS'],
            'DOCUMENTS' => ['UPDATE_DOCUMENTS'],
            'PAYMENT' => ['SUBMIT_PAYMENT'],
            'DASHBOARD' => ['VIEW_STATUS'],
            default => [],
        };
    }

    private function redirectFor(string $currentStep): string
    {
        return match ($currentStep) {
            'VERIFY_EMAIL' => '/auth/verify-email',
            'COMPETITION' => '/registration',
            'TEAM' => '/registration/team',
            'BIODATA' => '/registration/biodata',
            'DOCUMENTS' => '/registration/documents',
            'PAYMENT' => '/registration/payment',
            default => '/dashboard',
        };
    }
}
