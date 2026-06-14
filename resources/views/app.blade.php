<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @php
        $appName = config('app.name', 'ISAC 2026');
        $appUrl = rtrim(config('app.url', url('/')), '/');
        $defaultDescription = 'Sistem ISAC 2026 untuk mengelola todo, autentikasi, dan dashboard operasional.';
        $defaultImage = $appUrl . '/og-image.png';
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ $appName }}</title>
    <meta name="description" content="{{ $defaultDescription }}">
    <meta name="theme-color" content="#020617">
    <meta property="og:title" content="{{ $appName }}">
    <meta property="og:description" content="{{ $defaultDescription }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $appUrl }}">
    <meta property="og:image" content="{{ $defaultImage }}">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:locale" content="id_ID">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{{ $appName }}">
    <meta name="twitter:description" content="{{ $defaultDescription }}">
    <meta name="twitter:image" content="{{ $defaultImage }}">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-slate-50 text-slate-950">
    @inertia
</body>
</html>
