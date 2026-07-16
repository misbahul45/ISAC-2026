<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('me returns authenticated team data', function (): void {
    $team = Team::factory()->create([
        'name'        => 'Alpha Team',
        'phone'       => '081234567890',
        'school_name' => 'SMA Negeri 1',
    ]);
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Data user berhasil diambil')
        ->assertJsonPath('data.id', $team->id)
        ->assertJsonPath('data.code', $team->code)
        ->assertJsonPath('data.email', $team->email)
        ->assertJsonPath('data.name', 'Alpha Team')
        ->assertJsonPath('data.phone', '081234567890')
        ->assertJsonPath('data.schoolName', 'SMA Negeri 1')
        ->assertJsonPath('data.status', 'ACTIVE')
        ->assertJsonPath('error', null)
        ->assertJsonStructure([
            'status',
            'message',
            'data' => ['id', 'code', 'email', 'name', 'phone', 'schoolName', 'status'],
            'metadata',
            'error',
        ]);
});

test('me returns null for optional profile fields when not yet filled', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.name', null)
        ->assertJsonPath('data.phone', null)
        ->assertJsonPath('data.schoolName', null);
});

test('me rejects unauthenticated request', function (): void {
    $this->getJson('/api/auth/me')
        ->assertUnauthorized();
});

test('me rejects request with invalid token', function (): void {
    $this->withToken('invalid-token-string')
        ->getJson('/api/auth/me')
        ->assertUnauthorized();
});

test('me rejects request after token is revoked', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $team->tokens()->delete();

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertUnauthorized();
});
