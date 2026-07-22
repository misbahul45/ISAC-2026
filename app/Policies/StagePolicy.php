<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Stage;

class StagePolicy
{
    public function before(Admin $admin, string $ability): ?bool
    {
        return $admin->role === 'super_admin' ? true : null;
    }

    public function advanceTeam(Admin $admin, Stage $stage): bool
    {
        return $admin->role === 'admin_registration';
    }
}
