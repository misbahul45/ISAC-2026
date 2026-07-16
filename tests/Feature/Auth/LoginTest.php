<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('login returns token for valid credentials', function (): void {
    $team = Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
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
        ->assertJsonStructure(['data' => ['token', 'tokenType', 'team' => ['id', 'code', 'email', 'status']]]);

    $plainToken = $response->json('data.token');
    expect($plainToken)->toBeString()->not->toBeEmpty();

    $this->assertDatabaseHas('personal_access_tokens', [
        'tokenable_id' => $team->id,
        'name' => 'auth-token',
    ]);
});

test('login rejects unknown email with invalid credentials', function (): void {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'ghost@gmail.com',
        'password' => 'Password123!',
    ]);

    $response->assertStatus(401)
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('message', 'Email atau password salah')
        ->assertJsonPath('data', null)
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('login rejects wrong password with invalid credentials', function (): void {
    Team::factory()->create([
        'email' => 'team.alpha@gmail.com',
        'password' => 'Password123!',
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => 'team.alpha@gmail.com',
        'password' => 'WrongPassword!',
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
