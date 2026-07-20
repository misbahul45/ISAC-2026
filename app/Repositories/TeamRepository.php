<?php

namespace App\Repositories;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;

class TeamRepository implements TeamRepositoryInterface
{
    /**
     * @param array{name?: string, phone?: string|null, school_name?: string|null, school_address?: string|null, document_url?: string|null, twibbon_url?: string|null} $data
     */
    public function update(Team $team, array $data): Team
    {
        $team->update($data);

        return $team->fresh();
    }
}
