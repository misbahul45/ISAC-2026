<?php

namespace App\Services;

use App\Models\Team;
use App\Repositories\Contracts\TeamRepositoryInterface;

class TeamService
{
    public function __construct(
        private readonly TeamRepositoryInterface $teamRepository,
    ) {
        //
    }

    /**
     * @param array{name?: string, phone?: string|null, school_name?: string|null, school_address?: string|null, document_url?: string|null, twibbon_url?: string|null} $data
     */
    public function updateProfile(Team $team, array $data): Team
    {
        // Data verification transitions are handled by the admin verification flow.
        return $this->teamRepository->update($team, $data);
    }
}
