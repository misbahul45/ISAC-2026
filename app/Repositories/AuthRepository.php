<?php

namespace App\Repositories;

use App\Enums\AuthChallengePurpose;
use App\Models\Admin;
use App\Models\AuthChallenge;
use App\Models\Team;
use App\Repositories\Contracts\AuthRepositoryInterface;

class AuthRepository implements AuthRepositoryInterface
{
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

    public function findAdminByEmail(string $email): ?Admin
    {
        return Admin::query()->where('email', $email)->first();
    }

    public function invalidateChallenges(string $accountId, string $accountType, AuthChallengePurpose $purpose): void
    {
        AuthChallenge::query()
            ->where('account_id', $accountId)
            ->where('account_type', $accountType)
            ->where('purpose', $purpose)
            ->delete();
    }

    public function createChallenge(array $data): AuthChallenge
    {
        return AuthChallenge::query()->create($data);
    }

    public function findValidChallenge(string $accountId, string $accountType, AuthChallengePurpose $purpose, string $code): ?AuthChallenge
    {
        $challenge = AuthChallenge::query()
            ->where('account_id', $accountId)
            ->where('account_type', $accountType)
            ->where('purpose', $purpose)
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();

        if ($challenge === null) {
            return null;
        }

        if (! hash_equals($challenge->code_hash, bcrypt($code))) {
            return null;
        }

        $challenge->update(['verified_at' => now()]);

        return $challenge->fresh();
    }

    public function findValidResetToken(string $resetToken): ?AuthChallenge
    {
        return AuthChallenge::query()
            ->where('purpose', AuthChallengePurpose::RESET_PASSWORD)
            ->whereNotNull('verified_at')
            ->whereNull('used_at')
            ->where('expired_at', '>', now())
            ->first();
    }

    public function markChallengeUsed(AuthChallenge $challenge): void
    {
        $challenge->markUsed();
    }

    public function updateTeamPassword(Team $team, string $password): void
    {
        $team->update(['password' => $password]);
    }

    public function markTeamEmailAsVerified(Team $team): void
    {
        $team->update(['email_verified_at' => now()]);
    }
}
