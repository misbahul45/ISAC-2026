<?php

use App\Models\Admin;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->admin = Admin::factory()->create([
        'password' => 'Password123!',
        'is_active' => true,
    ]);
});

test('admin can login via shared endpoint with valid credentials', function (): void {
    $response = $this->postJson('/api/auth/login', [
        'email' => $this->admin->email,
        'password' => 'Password123!',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.principalType', 'ADMIN')
        ->assertJsonPath('data.redirectTo', '/admin/dashboard')
        ->assertJsonStructure([
            'data' => ['token', 'tokenType', 'principalType', 'redirectTo', 'admin' => ['id', 'name', 'email', 'role', 'isActive']],
        ]);
});

test('admin cannot login with wrong password via shared endpoint', function (): void {
    $response = $this->postJson('/api/auth/login', [
        'email' => $this->admin->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized()
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('admin cannot login with wrong email via shared endpoint', function (): void {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'nonexistent@isac.com',
        'password' => 'Password123!',
    ]);

    $response->assertUnauthorized()
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('admin cannot login when inactive', function (): void {
    $inactive = Admin::factory()->create([
        'email' => 'inactive@isac.com',
        'password' => 'Password123!',
        'is_active' => false,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $inactive->email,
        'password' => 'Password123!',
    ]);

    $response->assertStatus(403)
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('admin can view their profile via shared me endpoint', function (): void {
    $token = $this->admin->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/auth/me');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.principalType', 'ADMIN')
        ->assertJsonPath('data.admin.id', $this->admin->id)
        ->assertJsonPath('data.admin.email', $this->admin->email);
});

test('admin can logout via shared logout endpoint', function (): void {
    $token = $this->admin->createToken('auth-token')->plainTextToken;

    $response = $this->withToken($token)
        ->postJson('/api/auth/logout');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Logout berhasil');
});

test('guest cannot access me', function (): void {
    $response = $this->getJson('/api/auth/me');

    $response->assertUnauthorized();
});

test('guest cannot access logout', function (): void {
    $response = $this->postJson('/api/auth/logout');

    $response->assertUnauthorized();
});

test('guest cannot access admin competitions', function (): void {
    $response = $this->postJson('/api/admin/competitions', [
        'name' => 'Test',
        'type' => 'OLYMPIAD',
        'payment_flow' => 'UPFRONT',
        'start_date' => now()->addDay()->toDateString(),
        'end_date' => now()->addMonth()->toDateString(),
    ]);

    $response->assertUnauthorized();
});
