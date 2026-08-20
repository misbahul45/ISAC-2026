<?php

use App\Models\Exam;
use App\Models\ExamQuestion;
use Database\Seeders\ExamQuestionDemoSeeder;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('demo exam question seeder is idempotent and keeps answer options attached to each question', function (): void {
    $this->seed(ExamQuestionDemoSeeder::class);
    $this->seed(ExamQuestionDemoSeeder::class);

    $tryout = Exam::query()->where('title', 'Tryout Olimpiade')->firstOrFail();
    $questions = ExamQuestion::query()
        ->where('exam_id', $tryout->id)
        ->where('category', 'DEMO_ISAC_2026')
        ->orderBy('order')
        ->get();

    expect(ExamQuestion::query()->where('category', 'DEMO_ISAC_2026')->count())->toBe(8)
        ->and($questions)->toHaveCount(3)
        ->and($questions->first()->options)->toHaveCount(4)
        ->and($questions->first()->correct_answer)->toBe('b')
        ->and($questions->last()->type)->toBe('essay');
});
