<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('authenticated team can register external file metadata', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/files', [
            'fileId' => 'imagekit-file-123',
            'url' => 'https://ik.imagekit.io/isac/payment-proof.pdf',
        ])
        ->assertCreated()
        ->assertJsonPath('data.fileId', 'imagekit-file-123')
        ->assertJsonPath('data.url', 'https://ik.imagekit.io/isac/payment-proof.pdf')
        ->assertJsonStructure(['data' => ['id', 'fileId', 'url']]);

    $this->assertDatabaseHas('files', [
        'file_id' => 'imagekit-file-123',
        'url' => 'https://ik.imagekit.io/isac/payment-proof.pdf',
    ]);
});

test('external file id must be unique', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;
    $payload = [
        'fileId' => 'imagekit-file-123',
        'url' => 'https://ik.imagekit.io/isac/payment-proof.pdf',
    ];

    $this->withToken($token)->postJson('/api/files', $payload)->assertCreated();

    $this->withToken($token)
        ->postJson('/api/files', $payload)
        ->assertUnprocessable()
        ->assertJsonPath('error.fields.fileId.0', 'File sudah tercatat.');
});
