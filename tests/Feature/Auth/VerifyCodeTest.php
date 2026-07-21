<?php

use App\Models\PasswordResetCode;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('verify code returns reset token on valid otp', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->addMinutes(5),
    ]);

    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '123456',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Kode berhasil diverifikasi')
        ->assertJsonPath('error', null)
        ->assertJsonStructure(['status', 'message', 'data' => ['resetToken'], 'metadata', 'error']);

    $resetToken = $response->json('data.resetToken');
    expect($resetToken)->toBeString()->not->toBeEmpty();
});

test('verify code marks the otp as verified in the database', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $resetCode = PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->addMinutes(5),
    ]);

    $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '123456',
    ])->assertOk();

    $resetCode->refresh();
    expect($resetCode->verified_at)->not->toBeNull();
    expect($resetCode->reset_token)->not->toBeNull();
});

test('verify code rejects expired otp', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->subMinute(),
    ]);

    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_OTP');
});

test('verify code rejects already verified otp', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_OTP');
});

test('verify code rejects already used otp', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->addMinutes(5),
        'used_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '123456',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_OTP');
});

test('verify code rejects wrong code', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'expired_at' => now()->addMinutes(5),
    ]);

    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '999999',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_OTP');
});

test('verify code rejects missing email and code', function (): void {
    $response = $this->postJson('/api/auth/verify-code', []);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['email', 'code']]]);
});

test('verify code rejects code that is not 6 digits', function (): void {
    $response = $this->postJson('/api/auth/verify-code', [
        'email' => 'team.alpha@gmail.com',
        'code' => '12345',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['code']]]);
});
