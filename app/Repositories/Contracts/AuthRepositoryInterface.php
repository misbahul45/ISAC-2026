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
}
