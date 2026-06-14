import { Head } from '@inertiajs/react';
import { AuthLayout } from '@/components/layouts/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { LoginForm } from '@/features/auth/components/LoginForm';
import type { InertiaPageProps } from '@/types/inertia';

export default function Login({ title = 'Login' }: InertiaPageProps) {
    return (
        <AuthLayout>
            <Head title={title} />
            <AuthShell
                title="Login"
                description="Masuk ke dashboard ISAC 2026."
            >
                <LoginForm />
            </AuthShell>
        </AuthLayout>
    );
}
