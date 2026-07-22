<?php

namespace App\Policies;

use App\Models\Admin;
use App\Models\Registration;

class RegistrationPolicy
{
    public function before(Admin $admin, string $ability): ?bool
    {
        return $admin->role === 'super_admin' ? true : null;
    }

    public function view(Admin $admin, Registration $registration): bool
    {
        return in_array($admin->role, ['admin_registration', 'admin_payment'], true);
    }

    public function verifyPayment(Admin $admin, Registration $registration): bool
    {
        return $admin->role === 'admin_payment';
    }

    public function requestPaymentRevision(Admin $admin, Registration $registration): bool
    {
        return $this->verifyPayment($admin, $registration);
    }

    public function rejectPayment(Admin $admin, Registration $registration): bool
    {
        return $this->verifyPayment($admin, $registration);
    }
}
