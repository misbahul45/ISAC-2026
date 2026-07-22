<?php

use App\Models\Admin;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('me returns authenticated team data with principalType', function (): void {
    $team = Team::factory()->create([
        'name' => 'Alpha Team',
        'phone' => '081234567890',
        'institution_name' => 'SMA Negeri 1',
        'institution_address' => '{"province":"Jawa Timur","city":"Surabaya","address":"Jl. Wijaya Kusuma No. 48"}',
    ]);
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Data user berhasil diambil')
        ->assertJsonPath('data.principalType', 'TEAM')
        ->assertJsonPath('data.team.id', $team->id)
        ->assertJsonPath('data.team.code', $team->code)
        ->assertJsonPath('data.team.email', $team->email)
        ->assertJsonPath('data.team.name', 'Alpha Team')
        ->assertJsonPath('data.team.phone', '081234567890')
        ->assertJsonPath('data.team.institutionName', 'SMA Negeri 1')
        ->assertJsonPath('data.team.institutionAddress', $team->institution_address)
        ->assertJsonPath('data.team.status', 'INCOMPLETE')
        ->assertJsonPath('data.team.emailVerifiedAt', $team->email_verified_at?->toISOString())
        ->assertJsonPath('data.team.nextRedirect', $team->next_redirect)
        ->assertJsonPath('data.team.redirectTo', $team->next_redirect)
        ->assertJsonPath('error', null)
        ->assertJsonStructure([
            'status', 'message',
            'data' => ['principalType', 'team' => ['id', 'code', 'email', 'name', 'phone', 'institutionName', 'institutionAddress', 'status', 'emailVerifiedAt', 'nextRedirect', 'redirectTo']],
            'metadata', 'error',
        ]);
});

test('me returns authenticated admin data with principalType', function (): void {
    $admin = Admin::factory()->create([
        'name' => 'Super Admin',
        'role' => 'super_admin',
    ]);
    $token = $admin->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.principalType', 'ADMIN')
        ->assertJsonPath('data.admin.id', $admin->id)
        ->assertJsonPath('data.admin.name', 'Super Admin')
        ->assertJsonPath('data.admin.role', 'super_admin')
        ->assertJsonPath('data.admin.email', $admin->email)
        ->assertJsonStructure(['data' => ['principalType', 'admin' => ['id', 'email', 'name', 'role', 'isActive']]]);
});

test('me returns null for optional profile fields when not yet filled', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->getJson('/api/auth/me')
        ->assertOk()
        ->assertJsonPath('data.team.name', null)
        ->assertJsonPath('data.team.phone', null)
        ->assertJsonPath('data.team.institutionName', null)
        ->assertJsonPath('data.team.institutionAddress', null);
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
