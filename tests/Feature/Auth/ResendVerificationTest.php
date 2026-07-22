<?php

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Models\AuthChallenge;
use App\Models\Team;
use App\Services\AuthService;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;

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

test('failed verification delivery preserves the previous valid challenge', function (): void {
    $challenge = AuthChallenge::factory()->create([
        'account_type' => AccountType::TEAM,
        'account_id' => $this->team->id,
        'purpose' => AuthChallengePurpose::VERIFY_EMAIL,
    ]);

    Mail::shouldReceive('to')
        ->once()
        ->andThrow(new RuntimeException('Mail delivery failed.'));

    expect(fn () => app(AuthService::class)->sendVerificationCode($this->team))
        ->toThrow(RuntimeException::class, 'Mail delivery failed.');

    $this->assertDatabaseHas('auth_challenges', ['id' => $challenge->id]);
});
