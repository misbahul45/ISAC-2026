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

test('can get team data for form', function (): void {
    $this->team->update([
        'name' => 'Tim Sains',
        'phone' => '08123456789',
        'school_name' => 'SMAN 1 Jakarta',
        'school_province' => 'DKI Jakarta',
        'school_city' => 'Jakarta Selatan',
        'school_address' => 'Jl. Merdeka No. 1',
    ]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/team')
        ->assertOk()
        ->assertJsonPath('data.name', 'Tim Sains')
        ->assertJsonPath('data.phone', '08123456789')
        ->assertJsonPath('data.schoolName', 'SMAN 1 Jakarta')
        ->assertJsonPath('data.schoolProvince', 'DKI Jakarta')
        ->assertJsonPath('data.schoolCity', 'Jakarta Selatan')
        ->assertJsonPath('data.schoolAddress', 'Jl. Merdeka No. 1');
});

test('can update team data with registration progress', function (): void {
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
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
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [
            'name' => 'Tim Baru',
            'phone' => '081111111',
            'school_name' => 'SMA Baru',
            'school_province' => 'Jawa Barat',
            'school_city' => 'Bandung',
            'school_address' => 'Jl. Baru No. 1',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Tim Baru')
        ->assertJsonPath('data.schoolCity', 'Bandung');

    $this->team->refresh();
    expect($this->team->name)->toBe('Tim Baru');
    expect($this->team->school_city)->toBe('Bandung');
});

test('requires all team fields', function (): void {
    $response = $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [])
        ->assertUnprocessable();

    $details = $response->json('error.details');
    expect(array_keys($details))->toContain('name', 'phone', 'school_name', 'school_province', 'school_city', 'school_address');
});

test('team data requires authentication', function (): void {
    $this->getJson('/api/registrations/me/team')->assertUnauthorized();
    $this->patchJson('/api/registrations/me/team', [])->assertUnauthorized();
});
