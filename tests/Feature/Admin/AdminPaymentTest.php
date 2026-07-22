<?php

use App\Models\Admin;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

/** @return array{0: Registration, 1: Team} */
function createPaymentRegistration(array $registrationAttributes = [], array $competitionAttributes = []): array
{
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
        'payment_flow' => Competition::PAYMENT_UPFRONT,
        ...$competitionAttributes,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Payment Batch',
        'slug' => 'payment-batch-'.fake()->unique()->numerify('#####'),
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 150000,
        'quota' => 100,
        'status' => BatchStatus::OPEN,
    ]);
    $team = Team::factory()->create([
        'name' => 'Tim Pembayaran Nusantara',
        'institution_name' => 'SMA Negeri Pembayaran',
    ]);
    $registration = Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'payment_required_at' => now()->subHour(),
        ...$registrationAttributes,
    ]);

    return [$registration, $team];
}

test('all active admin roles can read the payment queue and detail', function (string $role): void {
    [$registration] = createPaymentRegistration();
    $admin = Admin::factory()->create(['role' => $role, 'is_active' => true]);
    $token = $admin->createToken('admin')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/admin/payments')
        ->assertOk()
        ->assertJsonPath('data.data.0.registrationId', $registration->id)
        ->assertJsonPath('data.data.0.isSubmitted', false)
        ->assertJsonPath('data.data.0.paymentContext', 'REGISTRATION');

    $this->withToken($token)
        ->getJson("/api/admin/payments/{$registration->id}")
        ->assertOk()
        ->assertJsonPath('data.team.name', 'Tim Pembayaran Nusantara')
        ->assertJsonPath('data.payment.originalAmount', '150000.00');
})->with(['super_admin', 'admin_registration', 'admin_payment', 'judge']);

test('payment queue includes due payments but excludes semifinal registrations before their gate', function (): void {
    [$upfront] = createPaymentRegistration();
    [$beforeGate] = createPaymentRegistration([], [
        'type' => Competition::TYPE_BUSINESS_PLAN,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $beforeGate->update(['payment_required_at' => null]);
    [$afterGate] = createPaymentRegistration([], [
        'type' => Competition::TYPE_BUSINESS_IT_CASE,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $admin = Admin::factory()->create(['role' => 'judge', 'is_active' => true]);

    $response = $this->withToken($admin->createToken('admin')->plainTextToken)
        ->getJson('/api/admin/payments')
        ->assertOk();

    $ids = collect($response->json('data.data'))->pluck('registrationId');
    expect($ids)->toContain($upfront->id, $afterGate->id)->not->toContain($beforeGate->id);

    $this->withToken($admin->createToken('admin-detail')->plainTextToken)
        ->getJson("/api/admin/payments/{$beforeGate->id}")
        ->assertNotFound()
        ->assertJsonPath('error.code', 'NOT_FOUND');
});

test('payment queue supports search status method competition and batch filters', function (): void {
    [$registration, $team] = createPaymentRegistration([
        'status' => RegistrationStatus::WAITING_VERIFICATION,
        'payment_method' => 'QRIS',
        'payment_submitted_at' => now(),
        'amount_paid' => 127500,
        'discount_percent' => 15,
        'discount_amount' => 22500,
        'promo_code' => 'ISAXOP',
    ]);
    $proof = File::query()->create([
        'file_id' => 'payment-filter-proof',
        'url' => 'https://example.com/payment-filter-proof.png',
        'purpose' => 'PAYMENT_PROOF',
        'uploaded_by' => $team->id,
    ]);
    $registration->update(['payment_proof_file_id' => $proof->id]);
    $admin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->getJson('/api/admin/payments?search=Nusantara&status=WAITING_VERIFICATION&payment_method=QRIS&competition_id='.$registration->competition_id.'&batch_id='.$registration->batch_id)
        ->assertOk()
        ->assertJsonCount(1, 'data.data')
        ->assertJsonPath('data.data.0.registrationId', $registration->id)
        ->assertJsonPath('data.data.0.payment.promoCode', 'ISAXOP')
        ->assertJsonPath('data.data.0.payment.proof.purpose', 'PAYMENT_PROOF');
});

test('payment actions return the canonical resource and remain restricted by role', function (): void {
    [$registration, $team] = createPaymentRegistration([
        'status' => RegistrationStatus::WAITING_VERIFICATION,
        'payment_method' => 'BANK_TRANSFER',
        'payment_submitted_at' => now(),
        'amount_paid' => 150000,
    ]);
    $proof = File::query()->create([
        'file_id' => 'payment-action-proof',
        'url' => 'https://example.com/payment-action-proof.png',
        'purpose' => 'PAYMENT_PROOF',
        'uploaded_by' => $team->id,
    ]);
    $registration->update(['payment_proof_file_id' => $proof->id]);

    $judge = Admin::factory()->create(['role' => 'judge', 'is_active' => true]);
    $this->withToken($judge->createToken('judge')->plainTextToken)
        ->postJson("/api/admin/registrations/{$registration->id}/payment/verify")
        ->assertForbidden();

    $paymentAdmin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);
    $this->withToken($paymentAdmin->createToken('payment')->plainTextToken)
        ->withHeader('X-Request-ID', 'payment-test-verify')
        ->postJson("/api/admin/registrations/{$registration->id}/payment/verify")
        ->assertOk()
        ->assertJsonPath('data.registrationId', $registration->id)
        ->assertJsonPath('data.status', RegistrationStatus::VERIFIED->value)
        ->assertJsonPath('data.payment.reviewedBy.id', $paymentAdmin->id)
        ->assertJsonMissingPath('data.payment_verified_by');
});

test('payment revision can be resubmitted through the existing team flow', function (): void {
    [$registration, $team] = createPaymentRegistration([
        'status' => RegistrationStatus::WAITING_VERIFICATION,
        'payment_method' => 'QRIS',
        'payment_submitted_at' => now()->subHour(),
        'amount_paid' => 150000,
        'team_completed_at' => now(),
        'members_completed_at' => now(),
        'documents_completed_at' => now(),
    ]);
    $oldProof = File::query()->create([
        'file_id' => 'payment-old-proof',
        'url' => 'https://example.com/payment-old-proof.png',
        'purpose' => 'PAYMENT_PROOF',
        'uploaded_by' => $team->id,
    ]);
    $newProof = File::query()->create([
        'file_id' => 'payment-new-proof',
        'url' => 'https://example.com/payment-new-proof.png',
        'purpose' => 'PAYMENT_PROOF',
        'uploaded_by' => $team->id,
    ]);
    $registration->update(['payment_proof_file_id' => $oldProof->id]);
    $admin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->postJson("/api/admin/registrations/{$registration->id}/payment/revision", [
            'reason' => 'Bukti pembayaran tidak terbaca.',
        ])
        ->assertOk()
        ->assertJsonPath('data.status', RegistrationStatus::REVISION_REQUIRED->value);

    $this->withToken($team->createToken('team')->plainTextToken)
        ->postJson('/api/registrations/me/payment', [
            'payment_proof_file_id' => $newProof->id,
            'payment_method' => 'QRIS',
        ])
        ->assertOk()
        ->assertJsonPath('data.context.registration.status', RegistrationStatus::WAITING_VERIFICATION->value);
});
