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
    $this->institutionAddress = json_encode([
        'province' => 'Jawa Timur',
        'city' => 'Surabaya',
        'address' => 'Jl. Wijaya Kusuma No. 48',
    ], JSON_THROW_ON_ERROR);
});

test('can get team data for form', function (): void {
    $this->team->update([
        'name' => 'Tim Sains', 'phone' => '08123456789', 'institution_name' => 'SMAN 1 Jakarta',
        'institution_address' => $this->institutionAddress,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/team')
        ->assertOk()
        ->assertJsonPath('data.name', 'Tim Sains')
        ->assertJsonPath('data.phone', '08123456789')
        ->assertJsonPath('data.institutionName', 'SMAN 1 Jakarta')
        ->assertJsonPath('data.institutionAddress', $this->institutionAddress);
});

test('can update team data with registration progress', function (): void {
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1', 'start_date' => now(),
        'end_date' => now()->addMonth(), 'price' => 100000, 'quota' => 50,
        'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id,
        'team_id' => $this->team->id, 'status' => RegistrationStatus::WAITING_PAYMENT,
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [
            'name' => 'Tim Baru', 'phone' => '0811111111', 'institution_name' => 'SMA Baru',
            'institution_address' => $this->institutionAddress,
        ])
        ->assertOk()
        ->assertJsonPath('data.context.team.name', 'Tim Baru')
        ->assertJsonPath('data.context.team.institutionName', 'SMA Baru')
        ->assertJsonPath('data.context.team.institutionAddress', $this->institutionAddress)
        ->assertJsonPath('data.context.progress.teamCompleted', true)
        ->assertJsonPath('data.redirectTo', '/registration/biodata');

    $this->team->refresh();
    expect($this->team->name)->toBe('Tim Baru');
    expect($this->team->institution_name)->toBe('SMA Baru');
    expect($this->team->institution_address)->toBe($this->institutionAddress);
});

test('requires all team fields', function (): void {
    $response = $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [])
        ->assertUnprocessable();

    $details = $response->json('error.details');
    expect(array_keys($details))->toContain('name', 'phone', 'institution_name', 'institution_address')
        ->not->toContain('school_province', 'school_city', 'school_address');
});

test('institution address must be a complete json string', function (): void {
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'address-batch-1', 'start_date' => now(),
        'end_date' => now()->addMonth(), 'price' => 100000, 'quota' => 50,
        'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id,
        'team_id' => $this->team->id, 'status' => RegistrationStatus::WAITING_PAYMENT,
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [
            'name' => 'Tim Baru', 'phone' => '0811111111', 'institution_name' => 'SMA Baru',
            'institution_address' => '{"province":"Jawa Timur"}',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.details.institution_address.0', 'Kota atau kabupaten wajib diisi.');
});

test('institution must match the selected competition participant category', function (): void {
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_BUSINESS_IT_CASE,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'bitc-batch-1', 'start_date' => now(),
        'end_date' => now()->addMonth(), 'price' => 100000, 'quota' => 50,
        'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id,
        'team_id' => $this->team->id, 'status' => RegistrationStatus::VERIFIED,
    ]);

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [
            'name' => 'Tim Kampus', 'phone' => '0811111111', 'institution_name' => 'SMA Negeri 1',
            'institution_address' => $this->institutionAddress,
        ])
        ->assertUnprocessable()
        ->assertJsonPath(
            'error.details.institution_name.0',
            'Business IT Case hanya diperuntukkan bagi mahasiswa perguruan tinggi.',
        );

    $this->withToken($this->token)
        ->patchJson('/api/registrations/me/team', [
            'name' => 'Tim Kampus', 'phone' => '0811111111', 'institution_name' => 'Universitas Indonesia',
            'institution_address' => $this->institutionAddress,
        ])
        ->assertOk();
});

test('team data requires authentication', function (): void {
    $this->getJson('/api/registrations/me/team')->assertUnauthorized();
    $this->patchJson('/api/registrations/me/team', [])->assertUnauthorized();
});
