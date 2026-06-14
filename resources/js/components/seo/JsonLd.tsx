import type { SeoJsonLd } from '@/types/seo';

type JsonLdProps = {
    data?: SeoJsonLd | null;
};

export function JsonLd({ data }: JsonLdProps) {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return null;
    }

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(data).replace(/</g, '\\u003c'),
            }}
        />
    );
}
