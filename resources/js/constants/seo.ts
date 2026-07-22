import { APP_NAME } from '@/constants/app';
import type { SeoRobots } from '@/types/seo';

const viteSiteUrl = import.meta.env.VITE_APP_URL as string | undefined;
const runtimeSiteUrl = typeof window !== 'undefined' ? window.location.origin : '';

export const DEFAULT_SEO = {
    appName: APP_NAME,
    defaultTitle: APP_NAME,
    titleTemplate: `%s | ${APP_NAME}`,
    defaultDescription:
        'Platform resmi pendaftaran kompetisi ISAC 2026 untuk Olimpiade, Business Plan, dan Business IT Case.',
    defaultImage: '/logo.png',
    defaultImageAlt: 'Logo ISAC 2026',
    locale: 'id_ID',
    type: 'website',
    twitterCard: 'summary',
    robots: {
        index: true,
        follow: true,
    } satisfies SeoRobots,
    siteUrl: viteSiteUrl || runtimeSiteUrl,
} as const;
