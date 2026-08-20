<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Team;

class TeamPolicy
{
    public function before(Admin $admin, string $ability): ?bool
    {
        return $admin->role === 'super_admin' ? true : null;
    }

    public function viewAny(Admin $admin): bool
    {
        return in_array($admin->role, ['admin_registration', 'admin_payment'], true);
    }

    public function view(Admin $admin, Team $team): bool
    {
        return $this->viewAny($admin);
    }

    public function verifyData(Admin $admin, Team $team): bool
    {
        return $admin->role === 'admin_registration';
    }

    public function updateData(Admin $admin, Team $team): bool
    {
        return $admin->role === 'admin_registration';
    }

    public function requestRevision(Admin $admin, Team $team): bool
    {
        return $this->verifyData($admin, $team);
    }

    public function reject(Admin $admin, Team $team): bool
    {
        return $this->verifyData($admin, $team);
    }
}
