<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function (): void {
    $this->team = Team::factory()->create();
    $this->token = $this->team->createToken('auth-token')->plainTextToken;
    $this->competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
    ]);
    $this->batch = $this->competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'batch-1',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);

    Registration::query()->create([
        'competition_id' => $this->competition->id,
        'batch_id' => $this->batch->id,
        'team_id' => $this->team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'team_completed_at' => now(),
    ]);
});

test('can get members list', function (): void {
    $this->team->members()->create([
        'name' => 'Leader', 'role' => 'LEADER', 'email' => 'leader@test.com',
        'phone' => '08111', 'major' => 'IPA', 'faculty' => 'MIPA',
        'education_level' => 'SMA', 'student_id' => '123', 'sort_order' => 1,
    ]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/members')
        ->assertOk()
        ->assertJsonCount(1, 'data.members')
        ->assertJsonPath('data.members.0.name', 'Leader');
});

test('can finalize members for OLIMPIADE', function (): void {
    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [[
                'name' => 'John Doe', 'role' => 'LEADER', 'email' => 'john@example.com',
                'phone' => '08123456789', 'major' => 'Matematika', 'faculty' => 'MIPA',
                'education_level' => 'SMA', 'student_id' => '12345', 'birth_date' => '2005-01-15',
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('data.context.progress.membersCompleted', true)
        ->assertJsonPath('data.redirectTo', '/registration/documents');

    expect($this->team->members()->count())->toBe(1);
    expect($this->team->members()->first()->name)->toBe('John Doe');
});

test('rejects more than 1 member for OLIMPIADE', function (): void {
    $member = fn (string $name, string $role, string $email, string $studentId): array => [
        'name' => $name, 'role' => $role, 'email' => $email, 'phone' => '08123456789',
        'major' => 'IPA', 'faculty' => 'MIPA', 'education_level' => 'SMA',
        'student_id' => $studentId, 'birth_date' => '2005-01-01',
    ];

    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [
                $member('A', 'LEADER', 'a@test.com', '1'),
                $member('B', 'MEMBER', 'b@test.com', '2'),
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('requires exactly one leader', function (): void {
    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [[
                'name' => 'A', 'role' => 'MEMBER', 'email' => 'a@test.com', 'phone' => '08123456789',
                'major' => 'IPA', 'faculty' => 'MIPA', 'education_level' => 'SMA',
                'student_id' => '1', 'birth_date' => '2005-01-01',
            ]],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('members endpoints require authentication', function (): void {
    $this->getJson('/api/registrations/me/members')->assertUnauthorized();
    $this->putJson('/api/registrations/me/members', [])->assertUnauthorized();
});
