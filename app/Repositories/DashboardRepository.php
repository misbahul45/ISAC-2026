<?php

namespace App\Repositories;

use App\Models\Todo;
use App\Repositories\Contracts\DashboardRepositoryInterface;

class DashboardRepository implements DashboardRepositoryInterface
{
    /**
     * @return array{total: int, active: int, completed: int}
     */
    public function todoSummary(): array
    {
        $total = Todo::query()->count();
        $completed = Todo::query()->where('is_completed', true)->count();

        return [
            'total' => $total,
            'active' => $total - $completed,
            'completed' => $completed,
        ];
    }
}
