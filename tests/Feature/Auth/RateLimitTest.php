<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('register returns 429 after 3 attempts', function (): void {
    for ($i = 0; $i < 3; $i++) {
        $this->postJson('/api/auth/register', [
            'email' => "test{$i}@isac.com",
            'password' => 'Password123!',
            'password_confirmation' => 'Password123!',
        ]);
    }

    $response = $this->postJson('/api/auth/register', [
        'email' => 'overflow@isac.com',
        'password' => 'Password123!',
        'password_confirmation' => 'Password123!',
    ]);

    $response->assertStatus(429)
        ->assertJsonPath('error.code', 'RETRY_LATER');
});

test('login returns 429 after 5 attempts', function (): void {
    Team::factory()->create(['email' => 'team@isac.com', 'password' => 'Password123!', 'email_verified_at' => now()]);

    for ($i = 0; $i < 5; $i++) {
        $this->postJson('/api/auth/login', ['email' => 'team@isac.com', 'password' => 'wrong']);
    }

    $response = $this->postJson('/api/auth/login', ['email' => 'team@isac.com', 'password' => 'wrong']);

    $response->assertStatus(429)
        ->assertJsonPath('error.code', 'RETRY_LATER');
});

test('forgot password returns 429 after 3 attempts', function (): void {
    for ($i = 0; $i < 3; $i++) {
        $this->postJson('/api/auth/forgot-password', ['email' => 'test@isac.com']);
    }

    $response = $this->postJson('/api/auth/forgot-password', ['email' => 'test@isac.com']);

    $response->assertStatus(429)
        ->assertJsonPath('error.code', 'RETRY_LATER');
});
