<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\BatchStatus;
use App\Models\Competition;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Batch>
 */
class BatchFactory extends Factory
{
    protected $model = Batch::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => (string) Str::uuid(),
            'competition_id' => Competition::factory(),
            'name' => 'Batch '.fake()->randomDigitNotNull(),
            'slug' => 'batch-'.fake()->unique()->bothify('##'),
            'start_date' => now()->subDay(),
            'end_date' => now()->addMonth(),
            'price' => 150000,
            'status' => BatchStatus::DRAFT,
        ];
    }
}
