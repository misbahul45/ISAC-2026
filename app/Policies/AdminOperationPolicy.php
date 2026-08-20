<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\AdminOperation;

class AdminOperationPolicy
{
    public function viewAny(Admin $admin): bool
    {
        return in_array($admin->role, ['super_admin', 'admin_registration', 'admin_payment', 'judge'], true);
    }

    public function view(Admin $admin, AdminOperation $operation): bool
    {
        return $this->viewAny($admin);
    }

    public function run(Admin $admin, string $action): bool
    {
        return match ($action) {
            AdminOperation::ACTION_VERIFY_PAYMENT => in_array($admin->role, ['super_admin', 'admin_payment'], true),
            AdminOperation::ACTION_VERIFY_TEAM,
            AdminOperation::ACTION_ADVANCE_STAGE,
            AdminOperation::ACTION_ANNOUNCE_RESULT => in_array($admin->role, ['super_admin', 'admin_registration'], true),
            default => false,
        };
    }

    public function retry(Admin $admin, AdminOperation $operation): bool
    {
        return $this->run($admin, $operation->action);
    }
}
