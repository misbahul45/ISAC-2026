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

}
