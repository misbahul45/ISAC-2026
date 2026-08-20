<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use App\Models\Exam;
use App\Models\Stage;
use Carbon\CarbonImmutable;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class Isac2026TimelineSeeder extends Seeder
{
    private const TIMEZONE = 'Asia/Jakarta';

    public function run(): void
    {
        DB::transaction(function (): void {
            $competitions = [
                'iso' => $this->upsertCompetition([
                    'name' => 'ISAC Olympiad',
                    'slug' => 'isac-olympiad',
                    'description' => 'Olimpiade ISAC 2026 untuk siswa SMA, SMK, atau MA sederajat.',
                    'type' => Competition::TYPE_OLIMPIADE,
                    'payment_flow' => Competition::PAYMENT_UPFRONT,
                ]),
                'bpc' => $this->upsertCompetition([
                    'name' => 'Business Plan Competition',
                    'slug' => 'business-plan-competition',
                    'description' => 'Kompetisi penyusunan business plan ISAC 2026 untuk siswa SMA, SMK, atau MA sederajat.',
                    'type' => Competition::TYPE_BUSINESS_PLAN,
                    'payment_flow' => Competition::PAYMENT_SEMIFINAL,
                ]),
                'bic' => $this->upsertCompetition([
                    'name' => 'Business IT Case',
                    'slug' => 'business-it-case',
                    'description' => 'Kompetisi analisis kasus bisnis berbasis teknologi informasi ISAC 2026 untuk mahasiswa perguruan tinggi.',
                    'type' => Competition::TYPE_BUSINESS_IT_CASE,
                    'payment_flow' => Competition::PAYMENT_SEMIFINAL,
                ]),
            ];

            $prices = [
                'iso' => [60000, 80000],
                'bpc' => [70000, 90000],
                'bic' => [80000, 100000],
            ];

            foreach ($competitions as $key => $competition) {
                $this->upsertBatch($competition, 1, '2026-08-23', '2026-09-12', $prices[$key][0]);
                $this->upsertBatch($competition, 2, '2026-09-13', '2026-09-23', $prices[$key][1]);
            }

            $this->seedOlympiadTimeline($competitions['iso']);
            $this->seedBusinessPlanTimeline($competitions['bpc']);
            $this->seedBusinessItCaseTimeline($competitions['bic']);
        });
    }

    /** @param array<string, string> $data */
    private function upsertCompetition(array $data): Competition
    {
        $competition = Competition::withTrashed()->firstOrNew(['slug' => $data['slug']]);
        if ($competition->trashed()) {
            $competition->restore();
        }

        $competition->fill([
            ...$data,
            'start_date' => '2026-08-23',
            'end_date' => '2026-10-31',
            'status' => Competition::STATUS_REGISTRATION_OPEN,
        ])->save();

        return $competition;
    }

    private function upsertBatch(Competition $competition, int $number, string $start, string $end, int $price): Batch
    {
        $batch = Batch::withTrashed()->firstOrNew([
            'competition_id' => $competition->id,
            'slug' => "batch-{$number}",
        ]);
        if ($batch->trashed()) {
            $batch->restore();
        }

        $batch->fill([
            'name' => "Batch {$number}",
            'description' => "Gelombang {$number} pendaftaran {$competition->name} ISAC 2026.",
            // The official source is date-only. These boundaries are technical
            // representations, not official event times.
            'start_date' => $this->startOfDay($start),
            'end_date' => $this->endOfDay($end),
            'price' => $price,
            'status' => BatchStatus::OPEN,
        ])->save();

        return $batch;
    }

    private function seedOlympiadTimeline(Competition $competition): void
    {
        // Source detail ISO states Technical Meeting on 25 Sep 2026,
        // while the general timeline states 24 Sep 2026. It is administrative
        // and therefore is not represented as a progression Stage here.
        $tryout = $this->upsertStage($competition, [
            'name' => 'Tryout',
            'type' => 'exam',
            'description' => 'Tryout Olimpiade ISAC 2026.',
            'order' => 1,
            'start' => '2026-09-25',
            'end' => '2026-09-30',
        ]);
        $elimination = $this->upsertStage($competition, [
            'name' => 'Elimination',
            'type' => 'exam',
            'description' => 'Ujian eliminasi Olimpiade. Pengumuman hasil tercatat pada 11 Oktober 2026 dan tidak dimodelkan sebagai Stage terpisah.',
            'order' => 2,
            'start' => '2026-10-10',
            'end' => '2026-10-10',
        ]);
        $semifinal = $this->upsertStage($competition, [
            'name' => 'Semifinal',
            'type' => 'exam',
            'description' => 'Semifinal Olimpiade ISAC 2026.',
            'order' => 3,
            'start' => '2026-10-17',
            'end' => '2026-10-17',
        ]);
        $final = $this->upsertStage($competition, [
            'name' => 'Final',
            'type' => 'final',
            'description' => 'Final Olimpiade dan STA Awarding ISAC 2026.',
            'order' => 4,
            'start' => '2026-10-31',
            'end' => '2026-10-31',
        ]);

        // Duration and max attempts are intentionally omitted. The database
        // applies its existing technical defaults because the source gives no values.
        $this->upsertExam($tryout, 'Tryout Olimpiade', 'Tryout Olimpiade ISAC 2026.', '2026-09-25', '2026-09-30');
        $this->upsertExam($elimination, 'Ujian Eliminasi', 'Ujian eliminasi Olimpiade ISAC 2026.', '2026-10-10', '2026-10-10');
        $this->upsertExam($semifinal, 'Ujian Semifinal', 'Ujian Semifinal Olimpiade ISAC 2026.', '2026-10-17', '2026-10-17');
        $this->upsertExam($final, 'Ujian Final', 'Ujian Final Olimpiade ISAC 2026.', '2026-10-31', '2026-10-31');
    }

    private function seedBusinessPlanTimeline(Competition $competition): void
    {
        $this->upsertStage($competition, [
            'name' => 'Preliminary',
            'type' => 'submission',
            'description' => 'Submission Business Model Canvas. Periode penjurian 1–4 Oktober tidak dimodelkan sebagai Team Stage.',
            'order' => 1,
            'start' => '2026-09-24',
            'end' => '2026-09-30',
        ]);
        $this->upsertStage($competition, [
            'name' => 'Semifinal',
            'type' => 'submission',
            'description' => 'Tahap Semifinal Business Plan Competition dan target payment checkpoint existing.',
            'order' => 2,
            'start' => '2026-10-05',
            'end' => '2026-10-18',
        ]);
        $this->upsertStage($competition, [
            'name' => 'Final',
            'type' => 'final',
            'description' => 'Final Deck 22–29 Oktober dan presentasi Final BPC pada 31 Oktober 2026.',
            'order' => 3,
            'start' => '2026-10-22',
            'end' => '2026-10-31',
        ]);
    }

    private function seedBusinessItCaseTimeline(Competition $competition): void
    {
        // TEMPORARY SOURCE DATE: BIC Case Release is listed as 25 Sep 2026,
        // but the source explicitly notes that the date is not fixed.
        $this->upsertStage($competition, [
            'name' => 'Preliminary',
            'type' => 'submission',
            'description' => 'Case Release (tanggal sumber belum final) dan Preliminary Submission Business IT Case.',
            'order' => 1,
            'start' => '2026-09-25',
            'end' => '2026-10-09',
        ]);

        // The detailed BIC timeline does not name a Semifinal competition event.
        // The existing platform nevertheless requires a Stage named Semifinal as
        // the payment target for payment_flow=SEMIFINAL. Its technical window is
        // bounded by the detailed Finalist Announcement (16 Oct) and Final
        // Mentoring (23 Oct), without inventing an additional event date.
        $this->upsertStage($competition, [
            'name' => 'Semifinal',
            'type' => 'selection',
            'description' => 'Technical payment checkpoint setelah pengumuman finalis dan sebelum Final Business IT Case.',
            'order' => 2,
            'start' => '2026-10-16',
            'end' => '2026-10-23',
        ]);
        $this->upsertStage($competition, [
            'name' => 'Final',
            'type' => 'final',
            'description' => 'Final Presentation Business IT Case ISAC 2026.',
            'order' => 3,
            'start' => '2026-10-31',
            'end' => '2026-10-31',
        ]);
    }

    /** @param array{name: string, type: string, description: string, order: int, start: string, end: string} $data */
    private function upsertStage(Competition $competition, array $data): Stage
    {
        $stage = Stage::withTrashed()->firstOrNew([
            'competition_id' => $competition->id,
            'name' => $data['name'],
        ]);
        if ($stage->trashed()) {
            $stage->restore();
        }

        $stage->fill([
            'type' => $data['type'],
            'description' => $data['description'],
            'order' => $data['order'],
            'start_date' => $this->startOfDay($data['start']),
            'end_date' => $this->endOfDay($data['end']),
            // In the current service this flag means eligible for progression;
            // the first active ordered Stage becomes a verified Team's entry Stage.
            'is_active' => true,
        ])->save();

        return $stage;
    }

    private function upsertExam(Stage $stage, string $title, string $description, string $start, string $end): Exam
    {
        $exam = Exam::withTrashed()->firstOrNew([
            'stage_id' => $stage->id,
            'title' => $title,
        ]);
        if ($exam->trashed()) {
            $exam->restore();
        }
        if (! $exam->exists) {
            // UUID is assigned only on first creation; natural keys above drive idempotency.
            $exam->id = (string) Str::uuid();
        }

        $exam->fill([
            'description' => $description,
            'start_date' => $this->startOfDay($start),
            'end_date' => $this->endOfDay($end),
        ])->save();

        return $exam;
    }

    private function startOfDay(string $date): CarbonImmutable
    {
        return CarbonImmutable::parse($date, self::TIMEZONE)->startOfDay();
    }

    private function endOfDay(string $date): CarbonImmutable
    {
        return CarbonImmutable::parse($date, self::TIMEZONE)->endOfDay();
    }
}
