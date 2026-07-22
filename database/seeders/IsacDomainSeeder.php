<?php

namespace Database\Seeders;

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Models\Admin;
use App\Models\AdminAuditLog;
use App\Models\AuthChallenge;
use App\Models\Batch;
use App\Models\Competition;
use App\Models\File;
use App\Models\Member;
use App\Models\Registration;
use App\Models\Stage;
use App\Models\Team;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class IsacDomainSeeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function (): void {
            $admins = collect([
                ['name' => 'Super Admin ISAC', 'email' => 'superadmin@isac.test', 'role' => 'super_admin'],
                ['name' => 'Admin Registration', 'email' => 'registration@isac.test', 'role' => 'admin_registration'],
                ['name' => 'Admin Payment', 'email' => 'payment@isac.test', 'role' => 'admin_payment'],
                ['name' => 'Judge ISAC', 'email' => 'judge@isac.test', 'role' => 'judge'],
            ])->mapWithKeys(function (array $data): array {
                $admin = Admin::query()->updateOrCreate(['email' => $data['email']], [
                    ...$data, 'password' => 'password123', 'is_active' => true,
                ]);

                return [$data['role'] => $admin];
            });

            $module = File::query()->updateOrCreate(['file_id' => 'seed-module-olympiad'], [
                'url' => 'https://example.com/isac/module-olympiad.pdf',
                'purpose' => 'BATCH_MODULE',
                'uploaded_by' => null,
            ]);

            $competitions = collect([
                ['key' => 'olympiad', 'name' => 'ISAC Olympiad', 'slug' => 'isac-olympiad', 'type' => 'OLIMPIADE', 'payment_flow' => 'UPFRONT'],
                ['key' => 'bpc', 'name' => 'Business Plan Competition', 'slug' => 'business-plan-competition', 'type' => 'BUSINESS_PLAN', 'payment_flow' => 'SEMIFINAL'],
                ['key' => 'bitc', 'name' => 'Business IT Case', 'slug' => 'business-it-case', 'type' => 'BUSINESS_IT_CASE', 'payment_flow' => 'SEMIFINAL'],
            ])->mapWithKeys(function (array $data): array {
                $competition = Competition::query()->updateOrCreate(['slug' => $data['slug']], [
                    'name' => $data['name'],
                    'description' => "Skenario seed untuk {$data['name']}.",
                    'type' => $data['type'],
                    'payment_flow' => $data['payment_flow'],
                    'start_date' => now()->subMonth()->toDateString(),
                    'end_date' => now()->addMonths(3)->toDateString(),
                    'status' => Competition::STATUS_REGISTRATION_OPEN,
                ]);

                return [$data['key'] => $competition];
            });

            $batches = $competitions->mapWithKeys(function (Competition $competition, string $key) use ($module): array {
                $batch = Batch::query()->updateOrCreate(['slug' => "{$key}-early-bird"], [
                    'competition_id' => $competition->id,
                    'name' => 'Early Bird',
                    'description' => 'Batch aktif untuk pengujian registration flow.',
                    'start_date' => now()->subWeek(),
                    'end_date' => now()->addMonth(),
                    'price' => $key === 'olympiad' ? 150000 : 250000,
                    'module_file_id' => $key === 'olympiad' ? $module->id : null,
                    'quota' => 100,
                    'status' => 'OPEN',
                ]);

                return [$key => $batch];
            });

            $stages = collect();
            foreach ($competitions as $key => $competition) {
                foreach ([
                    ['name' => 'Registration', 'type' => 'registration', 'order' => 1],
                    ['name' => $key === 'olympiad' ? 'Exam' : 'Preliminary Submission', 'type' => $key === 'olympiad' ? 'exam' : 'submission', 'order' => 2],
                    ['name' => 'Semifinal', 'type' => 'selection', 'order' => 3],
                    ['name' => 'Final', 'type' => 'final', 'order' => 4],
                ] as $stageData) {
                    $stage = Stage::query()->updateOrCreate([
                        'competition_id' => $competition->id,
                        'name' => $stageData['name'],
                    ], [
                        ...$stageData,
                        'description' => "Stage {$stageData['name']} {$competition->name}.",
                        'start_date' => now()->subDay(),
                        'end_date' => now()->addMonths(2),
                        'is_active' => $stageData['order'] === 1,
                        'criteria' => ['seed' => true],
                    ]);
                    $stages->put("{$key}.{$stageData['order']}", $stage);
                }
            }

            $scenarioData = [
                'unverified' => ['status' => Team::STATUS_INCOMPLETE, 'registration' => null],
                'profile' => ['status' => Team::STATUS_INCOMPLETE, 'registration' => 'WAITING_PAYMENT'],
                'payment' => ['status' => Team::STATUS_INCOMPLETE, 'registration' => 'WAITING_PAYMENT'],
                'review' => ['status' => Team::STATUS_WAITING_VERIFICATION, 'registration' => 'WAITING_VERIFICATION'],
                'revision' => ['status' => Team::STATUS_REVISION_REQUIRED, 'registration' => 'REVISION_REQUIRED'],
                'verified' => ['status' => Team::STATUS_VERIFIED, 'registration' => 'VERIFIED', 'competition' => 'bpc'],
                'rejected' => ['status' => Team::STATUS_REJECTED, 'registration' => 'REJECTED'],
                'cancelled' => ['status' => Team::STATUS_REJECTED, 'registration' => 'CANCELLED', 'competition' => 'bitc'],
            ];

            $teams = collect();
            foreach ($scenarioData as $index => $scenario) {
                $number = array_search($index, array_keys($scenarioData), true) + 1;
                $competitionKey = $scenario['competition'] ?? 'olympiad';
                $completeProfile = ! in_array($index, ['unverified', 'profile'], true);
                $team = Team::query()->updateOrCreate(['email' => "{$index}@team.isac.test"], [
                    'code' => 'ISAC-DEMO-'.str_pad((string) $number, 3, '0', STR_PAD_LEFT),
                    'password' => 'password123',
                    'name' => $completeProfile ? 'Team '.ucfirst($index) : null,
                    'phone' => $completeProfile ? '0812000000'.str_pad((string) $number, 2, '0', STR_PAD_LEFT) : null,
                    'school_name' => $completeProfile ? 'Universitas Indonesia' : null,
                    'school_address' => $completeProfile ? 'Depok, Jawa Barat' : null,
                    'school_province' => $completeProfile ? 'Jawa Barat' : null,
                    'school_city' => $completeProfile ? 'Depok' : null,
                    'document_url' => $completeProfile ? "https://drive.google.com/drive/folders/seed-{$index}" : null,
                    'twibbon_url' => $completeProfile ? "https://drive.google.com/drive/folders/twibbon-{$index}" : null,
                    'status' => $scenario['status'],
                    'email_verified_at' => $index === 'unverified' ? null : now()->subDay(),
                    'verified_by' => in_array($index, ['verified', 'rejected'], true) ? $admins['admin_registration']->id : null,
                    'verified_at' => in_array($index, ['verified', 'rejected'], true) ? now() : null,
                    'revision_step' => $index === 'revision' ? 'DOCUMENTS' : null,
                    'verification_note' => $index === 'revision' ? 'Perbaiki akses folder dokumen dan twibbon.' : ($index === 'rejected' ? 'Dokumen tidak memenuhi ketentuan.' : null),
                    'current_stage_id' => $index === 'verified' ? $stages["{$competitionKey}.1"]->id : null,
                ]);
                $teams->put($index, $team);

                if ($index === 'unverified') {
                    AuthChallenge::query()->updateOrCreate([
                        'account_type' => AccountType::TEAM,
                        'account_id' => $team->id,
                        'purpose' => AuthChallengePurpose::VERIFY_EMAIL,
                    ], [
                        'code_hash' => bcrypt('000000'),
                        'expired_at' => now()->addYears(10),
                        'sent_at' => now(),
                        'attempt_count' => 0,
                    ]);

                    continue;
                }

                if ($completeProfile) {
                    Member::query()->updateOrCreate(['email' => "leader.{$index}@team.isac.test"], [
                        'team_id' => $team->id,
                        'name' => 'Leader '.ucfirst($index),
                        'role' => 'LEADER',
                        'education_level' => 'S1',
                        'phone' => '081234567890',
                        'major' => 'Sistem Informasi',
                        'faculty' => 'Ilmu Komputer',
                        'student_id' => "NIM-{$number}-01",
                        'birth_date' => '2004-01-01',
                        'sort_order' => 1,
                    ]);
                    if ($competitionKey !== 'olympiad') {
                        Member::query()->updateOrCreate(['email' => "member.{$index}@team.isac.test"], [
                            'team_id' => $team->id, 'name' => 'Member '.ucfirst($index), 'role' => 'MEMBER',
                            'education_level' => 'S1', 'phone' => '081234567891', 'major' => 'Manajemen',
                            'faculty' => 'Ekonomi', 'student_id' => "NIM-{$number}-02", 'birth_date' => '2004-02-02', 'sort_order' => 2,
                        ]);
                    }
                }

                $proof = null;
                if (in_array($index, ['review', 'revision', 'verified', 'rejected'], true)) {
                    $proof = File::query()->updateOrCreate(['file_id' => "seed-payment-{$index}"], [
                        'url' => "https://example.com/isac/payment-{$index}.png",
                        'purpose' => 'PAYMENT_PROOF',
                        'uploaded_by' => $team->id,
                    ]);
                }

                $submitted = in_array($index, ['review', 'revision', 'verified', 'rejected', 'cancelled'], true);
                Registration::query()->updateOrCreate(['team_id' => $team->id], [
                    'competition_id' => $competitions[$competitionKey]->id,
                    'batch_id' => $batches[$competitionKey]->id,
                    'status' => $scenario['registration'],
                    'payment_proof_file_id' => $proof?->id,
                    'amount_paid' => $proof ? $batches[$competitionKey]->price : 0,
                    'payment_method' => $proof ? 'QRIS' : null,
                    'transaction_id' => $proof ? "SEED-{$index}" : null,
                    'team_completed_at' => $completeProfile ? now()->subHours(4) : null,
                    'members_completed_at' => $completeProfile ? now()->subHours(3) : null,
                    'documents_completed_at' => $completeProfile ? now()->subHours(2) : null,
                    'payment_required_at' => $competitionKey === 'olympiad' ? now()->subHours(4) : null,
                    'payment_submitted_at' => $proof ? now()->subHour() : null,
                    'submitted_at' => $submitted ? now()->subHour() : null,
                    'payment_verified_by' => $index === 'verified' ? $admins['admin_payment']->id : null,
                    'payment_verified_at' => $index === 'verified' ? now() : null,
                    'paid_at' => $index === 'verified' ? now() : null,
                    'payment_rejection_reason' => $index === 'revision' ? 'Nominal pada bukti tidak terlihat.' : ($index === 'rejected' ? 'Bukti pembayaran tidak valid.' : null),
                    'metadata' => ['seedScenario' => $index],
                ]);
            }

            foreach ($batches as $batch) {
                $batch->update(['current_registrations' => Registration::query()->where('batch_id', $batch->id)->count()]);
            }

            $this->seedCompetitionArtifacts($teams['verified'], $stages['bpc.2'], $admins['judge']);
            AdminAuditLog::query()->updateOrCreate([
                'action' => 'seed.team.verified', 'subject_type' => Team::class, 'subject_id' => $teams['verified']->id,
            ], [
                'admin_id' => $admins['super_admin']->id,
                'before_data' => ['status' => Team::STATUS_WAITING_VERIFICATION],
                'after_data' => ['status' => Team::STATUS_VERIFIED],
                'reason' => 'Deterministic seed scenario', 'request_id' => 'seed', 'created_at' => now(),
            ]);
        });
    }

    private function seedCompetitionArtifacts(Team $team, Stage $stage, Admin $judge): void
    {
        $submissionFile = File::query()->updateOrCreate(['file_id' => 'seed-submission-verified'], [
            'url' => 'https://example.com/isac/business-plan.pdf', 'purpose' => 'SUBMISSION', 'uploaded_by' => $team->id,
        ]);
        DB::table('submissions')->updateOrInsert(['team_id' => $team->id, 'stage_id' => $stage->id], [
            'id' => '10000000-0000-4000-8000-000000000001', 'title' => 'Seed Business Plan',
            'description' => 'Submission untuk pengujian.', 'file_id' => $submissionFile->id, 'status' => 'approved',
            'reviewed_by' => $judge->id, 'reviewed_at' => now(), 'feedback' => 'Seed approved', 'score' => 90,
            'metadata' => json_encode(['seed' => true]), 'submitted_at' => now()->subDay(), 'created_at' => now(), 'updated_at' => now(),
        ]);

        DB::table('exams')->updateOrInsert(['id' => '20000000-0000-4000-8000-000000000001'], [
            'stage_id' => $stage->id, 'title' => 'Seed Qualification Exam', 'description' => 'Exam pengujian.',
            'start_date' => now()->subDay(), 'end_date' => now()->addMonth(), 'duration' => 60, 'passing_score' => 70,
            'type' => 'multiple_choice', 'shuffle_questions' => false, 'shuffle_options' => false,
            'show_result_immediately' => true, 'max_attempts' => 1, 'settings' => json_encode(['seed' => true]),
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('exam_questions')->updateOrInsert(['id' => '30000000-0000-4000-8000-000000000001'], [
            'exam_id' => '20000000-0000-4000-8000-000000000001', 'question' => 'Apa tujuan utama analisis bisnis?',
            'explanation' => 'Memahami masalah dan peluang.', 'type' => 'multiple_choice',
            'options' => json_encode(['A' => 'Memahami masalah', 'B' => 'Menghindari data']), 'correct_answer' => 'A',
            'order' => 1, 'correct_score' => 100, 'wrong_score' => 0, 'empty_score' => 0,
            'difficulty' => 'easy', 'category' => 'business', 'tags' => json_encode(['seed']), 'is_active' => true,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('exam_attempts')->updateOrInsert(['id' => '40000000-0000-4000-8000-000000000001'], [
            'team_id' => $team->id, 'exam_id' => '20000000-0000-4000-8000-000000000001', 'reviewed_by' => $judge->id,
            'total_score' => 100, 'max_possible_score' => 100, 'start_time' => now()->subHour(), 'end_time' => now()->subMinutes(50),
            'finished' => true, 'flagged' => false, 'cheat_count' => 0, 'suspicious_score' => 0,
            'device_id' => 'seed-device', 'ip_address' => '127.0.0.1', 'user_agent' => 'ISAC Seeder',
            'metadata' => json_encode(['seed' => true]), 'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('exam_answers')->updateOrInsert(['attempt_id' => '40000000-0000-4000-8000-000000000001', 'question_id' => '30000000-0000-4000-8000-000000000001'], [
            'id' => '50000000-0000-4000-8000-000000000001', 'answer' => 'A', 'selected_options' => json_encode(['A']),
            'is_correct' => true, 'score_obtained' => 100, 'answered_at' => now()->subMinutes(55), 'time_spent' => 60,
            'created_at' => now(), 'updated_at' => now(),
        ]);
        DB::table('exam_event_logs')->updateOrInsert(['id' => '60000000-0000-4000-8000-000000000001'], [
            'attempt_id' => '40000000-0000-4000-8000-000000000001', 'type' => 'submitted',
            'metadata' => json_encode(['seed' => true]), 'created_at' => now(), 'updated_at' => now(),
        ]);
    }
}
