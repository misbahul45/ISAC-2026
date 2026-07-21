<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->team = Team::factory()->create([
        'password' => 'Password123!',
        'email_verified_at' => null,
    ]);
    $this->token = $this->team->createToken('auth-token')->plainTextToken;
});

test('resend verification sends new challenge', function (): void {
    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email/resend');

    $response->assertOk()
        ->assertJsonPath('status', 'success');
});

test('resend verification fails for already verified email', function (): void {
    $this->team->update(['email_verified_at' => now()]);

    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email/resend');

    $response->assertStatus(401)
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('resend verification requires authentication', function (): void {
    $response = $this->postJson('/api/auth/verify-email/resend');

    $response->assertUnauthorized();
});
