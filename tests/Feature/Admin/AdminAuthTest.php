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

test('admin can login with valid credentials', function (): void {
    $response = $this->postJson('/api/admin/login', [
        'email' => $this->admin->email,
        'password' => 'Password123!',
    ]);

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Login berhasil.')
        ->assertJsonStructure([
            'data' => ['token', 'tokenType', 'admin' => ['id', 'name', 'email', 'role', 'isActive']],
        ]);
});

test('admin cannot login with wrong password', function (): void {
    $response = $this->postJson('/api/admin/login', [
        'email' => $this->admin->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized()
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('admin cannot login with wrong email', function (): void {
    $response = $this->postJson('/api/admin/login', [
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

    $response = $this->postJson('/api/admin/login', [
        'email' => $inactive->email,
        'password' => 'Password123!',
    ]);

    $response->assertUnauthorized()
        ->assertJsonPath('error.code', 'INVALID_CREDENTIALS');
});

test('admin can view their profile', function (): void {
    $token = $this->admin->createToken('admin-token')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/admin/me');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $this->admin->id)
        ->assertJsonPath('data.email', $this->admin->email);
});

test('admin can logout', function (): void {
    $token = $this->admin->createToken('admin-token')->plainTextToken;

    $response = $this->withToken($token)
        ->postJson('/api/admin/logout');

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('message', 'Logout berhasil.');
});

test('guest cannot access me', function (): void {
    $response = $this->getJson('/api/admin/me');

    $response->assertUnauthorized();
});

test('guest cannot access logout', function (): void {
    $response = $this->postJson('/api/admin/logout');

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
