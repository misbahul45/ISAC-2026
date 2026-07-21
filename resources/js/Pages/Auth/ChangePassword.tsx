import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { ChangePasswordForm } from '@/features/auth/components/ChangePasswordForm';

const ChangePassword = () => {
    return (
        <AuthShell
            title="Ubah Password"
            description="Buat password baru untuk akun Anda."
        >
            <ChangePasswordForm />
        </AuthShell>
    );
};

ChangePassword.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Ubah Password - ISAC 2026"
        description="Buat password baru untuk akun Anda."
        noindex
    >
        {page}
    </AuthLayout>
);

export default ChangePassword;