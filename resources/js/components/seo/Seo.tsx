import { Head } from '@inertiajs/react';
import { DEFAULT_SEO } from '@/constants/seo';
import {
    buildCanonical,
    buildTitle,
    normalizeRobots,
    resolveSeoImage,
} from '@/lib/seo';
import type { SeoJsonLd, SeoProps } from '@/types/seo';
import { JsonLd } from './JsonLd';

function renderJsonLd(jsonLd?: SeoJsonLd | null) {
    if (!jsonLd) {
        return null;
    }

    if (Array.isArray(jsonLd)) {
        return jsonLd.map((item, index) => <JsonLd key={index} data={item} />);
    }

    return <JsonLd data={jsonLd} />;
}

export function Seo({
    title,
    description,
    canonical,
    image,
    imageAlt,
    type,
    siteName,
    locale,
    robots,
    keywords,
    author,
    publishedTime,
    modifiedTime,
    noindex,
    nofollow,
    jsonLd,
    openGraph,
    twitter,
}: SeoProps) {
    const pageTitle = buildTitle(title);
    const pageDescription = description || DEFAULT_SEO.defaultDescription;
    const canonicalUrl = buildCanonical(canonical || '/');
    const resolvedImage = resolveSeoImage(image || openGraph?.image || twitter?.image);
    const resolvedImageAlt =
        imageAlt || openGraph?.imageAlt || twitter?.imageAlt || DEFAULT_SEO.defaultImageAlt;
    const robotsContent = normalizeRobots({
        ...robots,
        noindex,
        nofollow,
    });
    const keywordsContent = Array.isArray(keywords) ? keywords.join(', ') : keywords;

    const ogTitle = openGraph?.title ? buildTitle(openGraph.title) : pageTitle;
    const ogDescription = openGraph?.description || pageDescription;
    const ogType = openGraph?.type || type || DEFAULT_SEO.type;
    const ogUrl = openGraph?.url ? buildCanonical(openGraph.url) : canonicalUrl;
    const ogImage = resolveSeoImage(openGraph?.image || image);
    const ogImageAlt = openGraph?.imageAlt || resolvedImageAlt;
    const ogSiteName = openGraph?.siteName || siteName || DEFAULT_SEO.appName;
    const ogLocale = openGraph?.locale || locale || DEFAULT_SEO.locale;

    const twitterTitle = twitter?.title ? buildTitle(twitter.title) : pageTitle;
    const twitterDescription = twitter?.description || pageDescription;
    const twitterImage = resolveSeoImage(twitter?.image || image);
    const twitterImageAlt = twitter?.imageAlt || resolvedImageAlt;

    return (
        <Head>
            <title>{pageTitle}</title>
            {pageDescription && <meta name="description" content={pageDescription} />}
            {robotsContent && <meta name="robots" content={robotsContent} />}
            {keywordsContent && <meta name="keywords" content={keywordsContent} />}
            {author && <meta name="author" content={author} />}
            {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

            {ogTitle && <meta property="og:title" content={ogTitle} />}
            {ogDescription && <meta property="og:description" content={ogDescription} />}
            {ogType && <meta property="og:type" content={ogType} />}
            {ogUrl && <meta property="og:url" content={ogUrl} />}
            {ogImage && <meta property="og:image" content={ogImage} />}
            {ogImageAlt && <meta property="og:image:alt" content={ogImageAlt} />}
            {ogSiteName && <meta property="og:site_name" content={ogSiteName} />}
            {ogLocale && <meta property="og:locale" content={ogLocale} />}
            {publishedTime && <meta property="article:published_time" content={publishedTime} />}
            {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}

            <meta name="twitter:card" content={twitter?.card || DEFAULT_SEO.twitterCard} />
            {twitterTitle && <meta name="twitter:title" content={twitterTitle} />}
            {twitterDescription && (
                <meta name="twitter:description" content={twitterDescription} />
            )}
            {twitterImage && <meta name="twitter:image" content={twitterImage} />}
            {twitterImageAlt && <meta name="twitter:image:alt" content={twitterImageAlt} />}
            {twitter?.site && <meta name="twitter:site" content={twitter.site} />}
            {twitter?.creator && <meta name="twitter:creator" content={twitter.creator} />}

            {renderJsonLd(jsonLd)}
        </Head>
    );
}
