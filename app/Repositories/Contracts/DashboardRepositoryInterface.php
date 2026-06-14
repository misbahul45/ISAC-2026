<?php

namespace App\Repositories\Contracts;

interface DashboardRepositoryInterface
{
    /**
     * @return array{total: int, active: int, completed: int}
     */
    public function todoSummary(): array;
}
