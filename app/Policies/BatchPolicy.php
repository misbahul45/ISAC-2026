<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Batch;

class BatchPolicy
{
    public function before(Admin $admin, string $ability): ?bool
    {
        return $admin->role === 'super_admin' ? true : null;
    }

    public function viewAny(Admin $admin): bool
    {
        return in_array($admin->role, ['admin_registration', 'admin_payment', 'judge'], true);
    }

    public function view(Admin $admin, Batch $batch): bool
    {
        return $this->viewAny($admin);
    }

    public function create(Admin $admin): bool
    {
        return $admin->role === 'admin_registration';
    }

    public function update(Admin $admin, Batch $batch): bool
    {
        return $this->create($admin);
    }

    public function delete(Admin $admin, Batch $batch): bool
    {
        return $this->create($admin);
    }
}
