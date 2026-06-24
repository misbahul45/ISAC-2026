<?php

namespace Database\Factories;

use App\Models\PasswordResetCode;
use Illuminate\Database\Eloquent\Factories\Factory;

class PasswordResetCodeFactory extends Factory
{
    protected $model = PasswordResetCode::class;

    public function definition(): array
    {
        return [
            'email'       => $this->faker->safeEmail(),
            'code'        => str_pad((string) $this->faker->numberBetween(0, 999999), 6, '0', STR_PAD_LEFT),
            'reset_token' => null,
            'expired_at'  => now()->addMinutes(2),
            'verified_at' => null,
            'used_at'     => null,
        ];
    }

}
