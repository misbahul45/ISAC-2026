<?php

namespace App\Services;

use App\Models\Competition;
use App\Models\Exam;
use App\Models\RegistrationStatus;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Auth\Access\AuthorizationException;

class DashboardService
{
    public function getSummary(Team $team): Team
    {
        return $team->load([
            'members',
            'registration.competition',
            'registration.batch',
            'registration.paymentProofFile',
            'registration.paymentForStage',
            'currentStage.exams' => fn ($query) => $query
                ->select([
                    'id', 'stage_id', 'title', 'description', 'start_date',
                    'end_date', 'duration', 'max_attempts',
                ])
                ->orderBy('start_date'),
        ]);
    }

    /** @return array<string, mixed> */
    public function getExamShell(Team $team, Exam $exam): array
    {
        $team->loadMissing('registration.competition', 'registration.batch', 'currentStage');
        $exam->loadMissing('stage');

        $registration = $team->registration;
        $canAccess = $registration !== null
            && $registration->competition->type === Competition::TYPE_OLIMPIADE
            && $exam->stage->competition_id === $registration->competition_id
            && $team->current_stage_id === $exam->stage_id;

        if (! $canAccess) {
            throw new AuthorizationException('Ujian tidak tersedia untuk tahap Team ini.');
        }

        return [
            'exam' => $this->examMetadata($exam),
            'stage' => $this->stageMetadata($exam->stage),
            'competition' => [
                'id' => $registration->competition->id,
                'name' => $registration->competition->name,
                'type' => $registration->competition->type,
            ],
            'batch' => [
                'id' => $registration->batch->id,
                'name' => $registration->batch->name,
                'price' => (float) $registration->batch->price,
            ],
        ];
    }

    /** @return array<string, mixed> */
    public function getSubmissionShell(Team $team, Stage $stage): array
    {
        $team->loadMissing(
            'registration.competition',
            'registration.batch',
            'registration.paymentForStage',
            'currentStage',
        );

        $registration = $team->registration;
        $isBusinessCompetition = $registration !== null
            && in_array($registration->competition->type, [
                Competition::TYPE_BUSINESS_PLAN,
                Competition::TYPE_BUSINESS_IT_CASE,
            ], true);
        $isCurrentStage = $team->current_stage_id === $stage->id;
        $isPaymentTarget = $registration?->payment_for_stage_id === $stage->id;
        $canAccess = $isBusinessCompetition
            && $stage->competition_id === $registration->competition_id
            && ($isCurrentStage || $isPaymentTarget);

        if (! $canAccess) {
            throw new AuthorizationException('Tahap pengumpulan tidak tersedia untuk Team ini.');
        }

        return [
            'stage' => $this->stageMetadata($stage),
            'competition' => [
                'id' => $registration->competition->id,
                'name' => $registration->competition->name,
                'type' => $registration->competition->type,
            ],
            'batch' => [
                'id' => $registration->batch->id,
                'name' => $registration->batch->name,
                'price' => (float) $registration->batch->price,
            ],
            'payment' => [
                'isTargetStage' => $isPaymentTarget,
                'status' => $registration->status?->value,
                'originalAmount' => (float) $registration->batch->price,
                'requiredAt' => $registration->payment_required_at?->toISOString(),
                'submittedAt' => $registration->payment_submitted_at?->toISOString(),
                'rejectionReason' => $registration->payment_rejection_reason,
                'state' => $this->paymentState(
                    $registration->status,
                    $isPaymentTarget,
                    $registration->payment_submitted_at !== null,
                ),
            ],
            'submissionLocked' => $isPaymentTarget && ! $isCurrentStage,
        ];
    }

    /** @return array<string, mixed> */
    private function examMetadata(Exam $exam): array
    {
        return [
            'id' => $exam->id,
            'title' => $exam->title,
            'description' => $exam->description,
            'startDate' => $exam->start_date?->toISOString(),
            'endDate' => $exam->end_date?->toISOString(),
            'duration' => $exam->duration,
            'maxAttempts' => $exam->max_attempts,
        ];
    }

    /** @return array<string, mixed> */
    private function stageMetadata(Stage $stage): array
    {
        return [
            'id' => $stage->id,
            'name' => $stage->name,
            'type' => $stage->type,
            'order' => $stage->order,
            'description' => $stage->description,
            'startDate' => $stage->start_date?->toISOString(),
            'endDate' => $stage->end_date?->toISOString(),
        ];
    }

    private function paymentState(?RegistrationStatus $status, bool $isPaymentTarget, bool $hasSubmittedPayment): string
    {
        if (! $isPaymentTarget) {
            return 'NOT_REQUIRED';
        }

        return match (true) {
            $status === RegistrationStatus::REVISION_REQUIRED => 'REVISION_REQUIRED',
            $status === RegistrationStatus::WAITING_VERIFICATION && $hasSubmittedPayment => 'WAITING_VERIFICATION',
            default => 'PAYMENT_REQUIRED',
        };
    }
}
