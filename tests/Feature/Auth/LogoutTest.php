<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('logout revokes current token and returns success', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    expect($team->tokens()->count())->toBe(1);

    $response = $this->withToken($token)->postJson('/api/auth/logout');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Logout berhasil')
        ->assertJsonPath('data', null)
        ->assertJsonPath('error', null);

    $fresh = $team->fresh();
    expect($fresh->tokens()->count())->toBe(0);

    $this->assertDatabaseMissing('personal_access_tokens', [
        'tokenable_id' => $team->id,
    ]);
});

test('logout rejects unauthenticated request', function (): void {
    $response = $this->postJson('/api/auth/logout');

    $response->assertStatus(401);
});
