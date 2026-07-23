import type { CSSProperties, ReactNode } from 'react';
import { Seo } from '@/components/seo/Seo';
import { usePage } from '@inertiajs/react';
import Sound1 from '@/components/shared/Sound1';
import Sound2 from '@/components/shared/Sound2';
import Sound3 from '@/components/shared/Sound3';
import Sound4 from '@/components/shared/Sound4';
import {
    AUTH_PAGE_CONFIGS,
    type FloatingIconConfig,
} from '@/constants/auth';

type AuthLayoutProps = {
    children: ReactNode;
    title?: string;
    description?: string;
    noindex?: boolean;
};

const BACKGROUND_CIRCLES = [
    {
        top: '8%',
        left: '6%',
        size: 90,
        opacity: 0.35,
        blur: 2,
    },
    {
        top: '16%',
        left: '82%',
        size: 140,
        opacity: 0.25,
        blur: 4,
    },
    {
        top: '36%',
        left: '14%',
        size: 56,
        opacity: 0.4,
        blur: 1,
    },
    {
        top: '58%',
        left: '88%',
        size: 72,
        opacity: 0.3,
        blur: 2,
    },
    {
        top: '76%',
        left: '7%',
        size: 124,
        opacity: 0.22,
        blur: 5,
    },
    {
        top: '84%',
        left: '72%',
        size: 48,
        opacity: 0.38,
        blur: 1,
    },
    {
        top: '5%',
        left: '48%',
        size: 44,
        opacity: 0.3,
        blur: 1,
    },
    {
        top: '68%',
        left: '42%',
        size: 64,
        opacity: 0.2,
        blur: 3,
    },
    {
        top: '42%',
        left: '94%',
        size: 38,
        opacity: 0.32,
        blur: 1,
    },
    {
        top: '91%',
        left: '28%',
        size: 84,
        opacity: 0.24,
        blur: 3,
    },
];

const FloatingIcon = ({ config }: { config: FloatingIconConfig }) => {
    const {
        component,
        angle,
        distance,
        size,
        opacity,
        delay,
        phase,
        speed,
        orbitSpeed,
    } = config;

    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;

    const wrapperStyle = {
        transform: `translate(${x}px, ${y}px)`,
        opacity,
        animationDelay: `${delay}s`,
    } as CSSProperties;

    const iconClass = `${size} animate-[floatNote_${speed}s_ease-in-out_infinite]`;

    const glassClass =
        'rounded-2xl border border-primary/20 bg-primary/10 p-3 shadow-lg shadow-primary/10 backdrop-blur-md';

    const orbitDelay = delay + phase;
    const visibilityDelay = delay + phase * 1.5;

    return (
        <div
            className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={wrapperStyle}
        >
            <div
                className={glassClass}
                style={{
                    animation: `soundOrbit ${orbitSpeed}s ease-in-out infinite, soundVisibility 8s ease-in-out infinite`,
                    animationDelay: `${orbitDelay}s, ${visibilityDelay}s`,
                }}
            >
                {component === 'sound1' && (
                    <Sound1 className={iconClass} />
                )}

                {component === 'sound2' && (
                    <Sound2 className={iconClass} />
                )}

                {component === 'sound3' && (
                    <Sound3 className={iconClass} />
                )}

                {component === 'sound4' && (
                    <Sound4 className={iconClass} />
                )}
            </div>
        </div>
    );
};

export function AuthLayout({
    children,
    title,
    description,
    noindex = true,
}: AuthLayoutProps) {
    const { url } = usePage();
    const path = url.split('?')[0];

    const configPath =
        path === '/auth/forgot-password'
            ? '/auth/forgot-email'
            : path.startsWith('/auth/reset-password')
              ? '/auth/change-password'
              : path;

    const floatingIcons =
        AUTH_PAGE_CONFIGS[configPath] ||
        AUTH_PAGE_CONFIGS['/auth/login'];

    return (
        <>
            <Seo
                title={title}
                description={description}
                canonical={url}
                type="website"
                noindex={noindex}
            />

            <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                45deg,
                                transparent 47%,
                                var(--primary) 48%,
                                var(--primary) 49%,
                                transparent 50%
                            ),
                            linear-gradient(
                                -45deg,
                                transparent 47%,
                                var(--primary) 48%,
                                var(--primary) 49%,
                                transparent 50%
                            )
                        `,
                        backgroundSize: '36px 36px',
                    }}
                />

                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
                            linear-gradient(
                                to right,
                                var(--primary) 1px,
                                transparent 1px
                            ),
                            linear-gradient(
                                to bottom,
                                var(--primary) 1px,
                                transparent 1px
                            )
                        `,
                        backgroundSize: '72px 72px',
                        maskImage:
                            'radial-gradient(circle at center, black, transparent 85%)',
                        WebkitMaskImage:
                            'radial-gradient(circle at center, black, transparent 85%)',
                    }}
                />

                <div className="pointer-events-none absolute inset-0">
                    {BACKGROUND_CIRCLES.map((circle, index) => (
                        <div
                            key={`background-circle-${index}`}
                            className="absolute rounded-full border border-primary/20 bg-primary/10"
                            style={{
                                top: circle.top,
                                left: circle.left,
                                width: `${circle.size}px`,
                                height: `${circle.size}px`,
                                opacity: circle.opacity,
                                filter: `blur(${circle.blur}px)`,
                            }}
                        >
                            <div className="absolute inset-[18%] rounded-full border border-primary/20" />
                            <div className="absolute inset-[36%] rounded-full bg-primary/20" />
                        </div>
                    ))}
                </div>

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute top-1/4 left-1/4 h-150 w-150 rounded-full bg-primary/20 blur-[150px]" />

                    <div className="absolute right-1/4 bottom-1/4 h-150 w-150 rounded-full bg-primary/20 blur-[150px]" />

                    <div className="absolute top-1/2 left-1/2 h-225 w-225 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[200px]" />
                </div>

                <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-center">
                        {floatingIcons.map((icon, index) => (
                            <FloatingIcon
                                key={`orbit-${index}`}
                                config={icon}
                            />
                        ))}

                        <div className="relative z-20 py-16">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}