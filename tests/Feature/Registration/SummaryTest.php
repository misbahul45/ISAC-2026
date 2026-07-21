<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->team = Team::factory()->create();
    $this->token = $this->team->createToken('auth-token')->plainTextToken;
    $this->competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_BUSINESS_PLAN,
    ]);
    $this->batch = $this->competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $this->competition->id,
        'batch_id' => $this->batch->id,
        'team_id' => $this->team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
    ]);
    $this->team->members()->create([
        'name' => 'Leader', 'role' => 'LEADER', 'email' => 'leader@test.com',
        'phone' => '08111', 'major' => 'IPA', 'faculty' => 'MIPA',
        'student_id' => '123', 'sort_order' => 1,
    ]);
});

test('can get registration summary', function (): void {
    $this->withToken($this->token)
        ->getJson('/api/registrations/me/summary')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.team.id', $this->team->id)
        ->assertJsonCount(1, 'data.members')
        ->assertJsonPath('data.registration.competition.id', $this->competition->id);
});

test('can submit for verification', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/submit-verification')
        ->assertOk()
        ->assertJsonPath('status', 'success');

    $this->team->refresh();
    expect($this->team->registration->submitted_at)->not->toBeNull();
    expect($this->team->status)->toBe(Team::STATUS_WAITING_VERIFICATION);
});

test('submit for verification is idempotent', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/submit-verification')
        ->assertOk();

    $this->withToken($this->token)
        ->postJson('/api/registrations/me/submit-verification')
        ->assertOk();
});

test('cannot submit for verification before completing documents', function (): void {
    $registration = $this->team->registration;
    $registration->update(['documents_completed_at' => null]);

    $this->withToken($this->token)
        ->postJson('/api/registrations/me/submit-verification')
        ->assertUnprocessable();
});

test('cannot submit for verification before completing members', function (): void {
    $registration = $this->team->registration;
    $registration->update(['members_completed_at' => null]);

    $this->withToken($this->token)
        ->postJson('/api/registrations/me/submit-verification')
        ->assertUnprocessable();
});

test('summary and submit-verification require authentication', function (): void {
    $this->getJson('/api/registrations/me/summary')->assertUnauthorized();
    $this->postJson('/api/registrations/me/submit-verification')->assertUnauthorized();
});
