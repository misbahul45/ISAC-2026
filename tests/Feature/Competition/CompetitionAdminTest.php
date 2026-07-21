<?php

use App\Models\Admin;
use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->admin = Admin::factory()->create();
    $this->token = $this->admin->createToken('admin-token')->plainTextToken;
});

test('admin can create a competition', function (): void {
    $payload = [
        'name' => 'OLYMPIAD SAINS 2026',
        'slug' => 'olympiad-sains-2026',
        'description' => 'Kompetisi sains nasional',
        'type' => 'OLYMPIAD',
        'payment_flow' => 'UPFRONT',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
        'status' => 'DRAFT',
    ];

    $response = $this->withToken($this->token)
        ->postJson('/api/admin/competitions', $payload);

    $response->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.name', 'OLYMPIAD SAINS 2026')
        ->assertJsonPath('data.type', 'OLYMPIAD')
        ->assertJsonPath('data.paymentFlow', 'UPFRONT')
        ->assertJsonPath('data.status', 'DRAFT');
});

test('admin cannot create competition with wrong type-paymentFlow combination', function (): void {
    $payload = [
        'name' => 'OLYMPIAD SAINS 2026',
        'type' => 'OLYMPIAD',
        'payment_flow' => 'SEMIFINAL',
        'status' => 'DRAFT',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
    ];

    $response = $this->withToken($this->token)
        ->postJson('/api/admin/competitions', $payload);

    $response->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['payment_flow']]]);
});

test('admin can update a competition', function (): void {
    $competition = Competition::factory()->create();
    $payload = ['name' => 'OLYMPIAD SAINS 2026 UPDATED'];

    $response = $this->withToken($this->token)
        ->patchJson("/api/admin/competitions/{$competition->id}", $payload);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.name', 'OLYMPIAD SAINS 2026 UPDATED');
});

test('admin cannot update competition to a slug that already exists', function (): void {
    $existing = Competition::factory()->create(['slug' => 'existing-slug']);
    $competition = Competition::factory()->create(['slug' => 'my-slug']);

    $response = $this->withToken($this->token)
        ->patchJson("/api/admin/competitions/{$competition->id}", [
            'slug' => $existing->slug,
        ]);

    $response->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['slug']]]);
});

test('admin cannot update competition with invalid status transition', function (): void {
    $competition = Competition::factory()->create(['status' => Competition::STATUS_DRAFT]);

    $response = $this->withToken($this->token)
        ->patchJson("/api/admin/competitions/{$competition->id}", [
            'status' => 'ONGOING',
        ]);

    $response->assertUnprocessable();
});

test('admin can delete a competition without active batches', function (): void {
    $competition = Competition::factory()->create();

    $response = $this->withToken($this->token)
        ->deleteJson("/api/admin/competitions/{$competition->id}");

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});

test('admin cannot delete competition with active batches', function (): void {
    $competition = Competition::factory()->create();
    Batch::factory()->create([
        'competition_id' => $competition->id,
        'status' => BatchStatus::OPEN,
    ]);

    $response = $this->withToken($this->token)
        ->deleteJson("/api/admin/competitions/{$competition->id}");

    $response->assertUnprocessable();
});

test('admin cannot create business plan with upfront payment', function (): void {
    $payload = [
        'name' => 'BUSINESS PLAN 2026',
        'type' => 'BUSINESS_PLAN',
        'payment_flow' => 'UPFRONT',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
    ];

    $response = $this->withToken($this->token)
        ->postJson('/api/admin/competitions', $payload);

    $response->assertUnprocessable()
        ->assertJsonStructure(['error' => ['fields' => ['payment_flow']]]);
});

test('guest cannot create competition', function (): void {
    $response = $this->postJson('/api/admin/competitions', [
        'name' => 'Test',
        'type' => 'OLYMPIAD',
        'payment_flow' => 'UPFRONT',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
    ]);

    $response->assertUnauthorized();
});
