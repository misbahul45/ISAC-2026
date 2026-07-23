import type { ReactNode } from 'react';
import Sound1 from '@/components/shared/Sound1';
import Sound2 from '@/components/shared/Sound2';

type AuthShellProps = {
    title: string;
    description: string;
    children: ReactNode;
};

const WAVE_HEIGHTS = [20, 45, 70, 35, 55, 80, 40, 65, 30, 50];

const WAVE_DELAYS = [
    0,
    0.1,
    0.2,
    0.3,
    0.15,
    0.25,
    0.05,
    0.35,
    0.1,
    0.2,
];

export function AuthShell({ children }: AuthShellProps) {
    return (
        <main className="mx-auto w-full max-w-2xl space-y-5 sm:space-y-6">
            <div className="flex items-center justify-center gap-3 sm:gap-6 lg:gap-8">
                <div className="relative shrink-0">
                    <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-[pulseRing_3s_ease-out_infinite] rounded-full border border-primary/20 sm:h-20 sm:w-20" />

                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 shadow-lg shadow-primary/10 backdrop-blur-md sm:rounded-2xl sm:p-3">
                        <Sound1 className="h-8 w-8 drop-shadow-lg sm:h-10 sm:w-10" />
                    </div>
                </div>

                <div className="flex h-10 min-w-0 items-end gap-[3px] sm:h-12 sm:gap-[5px]">
                    {WAVE_HEIGHTS.map((height, index) => (
                        <div
                            key={index}
                            className="w-[2px] animate-[waveDance_1.2s_ease-in-out_infinite] rounded-full bg-gradient-to-t from-primary to-secondary opacity-70 sm:w-[3px]"
                            style={{
                                height: `${height}%`,
                                animationDelay: `${WAVE_DELAYS[index]}s`,
                            }}
                        />
                    ))}
                </div>

                <div className="relative shrink-0">
                    <div
                        className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 animate-[pulseRing_3s_ease-out_infinite] rounded-full border border-secondary/20 sm:h-20 sm:w-20"
                        style={{
                            animationDelay: '1.5s',
                        }}
                    />

                    <div className="rounded-xl border border-primary/20 bg-primary/10 p-2.5 shadow-lg shadow-primary/10 backdrop-blur-md sm:rounded-2xl sm:p-3">
                        <Sound2 className="h-8 w-8 drop-shadow-lg sm:h-10 sm:w-10" />
                    </div>
                </div>
            </div>

            <div className="mx-auto w-full max-w-xl px-3 sm:px-4">
                {children}
            </div>
        </main>
    );
}