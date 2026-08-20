<?php

use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

function adminTeamUpdatePayload(array $members): array
{
    return [
        'team' => [
            'name' => 'Team Koreksi',
            'phone' => '081234567890',
            'institution_name' => 'SMA Negeri Koreksi',
            'institution_address' => json_encode([
                'province' => 'Jawa Timur',
                'city' => 'Surabaya',
                'address' => 'Jl. Koreksi No. 1',
            ], JSON_THROW_ON_ERROR),
        ],
        'members' => $members,
        'documents' => [
            'document_url' => 'https://drive.google.com/drive/folders/koreksi-documents',
            'twibbon_url' => 'https://docs.google.com/document/d/koreksi-twibbon',
        ],
        'reason' => 'Koreksi berdasarkan konfirmasi pendaftar.',
    ];
}

test('registration admin can correct a locked team and all members in one request', function (): void {
    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_BUSINESS_PLAN,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
        'status' => Competition::STATUS_REGISTRATION_OPEN,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch Koreksi',
        'slug' => 'batch-koreksi',
        'start_date' => now()->subDay(),
        'end_date' => now()->addMonth(),
        'price' => 150000,
        'quota' => 20,
        'status' => BatchStatus::OPEN,
    ]);
    $team = Team::factory()->create([
        'status' => Team::STATUS_VERIFIED,
        'name' => 'Team Lama',
        'phone' => '081111111111',
        'institution_name' => 'SMA Lama',
        'institution_address' => '{"province":"Jawa Timur","city":"Malang","address":"Alamat lama"}',
    ]);
    $registration = Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::VERIFIED,
        'team_completed_at' => now()->subDays(2),
        'members_completed_at' => now()->subDays(2),
        'documents_completed_at' => now()->subDays(2),
        'submitted_at' => now()->subDay(),
    ]);
    $leader = $team->members()->create([
        'name' => 'Leader Lama', 'role' => 'LEADER', 'email' => 'leader@old.test',
        'student_id' => 'OLD-001', 'sort_order' => 1,
    ]);
    $member = $team->members()->create([
        'name' => 'Member Lama', 'role' => 'MEMBER', 'email' => 'member@old.test',
        'student_id' => 'OLD-002', 'sort_order' => 2,
    ]);
    $team->members()->create([
        'name' => 'Member Dihapus', 'role' => 'MEMBER', 'email' => 'removed@old.test',
        'student_id' => 'OLD-003', 'sort_order' => 3,
    ]);
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);

    $payload = adminTeamUpdatePayload([
        [
            'id' => $leader->id, 'name' => 'Leader Baru', 'role' => 'LEADER', 'email' => 'leader@new.test',
            'student_id' => 'NEW-001', 'major' => null, 'faculty' => null,
        ],
        [
            'id' => $member->id, 'name' => 'Member Baru', 'role' => 'MEMBER', 'email' => 'member@new.test',
            'student_id' => 'NEW-002', 'major' => null, 'faculty' => null,
        ],
        [
            'name' => 'Member Tambahan', 'role' => 'MEMBER', 'email' => 'member@added.test',
            'student_id' => 'NEW-003', 'major' => null, 'faculty' => null,
        ],
    ]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->patchJson("/api/admin/teams/{$team->id}/registration", $payload)
        ->assertOk()
        ->assertJsonPath('data.team.name', 'Team Koreksi')
        ->assertJsonPath('data.members.0.name', 'Leader Baru')
        ->assertJsonCount(3, 'data.members');

    expect($team->fresh())
        ->name->toBe('Team Koreksi')
        ->status->toBe(Team::STATUS_VERIFIED)
        ->and($team->members()->count())->toBe(3)
        ->and($team->members()->where('student_id', 'OLD-003')->exists())->toBeFalse()
        ->and($registration->fresh()->documents_completed_at)->not->toBeNull()
        ->and(AdminAuditLog::query()->where('action', 'team.registration_updated')->where('subject_id', $team->id)->exists())->toBeTrue();
});

test('payment admin cannot correct team registration data', function (): void {
    $team = Team::factory()->create();
    $admin = Admin::factory()->create(['role' => 'admin_payment', 'is_active' => true]);

    $this->withToken($admin->createToken('admin')->plainTextToken)
        ->patchJson("/api/admin/teams/{$team->id}/registration", [])
        ->assertForbidden()
        ->assertJsonPath('error.code', 'FORBIDDEN');
});

test('admin team correction keeps university member requirements', function (): void {
    $competition = Competition::factory()->create([
        'type' => Competition::TYPE_BUSINESS_IT_CASE,
        'payment_flow' => Competition::PAYMENT_SEMIFINAL,
        'status' => Competition::STATUS_REGISTRATION_OPEN,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch Kampus', 'slug' => 'batch-kampus',
        'start_date' => now()->subDay(), 'end_date' => now()->addMonth(),
        'price' => 150000, 'quota' => 20, 'status' => BatchStatus::OPEN,
    ]);
    $team = Team::factory()->create();
    Registration::query()->create([
        'competition_id' => $competition->id, 'batch_id' => $batch->id, 'team_id' => $team->id,
        'status' => RegistrationStatus::VERIFIED,
    ]);
    $admin = Admin::factory()->create(['role' => 'admin_registration', 'is_active' => true]);
    $payload = adminTeamUpdatePayload([
        ['name' => 'Anggota A', 'role' => 'LEADER', 'email' => 'a@campus.test', 'student_id' => '24001', 'major' => '', 'faculty' => ''],
        ['name' => 'Anggota B', 'role' => 'MEMBER', 'email' => 'b@campus.test', 'student_id' => '24002', 'major' => 'Informatika', 'faculty' => 'Teknik'],
        ['name' => 'Anggota C', 'role' => 'MEMBER', 'email' => 'c@campus.test', 'student_id' => '24003', 'major' => 'Manajemen', 'faculty' => 'Ekonomi'],
    ]);
    $payload['team']['institution_name'] = 'Universitas Koreksi';

    $response = $this->withToken($admin->createToken('admin')->plainTextToken)
        ->patchJson("/api/admin/teams/{$team->id}/registration", $payload)
        ->assertUnprocessable();

    expect($response->json('error.details'))
        ->toHaveKey('members.0.major', ['Jurusan wajib diisi untuk mahasiswa.']);
});
