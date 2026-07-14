<?php

namespace App\Services;

use App\Repositories\Contracts\CompetitionRepositoryInterface;

class CompetitionService
{
    protected $competitionRepo;

    public function __construct(CompetitionRepositoryInterface $competitionRepo)
    {
        $this->competitionRepo = $competitionRepo;
    }

    public function getAllCompetitions()
    {
        return $this->competitionRepo->getAll();
    }

    public function getCompetitionById($id)
    {
        return $this->competitionRepo->findById($id);
    }
}