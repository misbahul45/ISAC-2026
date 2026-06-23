<?php

namespace App\Repositories\Contracts;

use App\Models\Team;

interface AuthRepositoryInterface
{
    /**
     * @param  array{email: string, password: string, code: string, status: string}  $data
     */
    public function createTeam(array $data): Team;
}
