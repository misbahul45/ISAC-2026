<?php

namespace App\Repositories;

use App\Models\Competition;
use App\Repositories\Contracts\CompetitionRepositoryInterface;

class CompetitionRepository implements CompetitionRepositoryInterface
{
    public function getAll()
    {
        return Competition::all(); 
    }

    public function findById($id)
    {
        return Competition::findOrFail($id);
    }
}