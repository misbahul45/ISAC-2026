<?php

use App\Models\PasswordResetCode;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('change password updates password and returns success', function (): void {
    $team = Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'OldPassword123!',
    ]);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Password berhasil diubah')
        ->assertJsonPath('data', null)
        ->assertJsonPath('error', null);
});

test('change password actually hashes and updates the password in the database', function (): void {
    $team = Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'OldPassword123!',
    ]);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertOk();

    $team->refresh();
    expect(Hash::check('NewPassword123!', $team->password))->toBeTrue();
    expect(Hash::check('OldPassword123!', $team->password))->toBeFalse();
});

test('change password marks the reset token as used', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $resetToken = Str::random(64);

    $resetCode = PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertOk();

    $resetCode->refresh();
    expect($resetCode->used_at)->not->toBeNull();
});

test('change password revokes all existing sanctum tokens', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);
    $team->createToken('auth-token');
    $team->createToken('another-token');
    expect($team->tokens()->count())->toBe(2);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertOk();

    expect($team->fresh()->tokens()->count())->toBe(0);
});

test('change password cannot be used twice with the same token', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => now(),
    ]);

    $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ])->assertOk();

    // Coba pakai token yang sama lagi
    $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'AnotherPassword123!',
        'password_confirmation' => 'AnotherPassword123!',
    ])->assertStatus(422)
        ->assertJsonPath('error.code', 'INVALID_RESET_TOKEN');
});

test('change password rejects expired reset token', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->subMinute(),
        'verified_at' => now()->subMinutes(2),
    ]);

    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_RESET_TOKEN');
});

test('change password rejects invalid reset token', function (): void {
    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => 'selamat-pagi-warga-ambu',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_RESET_TOKEN');
});

test('change password rejects unverified reset token', function (): void {
    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $resetToken = Str::random(64);

    PasswordResetCode::factory()->create([
        'email' => $team->email,
        'code' => '123456',
        'reset_token' => $resetToken,
        'expired_at' => now()->addMinutes(5),
        'verified_at' => null,
    ]);

    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => $resetToken,
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('error.code', 'INVALID_RESET_TOKEN');
});

test('change password rejects missing reset token', function (): void {
    $response = $this->postJson('/api/auth/change-password', [
        'password' => 'NewPassword123!',
        'password_confirmation' => 'NewPassword123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['resetToken']]]);
});

test('change password rejects short password', function (): void {
    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => 'hai-juga-warga-ambu',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['password']]]);
});

test('change password rejects mismatched confirmation', function (): void {
    $response = $this->postJson('/api/auth/change-password', [
        'resetToken' => 'maringunu',
        'password' => 'NewPassword123!',
        'password_confirmation' => 'DifferentPassword123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['password']]]);
});
