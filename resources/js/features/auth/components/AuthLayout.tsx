import {
    useEffect,
    useState,
    type CSSProperties,
    type ReactNode,
} from 'react';
import { Seo } from '@/components/seo/Seo';
import { usePage } from '@inertiajs/react';
import Sound1 from '@/components/shared/Sound1';
import Sound2 from '@/components/shared/Sound2';
import Sound3 from '@/components/shared/Sound3';
import Sound4 from '@/components/shared/Sound4';
import {
    AUTH_PAGE_CONFIGS,
    resolveResponsiveDistance,
    type FloatingIconConfig,
    type FloatingIconVisibility,
} from '@/constants/auth';

type AuthLayoutProps = {
    children: ReactNode;
    title?: string;
    description?: string;
    noindex?: boolean;
};

type BackgroundCircle = {
    top: string;
    left: string;
    size: number;
    opacity: number;
    blur: number;
    visibleFrom?: FloatingIconVisibility;
};

const BACKGROUND_CIRCLES: BackgroundCircle[] = [
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
        visibleFrom: 'sm',
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
        visibleFrom: 'sm',
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
        visibleFrom: 'md',
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

const VISIBILITY_CLASSES: Record<
    FloatingIconVisibility,
    string
> = {
    base: 'block',
    sm: 'hidden sm:block',
    md: 'hidden md:block',
};

function useViewportWidth() {
    const [viewportWidth, setViewportWidth] = useState(0);

    useEffect(() => {
        let animationFrame = 0;

        const updateViewportWidth = () => {
            cancelAnimationFrame(animationFrame);

            animationFrame = requestAnimationFrame(() => {
                setViewportWidth(window.innerWidth);
            });
        };

        updateViewportWidth();

        window.addEventListener('resize', updateViewportWidth);

        return () => {
            cancelAnimationFrame(animationFrame);
            window.removeEventListener(
                'resize',
                updateViewportWidth,
            );
        };
    }, []);

    return viewportWidth;
}

const FloatingIcon = ({
    config,
    viewportWidth,
}: {
    config: FloatingIconConfig;
    viewportWidth: number;
}) => {
    const {
        component,
        angle,
        size,
        opacity,
        delay,
        phase,
        speed,
        orbitSpeed,
        showFrom,
    } = config;

    const distance = resolveResponsiveDistance(
        config.distance,
        viewportWidth,
    );

    const radian = (angle * Math.PI) / 180;
    const x = Math.cos(radian) * distance;
    const y = Math.sin(radian) * distance;

    const wrapperStyle: CSSProperties = {
        transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
        opacity,
    };

    const iconClass = `${size} animate-[floatNote_${speed}s_ease-in-out_infinite]`;

    const orbitDelay = delay + phase;
    const visibilityDelay = delay + phase * 1.5;

    return (
        <div
            className={`pointer-events-none absolute left-1/2 top-1/2 ${VISIBILITY_CLASSES[showFrom]}`}
            style={wrapperStyle}
        >
            <div
                className="scale-75 rounded-xl border border-primary/20 bg-primary/10 p-2 shadow-lg shadow-primary/10 backdrop-blur-md sm:scale-90 sm:rounded-2xl sm:p-2.5 lg:scale-100 lg:p-3"
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
    const viewportWidth = useViewportWidth();
    const path = url.split('?')[0];

    const configPath =
        path === '/auth/forgot-password'
            ? '/auth/forgot-email'
            : path.startsWith('/auth/reset-password')
              ? '/auth/change-password'
              : path;

    const floatingIcons =
        AUTH_PAGE_CONFIGS[configPath] ??
        AUTH_PAGE_CONFIGS['/auth/login'] ??
        [];

    return (
        <>
            <Seo
                title={title}
                description={description}
                canonical={url}
                type="website"
                noindex={noindex}
            />

            <div className="relative flex min-h-screen min-h-dvh items-center justify-center overflow-hidden bg-background">
                <div
                    className="pointer-events-none absolute inset-0 opacity-20 [background-size:22px_22px] sm:[background-size:28px_28px] md:[background-size:32px_32px] xl:[background-size:36px_36px]"
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
                    }}
                />

                <div
                    className="pointer-events-none absolute inset-0 opacity-20 [background-size:44px_44px] sm:[background-size:56px_56px] md:[background-size:64px_64px] xl:[background-size:72px_72px]"
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
                        maskImage:
                            'radial-gradient(circle at center, black, transparent 85%)',
                        WebkitMaskImage:
                            'radial-gradient(circle at center, black, transparent 85%)',
                    }}
                />

                <div className="pointer-events-none absolute inset-0">
                    {BACKGROUND_CIRCLES.map(
                        (circle, index) => (
                            <div
                                key={`background-circle-${index}`}
                                className={`absolute rounded-full border border-primary/20 bg-primary/10 ${
                                    VISIBILITY_CLASSES[
                                        circle.visibleFrom ?? 'base'
                                    ]
                                }`}
                                style={{
                                    top: circle.top,
                                    left: circle.left,
                                    width: `clamp(${Math.round(circle.size * 0.55)}px, ${circle.size / 8}vw, ${circle.size}px)`,
                                    height: `clamp(${Math.round(circle.size * 0.55)}px, ${circle.size / 8}vw, ${circle.size}px)`,
                                    opacity: circle.opacity,
                                    filter: `blur(${circle.blur}px)`,
                                }}
                            >
                                <div className="absolute inset-[18%] rounded-full border border-primary/20" />

                                <div className="absolute inset-[36%] rounded-full bg-primary/20" />
                            </div>
                        ),
                    )}
                </div>

                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className="absolute left-[-80px] top-[5%] h-[240px] w-[240px] rounded-full bg-primary/20 blur-[100px] sm:left-[5%] sm:h-[360px] sm:w-[360px] sm:blur-[130px] lg:left-1/4 lg:top-1/4 lg:h-[600px] lg:w-[600px] lg:blur-[150px]" />

                    <div className="absolute bottom-[2%] right-[-100px] h-[280px] w-[280px] rounded-full bg-primary/20 blur-[100px] sm:right-[5%] sm:h-[400px] sm:w-[400px] sm:blur-[130px] lg:bottom-1/4 lg:right-1/4 lg:h-[600px] lg:w-[600px] lg:blur-[150px]" />

                    <div className="absolute left-1/2 top-1/2 h-[380px] w-[380px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[130px] sm:h-[600px] sm:w-[600px] sm:blur-[170px] lg:h-[900px] lg:w-[900px] lg:blur-[200px]" />
                </div>

                <div className="relative z-10 mx-auto flex min-h-screen min-h-dvh w-full max-w-7xl items-center justify-center px-3 py-6 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                    <div className="relative flex w-full max-w-2xl items-center justify-center">
                        <div className="pointer-events-none absolute inset-0">
                            {floatingIcons.map(
                                (icon, index) => (
                                    <FloatingIcon
                                        key={`${configPath}-${icon.component}-${index}`}
                                        config={icon}
                                        viewportWidth={
                                            viewportWidth
                                        }
                                    />
                                ),
                            )}
                        </div>

                        <div className="relative z-20 w-full py-6 sm:py-10 lg:py-16">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}