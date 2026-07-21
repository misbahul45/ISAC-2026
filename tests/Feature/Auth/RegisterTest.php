<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('register creates a team on valid payload', function (): void {
    $payload = [
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ];

    $response = $this->postJson('/api/auth/register', $payload);

    $response->assertCreated()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Akun team berhasil dibuat. Silakan cek email kamu untuk kode verifikasi.')
        ->assertJsonPath('data.team.email', 'team.alpha@gmail.com')
        ->assertJsonPath('data.team.status', 'INCOMPLETE')
        ->assertJsonPath('data.team.emailVerifiedAt', null)
        ->assertJsonPath('data.principalType', 'TEAM')
        ->assertJsonStructure(['data' => ['token', 'tokenType', 'principalType', 'redirectTo', 'team' => ['id', 'code', 'email', 'status', 'emailVerifiedAt']]]);

    $this->assertDatabaseHas('teams', ['email' => 'team.alpha@gmail.com']);

    $team = Team::query()->where('email', 'team.alpha@gmail.com')->firstOrFail();
    expect($team->code)->toMatch('/^ISAC-TM-\d{3}$/');
    expect($team->password)->not->toBe('Password123!');
    expect($team->email_verified_at)->toBeNull();

    $plainToken = $response->json('data.token');
    expect($plainToken)->toBeString()->not->toBeEmpty();
});

test('register rejects duplicate email', function (): void {
    Team::factory()->create(['email' => 'dup@gmail.com']);

    $response = $this->postJson('/api/auth/register', [
        'email' => 'dup@gmail.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.details.email.0', 'Email sudah digunakan');
});

test('register rejects short password', function (): void {
    $response = $this->postJson('/api/auth/register', [
        'email' => 'short@gmail.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.details.password.0', 'Password minimal 8 karakter.');
});

test('register rejects mismatched confirmation', function (): void {
    $response = $this->postJson('/api/auth/register', [
        'email' => 'mismatch@gmail.com',
        'password' => 'Password123!',
        'password_confirmation' => 'DifferentPass123!',
    ]);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonPath('error.details.password.0', 'Konfirmasi password tidak cocok.');
});
