<?php

namespace App\Services;

use Illuminate\Support\Str;

class RichTextSanitizer
{
    public function clean(?string $html): ?string
    {
        if ($html === null) {
            return null;
        }

        $html = trim(strip_tags($html, '<p><br><strong><em><u><s><ul><ol><li><blockquote><code><pre><h2><h3><a><img>'));
        $html = preg_replace_callback('/<(a|img)\\b([^>]*)>/i', function (array $matches): string {
            $tag = strtolower($matches[1]);
            $attributes = $matches[2];

            if ($tag === 'a') {
                preg_match('/href\\s*=\\s*(["\\\'])(.*?)\\1/i', $attributes, $href);

                return isset($href[2]) && $this->isSafeUrl($href[2])
                    ? '<a href="'.e($href[2]).'" rel="noopener noreferrer" target="_blank">'
                    : '<a>';
            }

            preg_match('/src\\s*=\\s*(["\\\'])(.*?)\\1/i', $attributes, $src);
            preg_match('/alt\\s*=\\s*(["\\\'])(.*?)\\1/i', $attributes, $alt);

            if (! isset($src[2]) || ! $this->isImageKitUrl($src[2])) {
                return '';
            }

            return '<img src="'.e($src[2]).'" alt="'.e($alt[2] ?? '').'">';
        }, $html) ?? '';

        return trim($html);
    }

    public function hasContent(?string $html): bool
    {
        return trim(strip_tags((string) $html)) !== '' || Str::contains((string) $html, '<img ');
    }

    private function isSafeUrl(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL)
            && strtolower((string) parse_url($url, PHP_URL_SCHEME)) === 'https';
    }

    private function isImageKitUrl(string $url): bool
    {
        if (! $this->isSafeUrl($url)) {
            return false;
        }

        $host = strtolower((string) parse_url($url, PHP_URL_HOST));
        $configuredHost = strtolower((string) parse_url((string) config('services.imagekit.url_endpoint'), PHP_URL_HOST));

        return $configuredHost !== ''
            ? hash_equals($configuredHost, $host)
            : ($host === 'imagekit.io' || Str::endsWith($host, '.imagekit.io'));
    }
}
