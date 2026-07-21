<?php

namespace Database\Factories;

use App\Models\Competition;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Competition>
 */
class CompetitionFactory extends Factory
{
    protected $model = Competition::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->randomElement([
            'OLIMPIADE SAINS 2026',
            'BUSINESS PLAN COMPETITION 2026',
            'BUSINESS IT CASE 2026',
        ]);

        return [
            'id' => (string) Str::uuid(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.substr((string) Str::uuid(), 0, 8),
            'description' => fake()->sentence(),
            'type' => Competition::TYPE_OLIMPIADE,
            'payment_flow' => Competition::PAYMENT_UPFRONT,
            'start_date' => now()->subDay()->toDateString(),
            'end_date' => now()->addMonth()->toDateString(),
            'status' => Competition::STATUS_DRAFT,
        ];
    }
}
