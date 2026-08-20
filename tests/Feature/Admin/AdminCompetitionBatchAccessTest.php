<?php

use App\Models\Admin;
use App\Models\Batch;
use App\Models\Competition;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);
    $this->token = $this->admin->createToken('admin-registration')->plainTextToken;
});

test('registration admin can update a competition', function (): void {
    $competition = Competition::factory()->create();

    $this->withToken($this->token)
        ->patchJson("/api/admin/competitions/{$competition->id}", [
            'name' => 'Kompetisi Diperbarui',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Kompetisi Diperbarui');
});

test('registration admin can update a batch', function (): void {
    $batch = Batch::factory()->create();

    $this->withToken($this->token)
        ->patchJson("/api/admin/batches/{$batch->id}", [
            'name' => 'Batch Diperbarui',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Batch Diperbarui');
});
