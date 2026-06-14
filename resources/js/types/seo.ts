export type SeoRobots = {
    index?: boolean;
    follow?: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    maxSnippet?: number;
    maxImagePreview?: 'none' | 'standard' | 'large';
    maxVideoPreview?: number;
};

export type SeoOpenGraph = {
    title?: string;
    description?: string;
    type?: string;
    url?: string;
    image?: string;
    imageAlt?: string;
    siteName?: string;
    locale?: string;
};

export type SeoTwitter = {
    card?: 'summary' | 'summary_large_image' | 'app' | 'player';
    title?: string;
    description?: string;
    image?: string;
    imageAlt?: string;
    site?: string;
    creator?: string;
};

export type SeoJsonLd = Record<string, unknown> | Record<string, unknown>[];

export type SeoProps = {
    title?: string;
    description?: string;
    canonical?: string;
    image?: string;
    imageAlt?: string;
    type?: string;
    siteName?: string;
    locale?: string;
    robots?: SeoRobots;
    keywords?: string | string[];
    author?: string;
    publishedTime?: string;
    modifiedTime?: string;
    noindex?: boolean;
    nofollow?: boolean;
    jsonLd?: SeoJsonLd | null;
    openGraph?: SeoOpenGraph;
    twitter?: SeoTwitter;
};
