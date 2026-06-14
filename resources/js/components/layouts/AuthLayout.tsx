import type { ReactNode } from 'react';

type AuthLayoutProps = {
    children: ReactNode;
};

export function AuthLayout({ children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-950 px-6 py-10 text-slate-950">
            <div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-md items-center justify-center">
                {children}
            </div>
        </div>
    );
}
