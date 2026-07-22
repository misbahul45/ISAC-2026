<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    config()->set('registration.promo.code', 'ISAXOP');
    config()->set('registration.promo.discount_percent', 15);
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
        ->assertJsonPath('data.originalAmount', 150000)
        ->assertJsonPath('data.amount', 150000)
        ->assertJsonPath('data.discountAmount', 0)
        ->assertJsonPath('data.promoApplied', false)
        ->assertJsonPath('data.paymentStatus', RegistrationStatus::WAITING_PAYMENT->value);
});

test('can quote the configured promo against the active batch price', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment/quote', ['promo_code' => 'isaxop'])
        ->assertOk()
        ->assertJsonPath('data.originalAmount', 150000)
        ->assertJsonPath('data.discountPercent', 15)
        ->assertJsonPath('data.discountAmount', 22500)
        ->assertJsonPath('data.amount', 127500)
        ->assertJsonPath('data.promoApplied', true)
        ->assertJsonPath('data.promoCode', 'ISAXOP');
});

test('rejects an invalid promo code', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment/quote', ['promo_code' => 'INVALID'])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.details.promo_code.0', 'Kode promo tidak valid.');
});

test('cannot bypass promo validation when submitting payment', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'payment_proof_file_id' => $this->file->id,
            'payment_method' => 'QRIS',
            'promo_code' => 'INVALID',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.details.promo_code.0', 'Kode promo tidak valid.');

    expect($this->team->registration()->firstOrFail()->payment_submitted_at)->toBeNull();
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

test('promo reduces and snapshots the submitted payment amount', function (): void {
    $this->withToken($this->token)
        ->postJson('/api/registrations/me/payment', [
            'payment_proof_file_id' => $this->file->id,
            'payment_method' => 'QRIS',
            'promo_code' => 'isaxop',
        ])
        ->assertOk();

    $registration = $this->team->registration()->firstOrFail();
    expect($registration->promo_code)->toBe('ISAXOP')
        ->and($registration->discount_percent)->toBe('15.00')
        ->and($registration->discount_amount)->toBe('22500.00')
        ->and($registration->amount_paid)->toBe('127500.00')
        ->and(Schema::hasColumn('registrations', 'transaction_id'))->toBeFalse();
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
    $this->postJson('/api/registrations/me/payment/quote', [])->assertUnauthorized();
    $this->postJson('/api/registrations/me/payment', [])->assertUnauthorized();
});
