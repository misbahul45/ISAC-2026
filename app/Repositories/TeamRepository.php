<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;
use Illuminate\Support\Str;

class TeamRepository implements TeamRepositoryInterface
{
    /**
     * @param  array{email: string, password: string, code: string, status: string}  $data
     */
    public function createTeam(array $data): Team
    {
        return Team::query()->forceCreate([
            'id' => Str::uuid()->toString(),
            'email' => $data['email'],
            'password' => $data['password'],
            'code' => $data['code'],
            'status' => $data['status'],
        ]);
    }
}
