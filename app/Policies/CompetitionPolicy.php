<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Competition;

class CompetitionPolicy
{
    public function before(Admin $admin, string $ability): ?bool
    {
        return $admin->role === 'super_admin' ? true : null;
    }

    public function viewAny(Admin $admin): bool
    {
        return in_array($admin->role, ['admin_registration', 'judge'], true);
    }

    public function view(Admin $admin, Competition $competition): bool
    {
        return $this->viewAny($admin);
    }

    public function create(Admin $admin): bool
    {
        return false;
    }

    public function update(Admin $admin, Competition $competition): bool
    {
        return false;
    }

    public function delete(Admin $admin, Competition $competition): bool
    {
        return false;
    }
}
