import type { ReactNode } from 'react';

type DashboardLayoutProps = {
    children: ReactNode;
};

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <main className="min-h-screen bg-slate-950 px-6 py-8 text-slate-100">
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
                {children}
            </div>
        </main>
    );
}
