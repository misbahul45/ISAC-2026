<?php

use App\Models\Admin;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('login returns token with principalType TEAM for valid team credentials', function (): void {
    $team = Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Login berhasil')
        ->assertJsonPath('data.team.id', $team->id)
        ->assertJsonPath('data.team.email', 'team.alpha@gmail.com')
        ->assertJsonPath('data.tokenType', 'Bearer')
        ->assertJsonPath('data.principalType', 'TEAM')
        ->assertJsonPath('data.redirectTo', '/registration')
        ->assertJsonStructure(['data' => ['token', 'tokenType', 'principalType', 'redirectTo', 'team' => ['id', 'code', 'email', 'status']]]);

    $plainToken = $response->json('data.token');
    expect($plainToken)->toBeString()->not->toBeEmpty();

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $team->id,
        'name' => 'auth-token',
    ]);
});

test('login returns token with principalType ADMIN for valid admin credentials', function (): void {
    $admin = Admin::factory()->create([
        'email' => 'admin@isac.com',
        'password' => 'AdminPass123!',
        'is_active' => true,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'admin@isac.com',
        'password' => 'AdminPass123!',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.principalType', 'ADMIN')
        ->assertJsonPath('data.admin.email', 'admin@isac.com')
        ->assertJsonPath('data.redirectTo', '/admin/dashboard')
        ->assertJsonStructure(['data' => ['token', 'tokenType', 'principalType', 'redirectTo', 'admin' => ['id', 'email', 'name', 'role']]]);
});

test('login rejects inactive admin', function (): void {
    Admin::factory()->create([
        'email' => 'inactive@isac.com',
        'password' => 'AdminPass123!',
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'inactive@isac.com',
        'password' => 'AdminPass123!',
    ]);

    $response->assertStatus(403)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects ambiguous email found in both teams and admins', function (): void {
    Team::factory()->create(['email' => 'shared@isac.com']);
    Admin::factory()->create(['email' => 'shared@isac.com', 'password' => 'AdminPass123!']);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'shared@isac.com',
        'password' => 'AdminPass123!',
    ]);

    $response->assertStatus(409)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects unknown email with invalid credentials', function (): void {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'ghost@gmail.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Email atau password salah.')
        ->assertJsonPath('data', null)
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects wrong password with invalid credentials', function (): void {
    Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
        'email_verified_at' => now(),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'team.alpha@gmail.com',
        'password' => 'WrongPassword!',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects unverified email', function (): void {
    Team::factory()->create([
        'email' => 'unverified@test.com',
        'password' => 'Password123!',
        'email_verified_at' => null,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'unverified@test.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects missing email and password', function (): void {
    $response = $this->postJson('/api/auth/login', []);

    $response->assertStatus(422)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'VALIDATION_ERROR')
        ->assertJsonStructure(['error' => ['fields' => ['email', 'password']]]);
});

test('login deletes prior sanctum tokens before issuing a new one', function (): void {
    $team = Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
        'email_verified_at' => now(),
    ]);

    $team->createToken('auth-token');
    $team->createToken('legacy-token');
    expect($team->tokens()->count())->toBe(2);

    $this->postJson('/api/auth/login', [
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
    ])->assertOk();

    $fresh = $team->fresh();
    expect($fresh->tokens()->count())->toBe(1);
    expect($fresh->tokens()->first()->name)->toBe('auth-token');
});
