<?php

namespace App\Services;

use App\Models\Team;

class DashboardService
{
    public function getSummary(Team $team): Team
    {
        return $team->load(
            'members',
            'registration.competition',
            'registration.batch',
            'registration.paymentProofFile',
            'registration.paymentForStage',
            'currentStage',
        );
    }
}
