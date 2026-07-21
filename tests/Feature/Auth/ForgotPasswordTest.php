<?php

use App\Models\PasswordResetCode;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;

uses(LazilyRefreshDatabase::class);

test('forgot password sends otp and returns success for registered email', function (): void {
    Mail::fake();

    Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Kode reset password berhasil dikirim ke email')
        ->assertJsonPath('data.email', 'team.alpha@gmail.com')
        ->assertJsonPath('error', null)
        ->assertJsonStructure(['status', 'message', 'data' => ['email'], 'metadata', 'error']);

    $this->assertDatabaseHas('password_reset_codes', [
        'email' => 'team.alpha@gmail.com',
    ]);
});

test('forgot password generates a 6-digit otp code', function (): void {
    Mail::fake();

    Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();

    $resetCode = PasswordResetCode::query()
        ->where('email', 'team.alpha@gmail.com')
        ->first();

    expect($resetCode)->not->toBeNull();
    expect($resetCode->code)->toMatch('/^\d{6}$/');
});

test('forgot password sets expired_at 5 minutes from now', function (): void {
    Mail::fake();

    Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    $before = now()->addMinutes(4);
    $after = now()->addMinutes(6);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();

    $resetCode = PasswordResetCode::query()
        ->where('email', 'team.alpha@gmail.com')
        ->first();

    expect($resetCode->expired_at->between($before, $after))->toBeTrue();
});

test('forgot password deletes old codes before creating a new one', function (): void {
    Mail::fake();

    $team = Team::factory()->create(['email' => 'team.alpha@gmail.com']);

    PasswordResetCode::factory()->count(2)->create(['email' => $team->email]);
    expect(PasswordResetCode::query()->where('email', $team->email)->count())->toBe(2);

    $this->postJson('/api/auth/forgot-password', [
        'email' => 'team.alpha@gmail.com',
    ])->assertOk();

    expect(PasswordResetCode::query()->where('email', $team->email)->count())->toBe(1);
});

test('forgot password rejects unregistered email', function (): void {
    $response = $this->postJson('/api/auth/forgot-password', [
        'email' => 'ghost@gmail.com',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['email']]]);
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
