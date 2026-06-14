import { APP_NAME } from '@/constants/app';
import type { SeoRobots } from '@/types/seo';

const viteSiteUrl = import.meta.env.VITE_APP_URL as string | undefined;
const runtimeSiteUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const DEFAULT_SEO = {
    appName: APP_NAME,
    defaultTitle: APP_NAME,
    titleTemplate: `%s | ${APP_NAME}`,
    defaultDescription:
        'Sistem ISAC 2026 untuk mengelola todo, autentikasi, dan dashboard operasional.',
    defaultImage: '/og-image.png',
    defaultImageAlt: APP_NAME,
    locale: 'id_ID',
    type: 'website',
    twitterCard: 'summary_large_image',
    robots: {
        index: true,
        follow: true,
    } satisfies SeoRobots,
    siteUrl: viteSiteUrl || runtimeSiteUrl,
} as const;
