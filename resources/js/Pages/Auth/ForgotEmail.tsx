import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { ForgotEmailForm } from '@/features/auth/components/ForgotEmailForm';

const ForgotEmail = () => {
    return (
        <AuthShell
            title="Lupa Password"
            description="Masukkan email untuk menerima kode verifikasi."
        >
            <ForgotEmailForm />
        </AuthShell>
    );
};

ForgotEmail.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Lupa Password - ISAC 2026"
        description="Masukkan email untuk menerima kode verifikasi reset password."
    >
        {page}
    </AuthLayout>
);

export default ForgotEmail;