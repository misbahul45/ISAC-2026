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
     * @param array{name?: string, phone?: string|null, school_name?: string|null, school_address?: string|null} $data
     */
    public function updateProfile(Team $team, array $data): Team
    {
        // ponytail: status transition (PROFILE_INCOMPLETE -> next) handled by the registration flow, not here
        return $this->teamRepository->update($team, $data);
    }
}
