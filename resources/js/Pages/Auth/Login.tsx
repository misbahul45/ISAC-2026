import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { LoginForm } from '@/features/auth/components/LoginForm';

const Login = () => {
    return (
        <AuthShell
            title="Login"
            description="Masuk ke dashboard ISAC 2026."
        >
            <LoginForm />
        </AuthShell>
    );
};

Login.layout = (page: React.ReactNode) => (
    <AuthLayout
        title="Login"
        description="Masuk ke dashboard ISAC 2026."
    >
        {page}
    </AuthLayout>
);

export default Login;
