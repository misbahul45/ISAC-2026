import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { VerifyEmailForm } from '@/features/auth/components/VerifyEmailForm';

const VerifyEmail = () => {
    return (
        <AuthShell
            title="Verifikasi Email"
            description="Masukkan kode OTP yang dikirim ke email Anda."
        >
            <VerifyEmailForm />
        </AuthShell>
    );
};

VerifyEmail.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Verifikasi Email - ISAC 2026"
        description="Masukkan kode OTP yang dikirim ke email Anda untuk verifikasi akun."
        noindex
    >
        {page}
    </AuthLayout>
);

export default VerifyEmail;