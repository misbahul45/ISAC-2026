<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('returns context for team with no registration', function (): void {
    $team = Team::factory()->create();

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->getJson('/api/registrations/me/context')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.team.id', $team->id)
        ->assertJsonPath('data.registration', null);
});

test('returns context for team with active registration', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create();
    $batch = $competition->batches()->create([
        'name' => 'Batch 1',
        'slug' => 'batch-1',
        'start_date' => now(),
        'end_date' => now()->addMonth(),
        'status' => BatchStatus::OPEN,
        'price' => 100000,
    ]);

    $registration = Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->getJson('/api/registrations/me/context')
        ->assertOk()
        ->assertJsonPath('data.registration.id', $registration->id)
        ->assertJsonPath('data.registration.status', 'WAITING_PAYMENT')
        ->assertJsonPath('data.registration.competition.id', $competition->id)
        ->assertJsonPath('data.registration.batch.id', $batch->id);
});

test('context requires authentication', function (): void {
    $this->getJson('/api/registrations/me/context')
        ->assertUnauthorized();
});
