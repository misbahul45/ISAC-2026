<?php

use App\Models\Admin;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('admin cannot request data revision before team submits', function (): void {
    $team = Team::factory()->create(['status' => Team::STATUS_INCOMPLETE]);
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->postJson("/api/admin/teams/{$team->id}/revision", [
            'revision_step' => 'TEAM',
            'verification_note' => 'Lengkapi profil.',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('admin cannot skip a competition stage', function (): void {
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_ONGOING,
        'type' => Competition::TYPE_BUSINESS_PLAN,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch', 'slug' => 'stage-guard-batch',
        'start_date' => now()->subMonth(), 'end_date' => now()->addMonth(),
        'price' => 250000, 'quota' => 10, 'status' => BatchStatus::OPEN,
    ]);
    $first = Stage::query()->create([
        'competition_id' => $competition->id, 'name' => 'Registration',
        'type' => 'registration', 'order' => 1, 'is_active' => true,
    ]);
    $third = Stage::query()->create([
        'competition_id' => $competition->id, 'name' => 'Semifinal',
        'type' => 'selection', 'order' => 3, 'is_active' => false,
    ]);
    $team = Team::factory()->create([
        'status' => Team::STATUS_VERIFIED,
        'current_stage_id' => $first->id,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id,
        'team_id' => $team->id, 'status' => RegistrationStatus::VERIFIED,
        'submitted_at' => now(),
    ]);
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->postJson("/api/admin/teams/{$team->id}/stages/{$third->id}/advance")
        ->assertUnprocessable()
        ->assertJsonPath('error.details.stage.0', 'Stage harus diproses berurutan.');
});

test('payment revision requires a submitted payment', function (): void {
    $team = Team::factory()->create();
    $competition = Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);
    $batch = $competition->batches()->create([
        'name' => 'Batch', 'slug' => 'payment-transition-batch',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 10, 'status' => BatchStatus::OPEN,
    ]);
    $registration = Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id,
        'team_id' => $team->id, 'status' => RegistrationStatus::WAITING_PAYMENT,
    ]);
    $admin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->postJson("/api/admin/registrations/{$registration->id}/payment/revision", [
            'reason' => 'Bukti tidak terbaca.',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});
