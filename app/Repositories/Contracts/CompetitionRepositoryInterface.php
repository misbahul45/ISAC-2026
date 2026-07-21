<?php

namespace App\Repositories\Contracts;

interface CompetitionRepositoryInterface
{
    public function getAll();
    public function findById($id);
}