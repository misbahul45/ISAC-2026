<?php

namespace App\Repositories\Contracts;

use App\Models\PasswordResetCode;
use App\Models\Team;

interface AuthRepositoryInterface
{
    /**
     * @param  array{email: string, password: string, code: string, status: string}  $data
     */
    public function createTeam(array $data): Team;

    public function findByEmail(string $email): ?Team;

    public function createResetCode(array $data): PasswordResetCode;

    public function deleteOldResetCodes(string $email): void;

    public function findValidResetCode(string $email, string $code): ?PasswordResetCode;

    public function markCodeAsVerified(PasswordResetCode $resetCode, string $resetToken): void;

    public function findValidResetToken(string $resetToken): ?PasswordResetCode;

    public function markTokenAsUsed(PasswordResetCode $resetCode): void;

    public function updateTeamPassword(Team $team, string $password): void;

    public function deleteOldVerificationCodes(string $email): void;

    public function findValidVerificationCode(string $email, string $code): ?PasswordResetCode;

    public function updateTeamStatus(Team $team, string $status): void;
}
