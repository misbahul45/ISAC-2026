<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('team document and twibbon are stored as google drive urls', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->patchJson('/api/teams/me', [
            'document_url' => 'https://drive.google.com/file/d/document-id/view',
            'twibbon_url' => 'https://drive.google.com/file/d/twibbon-id/view',
        ])
        ->assertOk()
        ->assertJsonPath('data.documentUrl', 'https://drive.google.com/file/d/document-id/view')
        ->assertJsonPath('data.twibbonUrl', 'https://drive.google.com/file/d/twibbon-id/view');

    $this->assertDatabaseHas('teams', [
        'id' => $team->id,
        'document_url' => 'https://drive.google.com/file/d/document-id/view',
        'twibbon_url' => 'https://drive.google.com/file/d/twibbon-id/view',
    ]);
});

test('team document and twibbon reject non google drive urls', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->patchJson('/api/teams/me', [
            'document_url' => 'https://example.com/document.pdf',
            'twibbon_url' => 'https://example.com/twibbon.png',
        ])
        ->assertUnprocessable()
        ->assertJsonStructure(['error' => ['details' => ['document_url', 'twibbon_url']]]);
});
