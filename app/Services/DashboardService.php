<?php

namespace App\Services;

use App\Repositories\Contracts\DashboardRepositoryInterface;

class DashboardService
{
    public function __construct(
        private readonly DashboardRepositoryInterface $dashboardRepository,
    ) {
        //
    }

    /**
     * @return array{total: int, active: int, completed: int}
     */
    public function getSummary(): array
    {
        return $this->dashboardRepository->todoSummary();
    }
}
