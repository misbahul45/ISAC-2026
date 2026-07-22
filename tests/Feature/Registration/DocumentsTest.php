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
});

test('can get documents data', function (): void {
    $this->team->update([
        'document_url' => 'https://drive.google.com/doc',
        'twibbon_url' => 'https://drive.google.com/twibbon',
    ]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/documents')
        ->assertOk()
        ->assertJsonPath('data.documentUrl', 'https://drive.google.com/doc')
        ->assertJsonPath('data.twibbonUrl', 'https://drive.google.com/twibbon');
});

test('can update documents for OLIMPIADE', function (): void {
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $this->team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/documents', [
            'document_url' => 'https://drive.google.com/proposal',
            'twibbon_url' => 'https://drive.google.com/twibbon-upload',
        ])
        ->assertOk()
        ->assertJsonPath('data.context.progress.documentsCompleted', true)
        ->assertJsonPath('data.redirectTo', '/registration/payment');

    $this->team->refresh();
    expect($this->team->document_url)->toBe('https://drive.google.com/proposal');
    expect($this->team->registration->submitted_at)->toBeNull();
});

test('documents auto-finalizes for non-OLIMPIADE', function (): void {
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_BUSINESS_PLAN,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $this->team->id,
        'status' => RegistrationStatus::VERIFIED,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/documents', [
            'document_url' => 'https://drive.google.com/proposal',
            'twibbon_url' => 'https://drive.google.com/twibbon-upload',
        ])
        ->assertOk()
        ->assertJsonPath('data.context.team.status', Team::STATUS_WAITING_VERIFICATION)
        ->assertJsonPath('data.redirectTo', '/dashboard');

    $this->team->refresh();
    expect($this->team->registration->submitted_at)->not->toBeNull();
    expect($this->team->status)->toBe(Team::STATUS_WAITING_VERIFICATION);
});

test('documents endpoints require authentication', function (): void {
    $this->getJson('/api/registrations/me/documents')->assertUnauthorized();
    $this->patchJson('/api/registrations/me/documents', [])->assertUnauthorized();
});
