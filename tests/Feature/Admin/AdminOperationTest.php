<?php

use App\Models\Admin;
use App\Models\AdminOperation;
use App\Models\AdminAuditLog;
use App\Models\SpreadsheetIntegrationEvent;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('admin announcement operation is database-first, auditable, and idempotent', function (): void {
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);
    $team = Team::factory()->create(['email' => 'operations@example.test', 'name' => 'Operation Team']);
    $token = $admin->createToken('admin-operation')->plainTextToken;
    $key = 'announce-operation-key';

    $response = $this->withToken($token)
        ->withHeader('Idempotency-Key', $key)
        ->postJson('/api/admin/operations', [
            'action' => AdminOperation::ACTION_ANNOUNCE_RESULT,
            'team_ids' => [$team->id],
            'sync_spreadsheet' => true,
            'announcement' => [
                'title' => 'Pengumuman uji',
                'template' => 'stage-qualified',
                'send_notification' => false,
            ],
        ])
        ->assertAccepted()
        ->assertJsonPath('data.action', AdminOperation::ACTION_ANNOUNCE_RESULT);

    $operationId = $response->json('data.id');
    $operation = AdminOperation::query()->findOrFail($operationId);

    expect(AdminAuditLog::query()->where('admin_id', $admin->id)->pluck('action')->all())->toBe(['competition.result_announced'])
        ->and(SpreadsheetIntegrationEvent::query()->where('operation_id', $operationId)->count())->toBe(1)
        ->and($operation->fresh()->status)->toBe(AdminOperation::STATUS_COMPLETED);

    $second = $this->withToken($token)
        ->withHeader('Idempotency-Key', $key)
        ->postJson('/api/admin/operations', [
            'action' => AdminOperation::ACTION_ANNOUNCE_RESULT,
            'team_ids' => [$team->id],
            'sync_spreadsheet' => true,
            'announcement' => [
                'title' => 'Pengumuman uji',
                'template' => 'stage-qualified',
                'send_notification' => false,
            ],
        ])
        ->assertAccepted();

    expect($second->json('data.id'))->toBe($operationId);
});
