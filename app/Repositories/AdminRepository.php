<?php

namespace App\Repositories;

use App\Models\Admin;
use App\Repositories\Contracts\AdminRepositoryInterface;

class AdminRepository implements AdminRepositoryInterface
{
    public function findByEmail(string $email): ?Admin
    {
        return Admin::query()->where('email', $email)->first();
    }

    public function findActiveById(string $id): ?Admin
    {
        return Admin::query()
            ->where('id', $id)
            ->where('is_active', true)
            ->first();
    }
}
