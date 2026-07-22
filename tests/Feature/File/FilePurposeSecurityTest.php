<?php

use App\Models\Admin;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('team cannot register batch module metadata', function (): void {
    $team = Team::factory()->create();

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->postJson('/api/files', [
            'file_id' => 'team-module',
            'url' => 'https://ik.imagekit.io/isac/module.pdf',
            'purpose' => 'BATCH_MODULE',
        ])
        ->assertForbidden();
});

test('registration admin can register batch module metadata', function (): void {
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);

    $this->withToken($admin->createToken('auth-token')->plainTextToken)
        ->postJson('/api/files', [
            'file_id' => 'admin-module',
            'url' => 'https://ik.imagekit.io/isac/module.pdf',
            'purpose' => 'BATCH_MODULE',
        ])
        ->assertCreated()
        ->assertJsonPath('data.purpose', 'BATCH_MODULE');
});

test('file metadata rejects a non ImageKit host', function (): void {
    $team = Team::factory()->create();

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->postJson('/api/files', [
            'file_id' => 'hostile-file',
            'url' => 'https://files.example.test/payment.pdf',
            'purpose' => 'PAYMENT_PROOF',
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});
