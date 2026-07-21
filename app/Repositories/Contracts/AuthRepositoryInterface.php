<?php

namespace App\Repositories\Contracts;

use App\Enums\AuthChallengePurpose;
use App\Models\Admin;
use App\Models\AuthChallenge;
use App\Models\Team;

interface AuthRepositoryInterface
{
    public function createTeam(array $data): Team;

    public function findByEmail(string $email): ?Team;

    public function findAdminByEmail(string $email): ?Admin;

    public function invalidateChallenges(string $accountId, string $accountType, AuthChallengePurpose $purpose): void;

    public function createChallenge(array $data): AuthChallenge;

    public function findValidChallenge(string $accountId, string $accountType, AuthChallengePurpose $purpose, string $code): ?AuthChallenge;

    public function findValidResetToken(string $resetToken): ?AuthChallenge;

    public function markChallengeUsed(AuthChallenge $challenge): void;

    public function updateTeamPassword(Team $team, string $password): void;

    public function markTeamEmailAsVerified(Team $team): void;
}
