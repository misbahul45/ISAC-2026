<?php

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Models\AuthChallenge;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->team = Team::factory()->create([
        'password' => 'Password123!',
        'email_verified_at' => null,
    ]);
    $this->token = $this->team->createToken('auth-token')->plainTextToken;
    $this->code = '123456';
    AuthChallenge::query()->create([
        'account_type' => AccountType::TEAM,
        'account_id' => $this->team->id,
        'purpose' => AuthChallengePurpose::VERIFY_EMAIL,
        'code_hash' => bcrypt($this->code),
        'expired_at' => now()->addMinutes(5),
        'sent_at' => now(),
    ]);
});

test('verify email succeeds with valid code', function (): void {
    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email', [
            'code' => $this->code,
        ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Email berhasil diverifikasi.');

    $this->assertNotNull($this->team->fresh()->email_verified_at);
});

test('verify email fails with wrong code', function (): void {
    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email', [
            'code' => '000000',
        ]);

    $response->assertStatus(401)
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('verify email fails with expired challenge', function (): void {
    AuthChallenge::query()->update(['expired_at' => now()->subMinute()]);

    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email', [
            'code' => $this->code,
        ]);

    $response->assertStatus(401);
});

test('verify email fails after max attempts', function (): void {
    for ($i = 0; $i < 5; $i++) {
        $this->withToken($this->token)
            ->postJson('/api/auth/verify-email', [
                'code' => '000000',
            ]);
    }

    $response = $this->withToken($this->token)
        ->postJson('/api/auth/verify-email', [
            'code' => $this->code,
        ]);

    $response->assertStatus(429);
});

test('verify email requires authentication', function (): void {
    $response = $this->postJson('/api/auth/verify-email', [
        'code' => $this->code,
    ]);

    $response->assertUnauthorized();
});
