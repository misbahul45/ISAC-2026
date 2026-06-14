import { DEFAULT_SEO } from '@/constants/seo';
import type { SeoJsonLd, SeoRobots } from '@/types/seo';

const absoluteUrlPattern = /^https?:\/\//i;

type JsonLdValue =
    | string
    | number
    | boolean
    | null
    | JsonLdValue[]
    | { [key: string]: JsonLdValue | undefined };

type BreadcrumbItem = {
    name: string;
    path: string;
};

function trimTrailingSlash(value: string): string {
    return value.replace(/\/+$/, '');
}

function getSiteUrl(): string {
    const configuredUrl = DEFAULT_SEO.siteUrl || '';

    if (configuredUrl) {
        return trimTrailingSlash(configuredUrl);
    }

    if (typeof window !== 'undefined' && window.location.origin) {
        return trimTrailingSlash(window.location.origin);
    }

    return '';
}

function stripUndefined<T extends JsonLdValue>(value: T | undefined): T | undefined {
    if (value === undefined) {
        return undefined;
    }

    if (Array.isArray(value)) {
        return value
            .map((item) => stripUndefined(item))
            .filter((item): item is JsonLdValue => item !== undefined) as T;
    }

    if (value && typeof value === 'object') {
        return Object.entries(value).reduce<Record<string, JsonLdValue>>((cleaned, [key, item]) => {
            const cleanedValue = stripUndefined(item);

            if (cleanedValue !== undefined) {
                cleaned[key] = cleanedValue;
            }

            return cleaned;
        }, {}) as T;
    }

    return value;
}

export function buildTitle(title?: string): string {
    const normalizedTitle = title?.trim();

    if (!normalizedTitle) {
        return DEFAULT_SEO.defaultTitle;
    }

    return DEFAULT_SEO.titleTemplate.replace('%s', normalizedTitle);
}

export function buildCanonical(path = '/'): string {
    if (absoluteUrlPattern.test(path)) {
        return path;
    }

    const siteUrl = getSiteUrl();
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    return siteUrl ? `${siteUrl}${normalizedPath}` : normalizedPath;
}

export function normalizeRobots(
    options: SeoRobots & { noindex?: boolean; nofollow?: boolean } = {},
): string {
    const directives: string[] = [];
    const shouldIndex = options.noindex ? false : (options.index ?? DEFAULT_SEO.robots.index);
    const shouldFollow = options.nofollow ? false : (options.follow ?? DEFAULT_SEO.robots.follow);

    directives.push(shouldIndex ? 'index' : 'noindex');
    directives.push(shouldFollow ? 'follow' : 'nofollow');

    if (options.noarchive) {
        directives.push('noarchive');
    }

    if (options.nosnippet) {
        directives.push('nosnippet');
    }

    if (options.noimageindex) {
        directives.push('noimageindex');
    }

    if (typeof options.maxSnippet === 'number') {
        directives.push(`max-snippet:${options.maxSnippet}`);
    }

    if (options.maxImagePreview) {
        directives.push(`max-image-preview:${options.maxImagePreview}`);
    }

    if (typeof options.maxVideoPreview === 'number') {
        directives.push(`max-video-preview:${options.maxVideoPreview}`);
    }

    return directives.join(', ');
}

export function resolveSeoImage(image: string = DEFAULT_SEO.defaultImage): string {
    if (absoluteUrlPattern.test(image)) {
        return image;
    }

    return buildCanonical(image);
}

export function createWebsiteJsonLd(): SeoJsonLd {
    return stripUndefined({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: DEFAULT_SEO.appName,
        url: buildCanonical('/'),
        description: DEFAULT_SEO.defaultDescription,
    }) as SeoJsonLd;
}

export function createWebPageJsonLd(options: {
    title?: string;
    description?: string;
    path?: string;
    image?: string;
} = {}): SeoJsonLd {
    return stripUndefined({
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: options.title || DEFAULT_SEO.defaultTitle,
        description: options.description || DEFAULT_SEO.defaultDescription,
        url: buildCanonical(options.path || '/'),
        image: options.image ? resolveSeoImage(options.image) : undefined,
        isPartOf: {
            '@type': 'WebSite',
            name: DEFAULT_SEO.appName,
            url: buildCanonical('/'),
        },
    }) as SeoJsonLd;
}

export function createBreadcrumbJsonLd(items: BreadcrumbItem[]): SeoJsonLd {
    return stripUndefined({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: buildCanonical(item.path),
        })),
    }) as SeoJsonLd;
}
