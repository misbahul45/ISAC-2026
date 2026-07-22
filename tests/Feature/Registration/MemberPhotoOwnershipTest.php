<?php

use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\File;
use App\Models\Registration;
use App\Models\RegistrationStatus;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('team cannot assign another team member photo', function (): void {
    $team = Team::factory()->create();
    $otherTeam = Team::factory()->create();
    $competition = Competition::factory()->create([
        'status' => Competition::STATUS_REGISTRATION_OPEN,
        'type' => Competition::TYPE_OLIMPIADE,
    ]);
    $batch = $competition->batches()->create([
        'name' => 'Batch 1', 'slug' => 'member-photo-security',
        'start_date' => now(), 'end_date' => now()->addMonth(),
        'price' => 100000, 'quota' => 50, 'status' => BatchStatus::OPEN,
    ]);
    Registration::query()->create([
        'competition_id' => $competition->id,
        'batch_id' => $batch->id,
        'team_id' => $team->id,
        'status' => RegistrationStatus::WAITING_PAYMENT,
        'team_completed_at' => now(),
    ]);
    $photo = File::query()->create([
        'file_id' => 'foreign-photo',
        'url' => 'https://ik.imagekit.io/isac/photo.png',
        'purpose' => 'MEMBER_PHOTO',
        'uploaded_by' => $otherTeam->id,
    ]);

    $this->withToken($team->createToken('auth-token')->plainTextToken)
        ->putJson('/api/registrations/me/members', [
            'members' => [[
                'name' => 'Leader', 'role' => 'LEADER', 'email' => 'leader@example.test',
                'student_id' => 'STUDENT-1',
                'photo_file_id' => $photo->id,
            ]],
        ])
        ->assertUnprocessable()
        ->assertJsonPath('error.details.photo_file_id.0', 'File tidak valid atau bukan milik Team ini.');
});
