import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';

const Register = () => {
    return (
        <AuthShell
            title="Register"
            description="Daftar akun untuk mengakses sistem ISAC 2026."
        >
            <RegisterForm />
        </AuthShell>
    );
};

Register.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Register - ISAC 2026"
        description="Daftar akun untuk mengakses sistem ISAC 2026."
    >
        {page}
    </AuthLayout>
);

export default Register;