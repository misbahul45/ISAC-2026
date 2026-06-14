import type { ReactNode } from 'react';

type AuthShellProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export function AuthShell({ title, description, children }: AuthShellProps) {
    return (
        <main className="w-full space-y-6">
            <div className="space-y-2 text-center text-white">
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-sky-300">
                    ISAC 2026
                </p>
                <h1 className="text-3xl font-semibold">{title}</h1>
                <p className="text-sm text-slate-300">{description}</p>
            </div>

            {children}
        </main>
    );
}
