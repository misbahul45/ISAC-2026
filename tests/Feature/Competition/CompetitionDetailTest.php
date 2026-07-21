<?php

use App\Models\Batch;
use App\Models\Competition;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Str;

uses(LazilyRefreshDatabase::class);

test('can view competition detail with batches', function (): void {
    $competition = Competition::factory()->create();
    Batch::factory()->count(2)->create(['competition_id' => $competition->id]);

    $response = $this->getJson("/api/competitions/{$competition->id}");

    $response->assertOk()
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('data.id', $competition->id)
        ->assertJsonStructure([
            'data' => [
                'id', 'name', 'slug', 'type', 'batches',
            ],
        ]);
    expect($response->json('data.batches'))->toHaveCount(2);
});

test('returns 404 for non-existent competition', function (): void {
    $response = $this->getJson('/api/competitions/'.Str::uuid());

    $response->assertNotFound()
        ->assertJsonPath('error.code', 'NOT_FOUND');
});
