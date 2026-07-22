<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('authenticated team can register external file metadata', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;

    $this->withToken($token)
        ->postJson('/api/files', [
            'file_id' => 'imagekit-file-123',
            'url' => 'https://ik.imagekit.io/isac/payment-proof.pdf',
            'purpose' => 'PAYMENT_PROOF',
        ])
        ->assertCreated()
        ->assertJsonPath('data.fileId', 'imagekit-file-123')
        ->assertJsonPath('data.url', 'https://ik.imagekit.io/isac/payment-proof.pdf')
        ->assertJsonPath('data.purpose', 'PAYMENT_PROOF')
        ->assertJsonStructure(['data' => ['id', 'fileId', 'url', 'purpose']]);

    $this->assertDatabaseHas('files', [
        'file_id' => 'imagekit-file-123',
        'uploaded_by' => $team->id,
        'purpose' => 'PAYMENT_PROOF',
    ]);
});

test('external file id must be unique', function (): void {
    $team = Team::factory()->create();
    $token = $team->createToken('auth-token')->plainTextToken;
    $payload = [
        'file_id' => 'imagekit-file-123',
        'url' => 'https://ik.imagekit.io/isac/payment-proof.pdf',
        'purpose' => 'PAYMENT_PROOF',
    ];

    $this->withToken($token)->postJson('/api/files', $payload)->assertCreated();

    $this->withToken($token)
        ->postJson('/api/files', $payload)
        ->assertUnprocessable()
        ->assertJsonPath('error.details.file_id.0', 'File sudah tercatat.');
});
