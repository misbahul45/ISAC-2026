import type { ReactNode } from 'react';
import Sound1 from '@/components/shared/Sound1';
import Sound2 from '@/components/shared/Sound2';

type AuthShellProps = {
    title: string;
    description: string;
    children: ReactNode;
};

export function AuthShell({ children }: AuthShellProps) {
    return (
        <main className="w-full space-y-6">
            <div className="flex items-center justify-center gap-8">
                <div className="relative">
                    <div className="absolute fuleft-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-[pulseRing_3s_ease-out_infinite] rounded-full border border-primary/20" />
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-lg shadow-white/5">
                        <Sound1 className="h-10 w-10 drop-shadow-lg" />
                    </div>
                </div>

                <div className="flex h-12 items-end gap-[5px]">
                    {[20, 45, 70, 35, 55, 80, 40, 65, 30, 50].map((h, i) => (
                        <div
                            key={i}
                            className="w-[3px] animate-[waveDance_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-primary to-secondary opacity-70"
                            style={{
                                height: `${h}%`,
                                animationDelay: `${[0, 0.1, 0.2, 0.3, 0.15, 0.25, 0.05, 0.35, 0.1, 0.2][i]}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative">
                    <div className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-[pulseRing_3s_ease-out_infinite] rounded-full border border-secondary/20" style={{ animationDelay: '1.5s' }} />
                    <div className="rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-lg shadow-white/5">
                        <Sound2 className="h-10 w-10 drop-shadow-lg" />
                    </div>
                </div>
            </div>

            {children}
        </main>
    );
}