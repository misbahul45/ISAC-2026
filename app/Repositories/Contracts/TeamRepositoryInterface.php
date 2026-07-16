<?php

namespace App\Repositories\Contracts;

use App\Models\Team;

interface TeamRepositoryInterface
{
    /**
     * @param array{name?: string, phone?: string|null, school_name?: string|null, school_address?: string|null} $data
     */
    public function update(Team $team, array $data): Team;
}
