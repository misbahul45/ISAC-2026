<?php

use App\Models\File;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('team cannot download file uploaded by another team', function (): void {
    $owner = Team::factory()->create();
    $intruder = Team::factory()->create();

    $file = File::query()->create([
        'file_id' => 'file-owner-001',
        'url' => 'https://ik.imagekit.io/isac/owner.pdf',
        'uploaded_by' => $owner->id,
    ]);

    $this->withToken($intruder->createToken('auth-token')->plainTextToken)
        ->getJson("/api/files/{$file->id}")
        ->assertForbidden();
});

test('team can download their own file', function (): void {
    $team = Team::factory()->create();

    $file = File::query()->create([
        'file_id' => 'file-self-001',
        'url' => 'https://ik.imagekit.io/isac/self.pdf',
        'uploaded_by' => $team->id,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->get("/api/files/{$file->id}")
        ->assertRedirect($file->url);
});

test('file with no owner is accessible to any authenticated team', function (): void {
    $team = Team::factory()->create();

    $file = File::query()->create([
        'file_id' => 'file-public-001',
        'url' => 'https://ik.imagekit.io/isac/public.pdf',
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->get("/api/files/{$file->id}")
        ->assertRedirect($file->url);
});
