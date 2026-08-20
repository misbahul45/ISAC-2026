<?php

use App\Models\Batch;
use App\Models\Competition;
use App\Models\Exam;
use App\Models\Stage;
use Database\Seeders\Isac2026TimelineSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\DB;

uses(LazilyRefreshDatabase::class);

test('official timeline seeder is idempotent and stores the exact batch price matrix', function (): void {
    $this->seed(Isac2026TimelineSeeder::class);
    $this->seed(Isac2026TimelineSeeder::class);

    expect(Competition::query()->count())->toBe(3)
        ->and(Batch::query()->count())->toBe(6)
        ->and(Stage::query()->count())->toBe(10)
        ->and(Exam::query()->count())->toBe(4);

    $expected = [
        'isac-olympiad' => ['batch-1' => '60000.00', 'batch-2' => '80000.00'],
        'business-plan-competition' => ['batch-1' => '70000.00', 'batch-2' => '90000.00'],
        'business-it-case' => ['batch-1' => '80000.00', 'batch-2' => '100000.00'],
    ];

    foreach ($expected as $competitionSlug => $batches) {
        $competition = Competition::query()->where('slug', $competitionSlug)->firstOrFail();
        expect($competition->batches()->count())->toBe(2);

        foreach ($batches as $batchSlug => $price) {
            $batch = $competition->batches()->where('slug', $batchSlug)->firstOrFail();
            expect($batch->price)->toBe($price);
        }
    }
});

test('official timeline keeps date-only source dates in Asia Jakarta boundaries and seeds no transaction artifacts', function (): void {
    $this->seed(Isac2026TimelineSeeder::class);

    $olympiad = Competition::query()->where('slug', 'isac-olympiad')->firstOrFail();
    $batchOne = $olympiad->batches()->where('slug', 'batch-1')->firstOrFail();
    $final = $olympiad->stages()->where('name', 'Final')->firstOrFail();

    expect($batchOne->start_date->timezone('Asia/Jakarta')->toDateString())->toBe('2026-08-23')
        ->and($batchOne->end_date->timezone('Asia/Jakarta')->toDateString())->toBe('2026-09-12')
        ->and($final->start_date->timezone('Asia/Jakarta')->toDateString())->toBe('2026-10-31')
        ->and(DB::table('submissions')->count())->toBe(0)
        ->and(DB::table('exam_attempts')->count())->toBe(0)
        ->and(DB::table('exam_event_logs')->count())->toBe(0);
});
