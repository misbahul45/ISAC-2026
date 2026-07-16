<?php

namespace Database\Factories;

use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    protected $model = Team::class;

    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        static $sequence = 0;
        $sequence++;

        return [
            'id' => (string) Str::uuid(),
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('Password123!'),
            'code' => 'ISAC-TM-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT),
            'status' => Team::STATUS_ACTIVE,
        ];
    }
}
