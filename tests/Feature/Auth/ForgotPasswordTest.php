<?php

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Models\AuthChallenge;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(LazilyRefreshDatabase::class);

test('forgot password sends otp and returns generic success for registered email', function (): void {
    Mail::fake();

    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Kode reset password berhasil dikirim ke email')
        ->assertJsonPath('data', null)
        ->assertJsonPath('error', null)
        ->assertJsonStructure(['status', 'message', 'data', 'metadata', 'error']);

    $this->assertDatabaseHas('auth_challenges', [
        'account_id' => $team->id,
        'account_type' => AccountType::TEAM->value,
        'purpose' => AuthChallengePurpose::RESET_PASSWORD->value,
    ]);
});

test('forgot password returns generic success even for unregistered email', function (): void {
    Mail::fake();

    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => 'ghost@gmail.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data', null);
});

test('forgot password generates a 6-digit otp code', function (): void {
    Mail::fake();

    Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();
});

test('forgot password sets expired_at 5 minutes from now', function (): void {
    Mail::fake();

    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $before = now()->addMinutes(4);
    $after = now()->addMinutes(6);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();

    $challenge = AuthChallenge::query()
        ->where('account_id', $team->id)
        ->first();

    expect($challenge)->not->toBeNull();
    expect($challenge->expired_at->between($before, $after))->toBeTrue();
});

test('forgot password deletes old codes before creating a new one', function (): void {
    Mail::fake();

    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    AuthChallenge::factory()->count(2)->create([
        'account_type' => AccountType::TEAM,
        'account_id' => $team->id,
        'purpose' => AuthChallengePurpose::RESET_PASSWORD,
    ]);
    expect(AuthChallenge::query()->where('account_id', $team->id)->count())->toBe(2);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();

    expect(AuthChallenge::query()->where('account_id', $team->id)->count())->toBe(1);
});

test('forgot password rejects missing email', function (): void {
    $response = $this->postJson('/api/auth/forgot-password', []);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['email']]]);
});

test('forgot password rejects invalid email format', function (): void {
    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => 'not-an-email',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['email']]]);
});
