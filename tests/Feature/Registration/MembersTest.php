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
        'student_id' => '123', 'sort_order' => 1,
    ]);

    $response = $this->withToken($this->token)
        ->getJson('/api/registrations/me/members')
        ->assertOk()
        ->assertJsonCount(1, 'data.members')
        ->assertJsonPath('data.members.0.name', 'Leader')
        ->assertJsonPath('data.participantCategory', 'HIGH_SCHOOL_STUDENT')
        ->assertJsonPath('data.identityLabel', 'NISN')
        ->assertJsonPath('data.showsLeaderRole', false);

    expect($response->json('data.members.0'))
        ->not->toHaveKeys(['phone', 'educationLevel', 'birthDate']);
});

test('can finalize an olympiad participant without leader selection or photo', function (): void {
    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [[
                'name' => 'John Doe', 'role' => 'MEMBER', 'email' => 'john@example.com',
                'major' => 'Matematika', 'faculty' => 'MIPA', 'student_id' => '12345',
                'photo_file_id' => null,
            ]],
        ])
        ->assertOk()
        ->assertJsonPath('data.context.progress.membersCompleted', true)
        ->assertJsonPath('data.redirectTo', '/registration/documents');

    expect($this->team->members()->count())->toBe(1);
    expect($this->team->members()->first())
        ->name->toBe('John Doe')
        ->role->toBe('LEADER')
        ->major->toBeNull()
        ->faculty->toBeNull()
        ->photo_file_id->toBeNull();
});

test('rejects more than 1 member for OLIMPIADE', function (): void {
    $member = fn (string $name, string $role, string $email, string $studentId): array => [
        'name' => $name, 'role' => $role, 'email' => $email,
        'student_id' => $studentId,
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

test('requires exactly one leader for business plan', function (): void {
    $this->competition->update(['type' => Competition::TYPE_BUSINESS_PLAN]);

    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [
                ['name' => 'A', 'role' => 'MEMBER', 'email' => 'a@test.com', 'student_id' => '001'],
                ['name' => 'B', 'role' => 'MEMBER', 'email' => 'b@test.com', 'student_id' => '002'],
                ['name' => 'C', 'role' => 'MEMBER', 'email' => 'c@test.com', 'student_id' => '003'],
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.code', 'VALIDATION_ERROR');
});

test('business competitions require exactly three participants', function (): void {
    $this->competition->update(['type' => Competition::TYPE_BUSINESS_PLAN]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/members')
        ->assertOk()
        ->assertJsonPath('data.minMembers', 3)
        ->assertJsonPath('data.maxMembers', 3);

    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [
                ['name' => 'A', 'role' => 'LEADER', 'email' => 'a@test.com', 'student_id' => '001'],
                ['name' => 'B', 'role' => 'MEMBER', 'email' => 'b@test.com', 'student_id' => '002'],
            ],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.details.members.0', 'Jumlah peserta harus tepat 3 orang.');
});

test('business it case requires university biodata', function (): void {
    $this->competition->update(['type' => Competition::TYPE_BUSINESS_IT_CASE]);

    $response = $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [
                [
                    'name' => 'A', 'role' => 'LEADER', 'email' => 'a@test.com',
                    'student_id' => '24001', 'major' => '', 'faculty' => '',
                ],
                [
                    'name' => 'B', 'role' => 'MEMBER', 'email' => 'b@test.com',
                    'student_id' => '24002', 'major' => 'Informatika', 'faculty' => 'Teknik',
                ],
                [
                    'name' => 'C', 'role' => 'MEMBER', 'email' => 'c@test.com',
                    'student_id' => '24003', 'major' => 'Manajemen', 'faculty' => 'Ekonomi',
                ],
            ],
        ])
        ->assertUnprocessable();

    expect(array_keys($response->json('error.details')))
        ->toContain('members.0.major', 'members.0.faculty');
});

test('business it case exposes university labels and accepts nim major and faculty', function (): void {
    $this->competition->update(['type' => Competition::TYPE_BUSINESS_IT_CASE]);

    $this->withToken($this->token)
        ->getJson('/api/registrations/me/members')
        ->assertOk()
        ->assertJsonPath('data.participantCategory', 'UNIVERSITY_STUDENT')
        ->assertJsonPath('data.identityLabel', 'NIM')
        ->assertJsonPath('data.showsLeaderRole', true)
        ->assertJsonPath('data.minMembers', 3)
        ->assertJsonPath('data.maxMembers', 3);

    $this->withToken($this->token)
        ->putJson('/api/registrations/me/members', [
            'members' => [
                [
                    'name' => 'A', 'role' => 'LEADER', 'email' => 'a@test.com',
                    'student_id' => '24001', 'major' => 'Informatika', 'faculty' => 'Teknik',
                ],
                [
                    'name' => 'B', 'role' => 'MEMBER', 'email' => 'b@test.com',
                    'student_id' => '24002', 'major' => 'Sistem Informasi', 'faculty' => 'Ilmu Komputer',
                ],
                [
                    'name' => 'C', 'role' => 'MEMBER', 'email' => 'c@test.com',
                    'student_id' => '24003', 'major' => 'Manajemen', 'faculty' => 'Ekonomi',
                ],
            ],
        ])
        ->assertOk();

    expect($this->team->members()->orderBy('sort_order')->get())
        ->toHaveCount(3)
        ->and($this->team->members()->first()->student_id)->toBe('24001');
});

test('members endpoints require authentication', function (): void {
    $this->getJson('/api/registrations/me/members')->assertUnauthorized();
    $this->putJson('/api/registrations/me/members', [])->assertUnauthorized();
});
