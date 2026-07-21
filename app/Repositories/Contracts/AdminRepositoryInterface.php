<?php

namespace App\Repositories\Contracts;

use App\Models\Admin;

interface AdminRepositoryInterface
{
    public function findByEmail(string $email): ?Admin;

    public function findActiveById(string $id): ?Admin;
}
