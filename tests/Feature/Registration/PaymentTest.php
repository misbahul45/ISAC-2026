<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
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
        'type' => Competition::TYPE_OLIMPIADE,
    ]);
    $this->batch = $this->competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 150000, 'quota' => 50, 'status' => BatchStatus::OPEN,
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
    $this->file = File::query()->create([
        'file_id' => 'payment-proof-123',
        'url' => 'https://ik.imagekit.io/isac/proof.pdf',
    ]);
});

test('can get payment data', function (): void {
    $this->withToken($this->token)
        ->getJson('/api/registrations/me/payment')
        ->assertOk()
        ->assertJsonPath('data.price', '150000.00');
});

test('can submit payment for OLIMPIADE', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'paymentProofFileId' => $this->file->id,
        ])
        ->assertOk()
        ->assertJsonPath('data.paymentProofFileId', $this->file->id)
        ->assertJsonPath('data.status', 'WAITING_VERIFICATION');

    $this->team->refresh();
    expect($this->team->status)->toBe(Team::STATUS_WAITING_VERIFICATION);
});

test('cannot submit payment twice', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'paymentProofFileId' => $this->file->id,
        ])
        ->assertOk();

    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'paymentProofFileId' => $this->file->id,
        ])
        ->assertUnprocessable();
});

test('payment endpoints require authentication', function (): void {
    $this->getJson('/api/registrations/me/payment')->assertUnauthorized();
    $this->postJson('/api/registrations/me/payment', [])->assertUnauthorized();
});
