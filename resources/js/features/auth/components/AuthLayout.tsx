import type { ReactNode } from 'react';
import { Seo } from '@/components/seo/Seo';
import { usePage } from '@inertiajs/react';
import Sound1 from '@/components/shared/Sound1';
import Sound2 from '@/components/shared/Sound2';
import Sound3 from '@/components/shared/Sound3';
import Sound4 from '@/components/shared/Sound4';

type AuthLayoutProps = {
    children: ReactNode;
    title?: string;
    description?: string;
    noindex?: boolean;
};

type FloatingIconConfig = {
    component: 'sound1' | 'sound2' | 'sound3' | 'sound4';
    angle: number;
    distance: number;
    size: string;
    opacity: number;
    delay: number;
    phase: number;
    speed: number;
    orbitRadius: number;
    orbitSpeed: number;
};

// Enhanced configs with orbit movement and fade-in/out cycles
const AUTH_PAGE_CONFIGS: Record<string, FloatingIconConfig[]> = {
    '/auth/login': [
        { component: 'sound1', angle: 0, distance: 420, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.75, delay: 0, phase: 0, speed: 4, orbitRadius: 30, orbitSpeed: 8 },
        { component: 'sound2', angle: 40, distance: 480, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.6, delay: 0.8, phase: 1, speed: 5, orbitRadius: 25, orbitSpeed: 10 },
        { component: 'sound3', angle: 85, distance: 380, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.5, delay: 1.5, phase: 2, speed: 3.5, orbitRadius: 35, orbitSpeed: 7 },
        { component: 'sound4', angle: 130, distance: 520, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.7, delay: 2.2, phase: 0, speed: 4.5, orbitRadius: 20, orbitSpeed: 9 },
        { component: 'sound1', angle: 175, distance: 400, size: 'w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16', opacity: 0.35, delay: 3, phase: 1, speed: 5.5, orbitRadius: 40, orbitSpeed: 6 },
        { component: 'sound2', angle: 220, distance: 460, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.55, delay: 0.4, phase: 2, speed: 4, orbitRadius: 28, orbitSpeed: 11 },
        { component: 'sound3', angle: 265, distance: 500, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-22 md:h-22', opacity: 0.45, delay: 1.2, phase: 0, speed: 3, orbitRadius: 32, orbitSpeed: 8 },
        { component: 'sound4', angle: 310, distance: 440, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.65, delay: 2.8, phase: 1, speed: 5, orbitRadius: 22, orbitSpeed: 10 },
        { component: 'sound1', angle: 55, distance: 560, size: 'w-10 h-10 sm:w-12 sm:h-12', opacity: 0.3, delay: 0.6, phase: 2, speed: 6, orbitRadius: 45, orbitSpeed: 5 },
        { component: 'sound2', angle: 145, distance: 360, size: 'w-16 h-16 sm:w-18 sm:h-18', opacity: 0.5, delay: 1.8, phase: 0, speed: 4.2, orbitRadius: 26, orbitSpeed: 9 },
        { component: 'sound3', angle: 235, distance: 540, size: 'w-12 h-12 sm:w-14 sm:h-14', opacity: 0.4, delay: 2.5, phase: 1, speed: 3.8, orbitRadius: 38, orbitSpeed: 7 },
        { component: 'sound4', angle: 325, distance: 390, size: 'w-14 h-14 sm:w-16 sm:h-16', opacity: 0.6, delay: 3.5, phase: 2, speed: 5.2, orbitRadius: 24, orbitSpeed: 8 },
    ],
    '/auth/register': [
        { component: 'sound2', angle: 15, distance: 450, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.65, delay: 0.2, phase: 1, speed: 4.5, orbitRadius: 28, orbitSpeed: 9 },
        { component: 'sound4', angle: 60, distance: 380, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', opacity: 0.7, delay: 1, phase: 2, speed: 5, orbitRadius: 35, orbitSpeed: 7 },
        { component: 'sound1', angle: 105, distance: 510, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.5, delay: 1.8, phase: 0, speed: 3.5, orbitRadius: 22, orbitSpeed: 10 },
        { component: 'sound3', angle: 150, distance: 430, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22', opacity: 0.6, delay: 2.6, phase: 1, speed: 4, orbitRadius: 30, orbitSpeed: 8 },
        { component: 'sound4', angle: 195, distance: 490, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18', opacity: 0.45, delay: 0.5, phase: 2, speed: 5.5, orbitRadius: 26, orbitSpeed: 6 },
        { component: 'sound3', angle: 240, distance: 370, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', opacity: 0.55, delay: 1.3, phase: 0, speed: 4.2, orbitRadius: 32, orbitSpeed: 9 },
        { component: 'sound1', angle: 285, distance: 530, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.4, delay: 2.1, phase: 1, speed: 3.8, orbitRadius: 24, orbitSpeed: 11 },
        { component: 'sound2', angle: 330, distance: 410, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22', opacity: 0.6, delay: 3, phase: 2, speed: 5, orbitRadius: 36, orbitSpeed: 7 },
        { component: 'sound3', angle: 75, distance: 570, size: 'w-10 h-10 sm:w-12 sm:h-12', opacity: 0.3, delay: 0.7, phase: 0, speed: 6, orbitRadius: 42, orbitSpeed: 5 },
        { component: 'sound1', angle: 165, distance: 350, size: 'w-16 h-16 sm:w-18 sm:h-18', opacity: 0.5, delay: 1.5, phase: 1, speed: 4.5, orbitRadius: 20, orbitSpeed: 10 },
        { component: 'sound4', angle: 255, distance: 550, size: 'w-12 h-12 sm:w-14 sm:h-14', opacity: 0.4, delay: 2.3, phase: 2, speed: 3.5, orbitRadius: 34, orbitSpeed: 8 },
        { component: 'sound2', angle: 345, distance: 400, size: 'w-14 h-14 sm:w-16 sm:h-16', opacity: 0.55, delay: 3.2, phase: 0, speed: 5.2, orbitRadius: 28, orbitSpeed: 9 },
    ],
    '/auth/forgot-email': [
        { component: 'sound3', angle: 25, distance: 470, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.7, delay: 0.3, phase: 2, speed: 4, orbitRadius: 30, orbitSpeed: 8 },
        { component: 'sound1', angle: 70, distance: 390, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.5, delay: 1.1, phase: 0, speed: 5, orbitRadius: 25, orbitSpeed: 10 },
        { component: 'sound4', angle: 115, distance: 520, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.65, delay: 1.9, phase: 1, speed: 3.5, orbitRadius: 35, orbitSpeed: 7 },
        { component: 'sound2', angle: 160, distance: 440, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.75, delay: 0.6, phase: 2, speed: 4.5, orbitRadius: 20, orbitSpeed: 9 },
        { component: 'sound1', angle: 205, distance: 360, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22', opacity: 0.4, delay: 2.4, phase: 0, speed: 5.5, orbitRadius: 40, orbitSpeed: 6 },
        { component: 'sound4', angle: 250, distance: 500, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18', opacity: 0.5, delay: 1.4, phase: 1, speed: 4, orbitRadius: 28, orbitSpeed: 11 },
        { component: 'sound2', angle: 295, distance: 420, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', opacity: 0.45, delay: 2.8, phase: 2, speed: 3.8, orbitRadius: 32, orbitSpeed: 8 },
        { component: 'sound3', angle: 340, distance: 480, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.6, delay: 0.9, phase: 0, speed: 5, orbitRadius: 22, orbitSpeed: 10 },
        { component: 'sound1', angle: 50, distance: 580, size: 'w-10 h-10 sm:w-12 sm:h-12', opacity: 0.3, delay: 0.4, phase: 1, speed: 6, orbitRadius: 45, orbitSpeed: 5 },
        { component: 'sound3', angle: 140, distance: 340, size: 'w-16 h-16 sm:w-18 sm:h-18', opacity: 0.5, delay: 1.7, phase: 2, speed: 4.2, orbitRadius: 26, orbitSpeed: 9 },
        { component: 'sound2', angle: 230, distance: 560, size: 'w-12 h-12 sm:w-14 sm:h-14', opacity: 0.4, delay: 2.2, phase: 0, speed: 3.5, orbitRadius: 38, orbitSpeed: 7 },
        { component: 'sound4', angle: 320, distance: 410, size: 'w-14 h-14 sm:w-16 sm:h-16', opacity: 0.55, delay: 3.1, phase: 1, speed: 5.2, orbitRadius: 24, orbitSpeed: 8 },
    ],
    '/auth/verify-email': [
        { component: 'sound4', angle: 35, distance: 460, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.75, delay: 0.4, phase: 0, speed: 4.5, orbitRadius: 28, orbitSpeed: 9 },
        { component: 'sound3', angle: 80, distance: 510, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.55, delay: 1.2, phase: 1, speed: 5, orbitRadius: 35, orbitSpeed: 7 },
        { component: 'sound2', angle: 125, distance: 380, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.65, delay: 2, phase: 2, speed: 3.5, orbitRadius: 22, orbitSpeed: 10 },
        { component: 'sound1', angle: 170, distance: 540, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-22 md:h-22', opacity: 0.7, delay: 0.7, phase: 0, speed: 4, orbitRadius: 30, orbitSpeed: 8 },
        { component: 'sound3', angle: 215, distance: 430, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', opacity: 0.45, delay: 2.8, phase: 1, speed: 5.5, orbitRadius: 26, orbitSpeed: 6 },
        { component: 'sound2', angle: 260, distance: 490, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22', opacity: 0.5, delay: 1.5, phase: 2, speed: 4.2, orbitRadius: 32, orbitSpeed: 9 },
        { component: 'sound4', angle: 305, distance: 370, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.4, delay: 3.2, phase: 0, speed: 3.8, orbitRadius: 24, orbitSpeed: 11 },
        { component: 'sound1', angle: 350, distance: 470, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.6, delay: 0.2, phase: 1, speed: 5, orbitRadius: 36, orbitSpeed: 7 },
        { component: 'sound2', angle: 65, distance: 590, size: 'w-10 h-10 sm:w-12 sm:h-12', opacity: 0.3, delay: 0.8, phase: 2, speed: 6, orbitRadius: 42, orbitSpeed: 5 },
        { component: 'sound4', angle: 155, distance: 350, size: 'w-16 h-16 sm:w-18 sm:h-18', opacity: 0.5, delay: 1.8, phase: 0, speed: 4.5, orbitRadius: 20, orbitSpeed: 10 },
        { component: 'sound1', angle: 245, distance: 570, size: 'w-12 h-12 sm:w-14 sm:h-14', opacity: 0.4, delay: 2.5, phase: 1, speed: 3.5, orbitRadius: 34, orbitSpeed: 8 },
        { component: 'sound3', angle: 335, distance: 420, size: 'w-14 h-14 sm:w-16 sm:h-16', opacity: 0.55, delay: 3.4, phase: 2, speed: 5.2, orbitRadius: 28, orbitSpeed: 9 },
    ],
    '/auth/change-password': [
        { component: 'sound1', angle: 20, distance: 480, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.7, delay: 0.1, phase: 1, speed: 4, orbitRadius: 30, orbitSpeed: 8 },
        { component: 'sound4', angle: 65, distance: 410, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.75, delay: 0.9, phase: 2, speed: 5, orbitRadius: 25, orbitSpeed: 10 },
        { component: 'sound3', angle: 110, distance: 530, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-18 md:h-18', opacity: 0.55, delay: 1.7, phase: 0, speed: 3.5, orbitRadius: 35, orbitSpeed: 7 },
        { component: 'sound2', angle: 155, distance: 450, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-24 md:h-24', opacity: 0.6, delay: 2.5, phase: 1, speed: 4.5, orbitRadius: 20, orbitSpeed: 9 },
        { component: 'sound4', angle: 200, distance: 390, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-18 md:h-18', opacity: 0.45, delay: 0.4, phase: 2, speed: 5.5, orbitRadius: 40, orbitSpeed: 6 },
        { component: 'sound1', angle: 245, distance: 520, size: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16', opacity: 0.5, delay: 1.3, phase: 0, speed: 4, orbitRadius: 28, orbitSpeed: 11 },
        { component: 'sound3', angle: 290, distance: 440, size: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20', opacity: 0.4, delay: 2.9, phase: 1, speed: 3.8, orbitRadius: 32, orbitSpeed: 8 },
        { component: 'sound2', angle: 335, distance: 500, size: 'w-16 h-16 sm:w-18 sm:h-18 md:w-22 md:h-22', opacity: 0.65, delay: 0.6, phase: 2, speed: 5, orbitRadius: 22, orbitSpeed: 10 },
        { component: 'sound4', angle: 45, distance: 600, size: 'w-10 h-10 sm:w-12 sm:h-12', opacity: 0.3, delay: 0.3, phase: 0, speed: 6, orbitRadius: 45, orbitSpeed: 5 },
        { component: 'sound2', angle: 135, distance: 360, size: 'w-16 h-16 sm:w-18 sm:h-18', opacity: 0.5, delay: 1.6, phase: 1, speed: 4.2, orbitRadius: 26, orbitSpeed: 9 },
        { component: 'sound1', angle: 225, distance: 580, size: 'w-12 h-12 sm:w-14 sm:h-14', opacity: 0.4, delay: 2.1, phase: 2, speed: 3.5, orbitRadius: 38, orbitSpeed: 7 },
        { component: 'sound3', angle: 315, distance: 430, size: 'w-14 h-14 sm:w-16 sm:h-16', opacity: 0.6, delay: 3.3, phase: 0, speed: 5.2, orbitRadius: 24, orbitSpeed: 8 },
    ],
};

const FloatingIcon = ({ config }: { config: FloatingIconConfig }) => {
    const { component, angle, distance, size, opacity, delay, phase, speed, orbitRadius, orbitSpeed } = config;
    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad) * distance;
    const y = Math.sin(rad) * distance;

    const wrapperStyle = {
        transform: `translate(${x}px, ${y}px)`,
        opacity,
        animationDelay: `${delay}s`,
    } as React.CSSProperties;

    const iconClass = `${size} animate-[floatNote_${speed}s_ease-in-out_infinite]`;
    const glassClass = 'rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 p-3 shadow-lg shadow-white/5';

    // Generate unique animation delays for orbit and visibility
    const orbitDelay = delay + phase;
    const visibilityDelay = delay + (phase * 1.5);

    return (
        <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={wrapperStyle}
        >
            <div 
                className={glassClass} 
                style={{ 
                    animation: `soundOrbit ${orbitSpeed}s ease-in-out infinite, soundVisibility 8s ease-in-out infinite`,
                    animationDelay: `${orbitDelay}s, ${visibilityDelay}s`,
                }}
            >
                {component === 'sound1' && <Sound1 className={iconClass} />}
                {component === 'sound2' && <Sound2 className={iconClass} />}
                {component === 'sound3' && <Sound3 className={iconClass} />}
                {component === 'sound4' && <Sound4 className={iconClass} />}
            </div>
        </div>
    );
};

export function AuthLayout({ children, title, description, noindex = true }: AuthLayoutProps) {
    const { url } = usePage();
    const path = url.split('?')[0];
    const configPath = path === '/auth/forgot-password'
        ? '/auth/forgot-email'
        : path.startsWith('/auth/reset-password')
            ? '/auth/change-password'
            : path;
    const floatingIcons = AUTH_PAGE_CONFIGS[configPath] || AUTH_PAGE_CONFIGS['/auth/login'];

    return (
        <>
            <Seo
                title={title}
                description={description}
                canonical={url}
                type="website"
                noindex={noindex}
            />
            <div className="relative min-h-screen overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/4 left-1/4 w-150 h-150 bg-primary/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-1/4 right-1/4 w-150 h-150 bg-secondary/5 rounded-full blur-[150px]" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-225 h-225 bg-accent/3 rounded-full blur-[200px]" />
                </div>

                <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="relative flex items-center justify-center">
                        {floatingIcons.map((icon, index) => (
                            <FloatingIcon key={`orbit-${index}`} config={icon} />
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
