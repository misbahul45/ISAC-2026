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
            'expired_at'  => now()->addMinutes(10),
        ]);
    }

    public function findValidResetToken(string $resetToken): ?PasswordResetCode
    {
        return PasswordResetCode::query()
            ->where('reset_token', $resetToken)
            ->whereNotNull('verified_at')
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();
    }

    public function markTokenAsUsed(PasswordResetCode $resetCode): void
    {
        $resetCode->update(['used_at' => now()]);
    }

    public function updateTeamPassword(Team $team, string $password): void
    {
        $team->update(['password' => $password]);
    }

    public function deleteOldVerificationCodes(string $email): void
    {
        PasswordResetCode::query()
            ->where('email', $email)
            ->where('type', 'verify_email')
            ->delete();
    }

    public function findValidVerificationCode(string $email, string $code): ?PasswordResetCode
    {
        return PasswordResetCode::query()
            ->where('email', $email)
            ->where('code', $code)
            ->where('type', 'verify_email')
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();
    }

    public function updateTeamStatus(Team $team, string $status): void
    {
        $team->update(['status' => $status]);
    }
}
