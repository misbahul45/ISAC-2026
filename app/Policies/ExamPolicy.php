<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Exam;

class ExamPolicy
{
    public function author(Admin $admin): bool
    {
        return in_array($admin->role, ['super_admin', 'judge'], true);
    }
}
