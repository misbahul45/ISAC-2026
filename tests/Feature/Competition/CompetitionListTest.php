<?php

use App\Models\Competition;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('can list competitions with pagination', function (): void {
    Competition::factory()->count(5)->create();

    $response = $this->getJson('/api/competitions');

    $response->assertOk()
        ->assertJsonStructure([
            'status',
            'message',
            'data' => [
                '*' => [
                    'id', 'name', 'slug', 'description', 'type',
                    'paymentFlow', 'startDate', 'endDate', 'status',
                    'createdAt', 'updatedAt',
                ],
            ],
            'metadata' => ['pagination' => ['page', 'perPage', 'total', 'lastPage']],
            'error',
        ])
        ->assertJsonPath('status', 'success')
        ->assertJsonPath('metadata.pagination.total', 5);
});

test('can filter competitions by type', function (): void {
    Competition::factory()->create(['type' => Competition::TYPE_OLIMPIADE]);
    Competition::factory()->create(['type' => Competition::TYPE_BUSINESS_PLAN]);
    Competition::factory()->create(['type' => Competition::TYPE_BUSINESS_IT_CASE]);

    $response = $this->getJson('/api/competitions?type=OLYMPIAD');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.type'))->toBe('OLYMPIAD');
});

test('can filter competitions by status', function (): void {
    Competition::factory()->create(['status' => Competition::STATUS_DRAFT]);
    Competition::factory()->create(['status' => Competition::STATUS_REGISTRATION_OPEN]);

    $response = $this->getJson('/api/competitions?status=DRAFT');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.status'))->toBe('DRAFT');
});

test('can search competitions by name', function (): void {
    Competition::factory()->create(['name' => 'OLIMPIADE SAINS 2026']);
    Competition::factory()->create(['name' => 'BUSINESS PLAN COMPETITION']);

    $response = $this->getJson('/api/competitions?search=OLIMPIADE');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(1);
    expect($response->json('data.0.name'))->toContain('OLIMPIADE');
});
