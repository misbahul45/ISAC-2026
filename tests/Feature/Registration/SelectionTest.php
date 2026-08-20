<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('team automatically receives the active batch when selecting OLIMPIADE', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'current_registrations' => 0,
        'status' => BatchStatus::OPEN,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->postJson('/api/registrations/me/selection', [
            'competition_id' => $competition->id,
        ])
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.context.registration.status', 'WAITING_PAYMENT')
        ->assertJsonPath('data.context.registration.competition.id', $competition->id)
        ->assertJsonPath('data.context.registration.batch.id', $batch->id)
        ->assertJsonPath('data.redirectTo', '/registration/team');

    $this->assertDatabaseHas('registrations', [
        'team_id' => $team->id,
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
    ]);
    expect($batch->fresh()->current_registrations)->toBe(1);
});

test('business competition keeps the latest active batch price without upfront payment', function (string $competitionType): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => $competitionType,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now()->subDay(), 'end_date' => now()->addMonth(),
        'price' => 70000, 'quota' => 50, 'current_registrations' => 0,
        'status' => BatchStatus::OPEN,
    ]);
    $selectedBatch = $competition->batches()->create([
        'name' => 'Batch 2', 'slug' => 'batch-2',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 90000, 'quota' => 50, 'current_registrations' => 0,
        'status' => BatchStatus::OPEN,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->postJson('/api/registrations/me/selection', [
            'competition_id' => $competition->id,
        ])
        ->assertOk()
        ->assertJsonPath('data.context.registration.status', 'VERIFIED')
        ->assertJsonPath('data.context.registration.batch.id', $selectedBatch->id)
        ->assertJsonPath('data.context.registration.batch.price', '90000.00')
        ->assertJsonPath('data.context.registration.paymentRequiredAt', null)
        ->assertJsonPath('data.redirectTo', '/registration/team');

    $this->assertDatabaseHas('registrations', [
        'team_id' => $team->id,
        'competition_id' => $competition->id,
        'batch_id' => $selectedBatch->id,
        'status' => 'VERIFIED',
        'payment_required_at' => null,
    ]);
})->with([
    Competition::TYPE_BUSINESS_PLAN,
    Competition::TYPE_BUSINESS_IT_CASE,
]);

test('team cannot select competition when batch is full', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 5, 'current_registrations' => 5,
        'status' => BatchStatus::OPEN,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->postJson('/api/registrations/me/selection', [
            'competition_id' => $competition->id,
        ])
        ->assertUnprocessable();
});

test('selecting the same competition is idempotent after its active batch is assigned', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    $payload = ['competition_id' => $competition->id];
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)->postJson('/api/registrations/me/selection', $payload)->assertOk();
    $this->withToken($token)->postJson('/api/registrations/me/selection', $payload)->assertOk();

    expect($team->registration()->count())->toBe(1);
    expect($batch->fresh()->current_registrations)->toBe(1);
});

test('selection requires authentication', function (): void {
    $this->postJson('/api/registrations/me/selection', [
        'competition_id' => (string) Str::uuid(),
    ])->assertUnauthorized();
});
