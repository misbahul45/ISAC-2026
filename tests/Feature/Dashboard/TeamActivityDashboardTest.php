<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Exam;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

function createDashboardBatch(Competition $competition, int $price, string $slug): mixed
{
    return $competition->batches()->create([
        'name' => 'Batch Test',
        'slug' => $slug,
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => $price,
        'status' => BatchStatus::OPEN,
    ]);
}

function createDashboardExam(Stage $stage, string $title): Exam
{
    return Exam::query()->create([
        'id' => (string) Str::uuid(),
        'stage_id' => $stage->id,
        'title' => $title,
        'start_date' => now()->subHour(),
        'end_date' => now()->addHour(),
    ]);
}

test('olympiad dashboard only exposes exam metadata from the current stage', function (): void {
    $team = Team::factory()->create([
        'email_verified_at' => now(),
        'status' => Team::STATUS_VERIFIED,
    ]);
    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_OLIMPIADE,
        'payment_flow' => Competition::PAYMENT_UPFRONT,
    ]);
    $batch = createDashboardBatch($competition, 125000, 'olympiad-dashboard-batch');
    $currentStage = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Elimination',
        'type' => 'exam',
        'order' => 1,
    ]);
    $otherStage = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Semifinal',
        'type' => 'exam',
        'order' => 2,
    ]);
    $currentExam = createDashboardExam($currentStage, 'Ujian Eliminasi');
    $otherExam = createDashboardExam($otherStage, 'Ujian Semifinal');
    $team->update(['current_stage_id' => $currentStage->id]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::VERIFIED,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
        'submitted_at' => now(),
        'amount_paid' => 100000,
        'discount_amount' => 25000,
        'payment_submitted_at' => now(),
        'payment_verified_at' => now(),
    ]);

    $token = $team->createToken('dashboard')->plainTextToken;
    $this->withToken($token)->getJson('/api/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('data.team.currentStage.id', $currentStage->id)
        ->assertJsonPath('data.activities.exams.0.id', $currentExam->id)
        ->assertJsonCount(1, 'data.activities.exams')
        ->assertJsonPath('data.payment.originalAmount', 125000)
        ->assertJsonMissingPath('data.activities.exams.0.questions');

    $this->withToken($token)->getJson("/api/dashboard/exams/{$currentExam->id}")
        ->assertOk()
        ->assertJsonPath('data.exam.id', $currentExam->id)
        ->assertJsonPath('data.batch.price', 125000)
        ->assertJsonMissingPath('data.exam.questions');

    $this->withToken($token)->getJson("/api/dashboard/exams/{$otherExam->id}")
        ->assertForbidden();
});

test('business dashboard exposes the payment target stage and registration batch price', function (): void {
    $team = Team::factory()->create([
        'email_verified_at' => now(),
        'status' => Team::STATUS_VERIFIED,
    ]);
    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_BUSINESS_PLAN,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $batch = createDashboardBatch($competition, 175000, 'business-dashboard-batch');
    $preliminary = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Preliminary',
        'type' => 'submission',
        'order' => 1,
    ]);
    $semifinal = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Semifinal',
        'type' => 'submission',
        'order' => 2,
    ]);
    $team->update(['current_stage_id' => $preliminary->id]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
        'submitted_at' => now(),
        'payment_required_at' => now(),
        'payment_for_stage_id' => $semifinal->id,
    ]);

    $token = $team->createToken('dashboard')->plainTextToken;
    $this->withToken($token)->getJson('/api/dashboard/summary')
        ->assertOk()
        ->assertJsonPath('data.currentStep', 'DASHBOARD')
        ->assertJsonPath('data.registration.paymentForStage.id', $semifinal->id)
        ->assertJsonPath('data.registration.batch.price', '175000.00')
        ->assertJsonPath('data.payment.originalAmount', 175000);

    $this->withToken($token)->getJson("/api/dashboard/stages/{$semifinal->id}")
        ->assertOk()
        ->assertJsonPath('data.payment.state', 'PAYMENT_REQUIRED')
        ->assertJsonPath('data.payment.originalAmount', 175000)
        ->assertJsonPath('data.submissionLocked', true);
});

test('submission shell rejects a stage from another competition', function (): void {
    $team = Team::factory()->create(['email_verified_at' => now(), 'status' => Team::STATUS_VERIFIED]);
    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_BUSINESS_IT_CASE,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $batch = createDashboardBatch($competition, 100000, 'bic-shell-batch');
    $currentStage = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Preliminary',
        'type' => 'submission',
        'order' => 1,
    ]);
    $otherCompetition = Competition::factory()->create(['type' => Competition::TYPE_BUSINESS_PLAN]);
    $otherStage = Stage::query()->create([
        'competition_id' => $otherCompetition->id,
        'name' => 'Other Preliminary',
        'type' => 'submission',
        'order' => 1,
    ]);
    $team->update(['current_stage_id' => $currentStage->id]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::VERIFIED,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
        'submitted_at' => now(),
    ]);

    $token = $team->createToken('dashboard')->plainTextToken;
    $this->withToken($token)->getJson("/api/dashboard/stages/{$otherStage->id}")
        ->assertForbidden();
});
