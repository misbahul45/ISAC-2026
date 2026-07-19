import { Head } from '@inertiajs/react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { AuthShell } from '@/features/auth/components/AuthShell';
import { RegisterForm } from '@/features/auth/components/RegisterForm';
import type { InertiaPageProps } from '@/types/inertia';

export default function Register({ title = 'Register' }: InertiaPageProps) {
    return (
        <AuthLayout>
            <Head title={title} />
            <AuthShell
                title="Register"
                description="Daftar akun untuk mengakses sistem ISAC 2026."
            >
                <RegisterForm />
            </AuthShell>
        </AuthLayout>
    );
}
