<?php

namespace Database\Factories;

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use App\Models\AuthChallenge;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

class AuthChallengeFactory extends Factory
{
    protected $model = AuthChallenge::class;

    public function definition(): array
    {
        return [
            'account_type' => AccountType::TEAM,
            'account_id' => fn () => Team::factory()->create()->id,
            'purpose' => AuthChallengePurpose::RESET_PASSWORD,
            'code_hash' => bcrypt('123456'),
            'expired_at' => now()->addMinutes(5),
            'sent_at' => now(),
            'attempt_count' => 0,
        ];
    }
}
