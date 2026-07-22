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
        'uploaded_by' => $this->team->id,
        'purpose' => 'PAYMENT_PROOF',
    ]);
});

test('can get payment data', function (): void {
    $this->withToken($this->token)
        ->getJson('/api/registrations/me/payment')
        ->assertOk()
        ->assertJsonPath('data.amount', 150000)
        ->assertJsonPath('data.paymentStatus', RegistrationStatus::WAITING_PAYMENT->value);
});

test('can submit payment for OLIMPIADE', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'payment_proof_file_id' => $this->file->id,
            'payment_method' => 'BANK_TRANSFER',
        ])
        ->assertOk()
        ->assertJsonPath('data.context.registration.status', RegistrationStatus::WAITING_VERIFICATION->value)
        ->assertJsonPath('data.context.team.status', Team::STATUS_WAITING_VERIFICATION)
        ->assertJsonPath('data.redirectTo', '/dashboard');

    expect($this->team->fresh()->status)->toBe(Team::STATUS_WAITING_VERIFICATION);
});

test('same payment submission is idempotent', function (): void {
    $payload = [
        'payment_proof_file_id' => $this->file->id,
        'payment_method' => 'BANK_TRANSFER',
    ];

    $this->withToken($this->token)->postJson('/api/registrations/me/payment', $payload)->assertOk();
    $submittedAt = $this->team->registration()->firstOrFail()->payment_submitted_at;

    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', $payload)
        ->assertOk()
        ->assertJsonPath('data.context.registration.status', RegistrationStatus::WAITING_VERIFICATION->value);

    expect($this->team->registration()->firstOrFail()->payment_submitted_at->equalTo($submittedAt))->toBeTrue();
});

test('payment endpoints require authentication', function (): void {
    $this->getJson('/api/registrations/me/payment')->assertUnauthorized();
    $this->postJson('/api/registrations/me/payment', [])->assertUnauthorized();
});
