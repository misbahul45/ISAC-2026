<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('team can select competition with batch for OLIMPIADE', function (): void {
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
            'batch_id' => $batch->id,
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
            'batch_id' => $batch->id,
        ])
        ->assertUnprocessable();
});

test('selecting the same competition and batch is idempotent', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    $payload = ['competition_id' => $competition->id, 'batch_id' => $batch->id];
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)->postJson('/api/registrations/me/selection', $payload)->assertOk();
    $this->withToken($token)->postJson('/api/registrations/me/selection', $payload)->assertOk();

    expect($team->registration()->count())->toBe(1);
    expect($batch->fresh()->current_registrations)->toBe(1);
});

test('selection requires authentication', function (): void {
    $this->postJson('/api/registrations/me/selection', [
        'competition_id' => (string) Str::uuid(),
        'batch_id' => (string) Str::uuid(),
    ])->assertUnauthorized();
});
