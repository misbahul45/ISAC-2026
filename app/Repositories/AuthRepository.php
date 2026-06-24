<?php

namespace App\Repositories;

use App\Models\PasswordResetCode;
use App\Models\Team;
use App\Repositories\Contracts\AuthRepositoryInterface;

class AuthRepository implements AuthRepositoryInterface
{
    /**
     * @param  array{email: string, password: string, code: string, status: string}  $data
     */
    public function createTeam(array $data): Team
    {
        return Team::query()->create([
            'email' => $data['email'],
            'password' => $data['password'],
            'code' => $data['code'],
            'status' => $data['status'],
        ]);
    }

    public function findByEmail(string $email): ?Team
    {
        return Team::query()->where('email', $email)->first();
    }

    public function createResetCode(array $data): PasswordResetCode
    {
        return PasswordResetCode::query()->create($data);
    }

    public function deleteOldResetCodes(string $email): void
    {
        PasswordResetCode::query()->where('email', $email)->delete();
    }

    public function findValidResetCode(string $email, string $code): ?PasswordResetCode
    {
        return PasswordResetCode::query()
            ->where('email', $email)
            ->where('code', $code)
            ->whereNull('verified_at')
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();
    }

    public function markCodeAsVerified(PasswordResetCode $resetCode, string $resetToken): void
    {
        $resetCode->update([
            'reset_token' => $resetToken,
            'verified_at' => now(),
        ]);
    }

}
