<?php

use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
use App\Models\RegistrationStatus;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('canonical olympiad workflow runs from selection through admin activation', function (): void {
    $team = Team::factory()->create();
    $teamToken = $team->createToken('workflow')->plainTextToken;
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
        'payment_flow' => Competition::PAYMENT_UPFRONT,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Open Batch',
        'slug' => 'canonical-open-batch',
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 150000,
        'quota' => 10,
        'status' => BatchStatus::OPEN,
    ]);
    $stage = Stage::query()->create([
        'competition_id' => $competition->id,
        'name' => 'Registration',
        'type' => 'registration',
        'order' => 1,
        'is_active' => true,
    ]);

    $this->withToken($teamToken)->postJson('/api/registrations/me/selection', [
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
    ])->assertOk()
        ->assertJsonPath('data.context.registration.status', RegistrationStatus::WAITING_PAYMENT->value)
        ->assertJsonPath('data.redirectTo', '/registration/team');

    $this->withToken($teamToken)->patchJson('/api/registrations/me/team', [
        'name' => 'Canonical Team',
        'phone' => '081234567890',
        'institution_name' => 'SMA Canonical',
        'institution_address' => json_encode([
            'province' => 'Jawa Timur',
            'city' => 'Surabaya',
            'address' => 'Jl. Canonical No. 1',
        ], JSON_THROW_ON_ERROR),
    ])->assertOk()->assertJsonPath('data.redirectTo', '/registration/biodata');

    $this->withToken($teamToken)->putJson('/api/registrations/me/members', [
        'members' => [[
            'name' => 'Canonical Leader',
            'role' => 'LEADER',
            'email' => 'leader@canonical.test',
            'major' => null,
            'faculty' => null,
            'student_id' => 'CANONICAL-001',
            'photo_file_id' => null,
            'sort_order' => 1,
        ]],
    ])->assertOk()->assertJsonPath('data.redirectTo', '/registration/documents');

    $this->withToken($teamToken)->patchJson('/api/registrations/me/documents', [
        'document_url' => 'https://drive.google.com/drive/folders/canonical-documents',
        'twibbon_url' => 'https://drive.google.com/drive/folders/canonical-twibbon',
    ])->assertOk()->assertJsonPath('data.redirectTo', '/registration/payment');

    $proof = File::query()->create([
        'file_id' => 'canonical-payment-proof',
        'url' => 'https://example.com/payment.png',
        'purpose' => 'PAYMENT_PROOF',
        'uploaded_by' => $team->id,
    ]);
    $this->withToken($teamToken)->postJson('/api/registrations/me/payment', [
        'payment_proof_file_id' => $proof->id,
        'payment_method' => 'QRIS',
    ])->assertOk()
        ->assertJsonPath('data.context.registration.status', RegistrationStatus::WAITING_VERIFICATION->value)
        ->assertJsonPath('data.redirectTo', '/dashboard');

    $admin = Admin::factory()->create(['role' => 'super_admin', 'is_active' => true]);
    $adminToken = $admin->createToken('admin-workflow')->plainTextToken;
    $registration = $team->fresh()->registration;

    $this->withToken($adminToken)->postJson("/api/admin/teams/{$team->id}/verify")
        ->assertOk()->assertJsonPath('data.team.status', Team::STATUS_VERIFIED);
    $this->withToken($adminToken)->postJson("/api/admin/registrations/{$registration->id}/payment/verify")
        ->assertOk()->assertJsonPath('data.status', RegistrationStatus::VERIFIED->value);

    expect($team->fresh()->current_stage_id)->toBe($stage->id)
        ->and(AdminAuditLog::query()->where('admin_id', $admin->id)->count())->toBe(2);
});

test('admin role policies separate team and payment verification', function (): void {
    $team = Team::factory()->create(['status' => Team::STATUS_WAITING_VERIFICATION]);
    $registrationAdmin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);
    $paymentAdmin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);

    $this->withToken($paymentAdmin->createToken('payment')->plainTextToken)
        ->postJson("/api/admin/teams/{$team->id}/verify")
        ->assertForbidden()
        ->assertJsonPath('error.code', 'FORBIDDEN');
    $this->app['auth']->forgetGuards();

    $this->withToken($registrationAdmin->createToken('registration')->plainTextToken)
        ->postJson("/api/admin/teams/{$team->id}/verify")
        ->assertOk();
});
