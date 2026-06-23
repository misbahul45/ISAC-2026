<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;

class TeamRepository implements TeamRepositoryInterface
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
}
