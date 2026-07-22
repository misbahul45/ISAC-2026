<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('team next redirect follows the actual incomplete registration step', function (): void {
    $team = Team::factory()->create([
        'email_verified_at' => now(),
        'status' => Team::STATUS_WAITING_VERIFICATION,
    ]);
    $token = $team->createToken('dashboard-guard')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.team.nextRedirect', '/registration');

    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_OLIMPIADE,
        'status' => Competition::STATUS_REGISTRATION_OPEN,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Dashboard Guard Batch',
        'slug' => 'dashboard-guard-batch',
        'start_date' => now(),
        'end_date' => now()->addMonth(),
        'price' => 100000,
        'quota' => 50,
        'status' => BatchStatus::OPEN,
    ]);
    $registration = Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
    ]);

    $this->withToken($token)->getJson('/api/auth/me')
        ->assertJsonPath('data.team.nextRedirect', '/registration/team');

    $registration->update(['team_completed_at' => now()]);
    $this->withToken($token)->getJson('/api/auth/me')
        ->assertJsonPath('data.team.nextRedirect', '/registration/biodata');

    $registration->update(['members_completed_at' => now()]);
    $this->withToken($token)->getJson('/api/auth/me')
        ->assertJsonPath('data.team.nextRedirect', '/registration/documents');

    $registration->update(['documents_completed_at' => now()]);
    $this->withToken($token)->getJson('/api/auth/me')
        ->assertJsonPath('data.team.nextRedirect', '/registration/payment');

    $registration->update([
        'status' => RegistrationStatus::WAITING_VERIFICATION,
        'payment_submitted_at' => now(),
        'submitted_at' => now(),
    ]);
    $this->withToken($token)->getJson('/api/auth/me')
        ->assertJsonPath('data.team.nextRedirect', '/dashboard');
});

test('payment revision redirects user dashboard to payment form', function (): void {
    $team = Team::factory()->create([
        'email_verified_at' => now(),
        'status' => Team::STATUS_REVISION_REQUIRED,
        'revision_step' => null,
    ]);
    $competition = Competition::factory()->create(['type' => Competition::TYPE_OLIMPIADE]);
    $batch = $competition->batches()->create([
        'name' => 'Payment Revision Batch',
        'slug' => 'payment-revision-batch',
        'start_date' => now(),
        'end_date' => now()->addMonth(),
        'price' => 100000,
        'quota' => 50,
        'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::REVISION_REQUIRED,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
    ]);

    $token = $team->createToken('dashboard-guard')->plainTextToken;
    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.team.nextRedirect', '/registration/payment');
});
