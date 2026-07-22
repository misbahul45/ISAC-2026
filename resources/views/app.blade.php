<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    @php
        $appName = config('app.name', 'ISAC 2026');
        $appUrl = rtrim(config('app.url', url('/')), '/');
        $defaultDescription = 'Platform resmi pendaftaran kompetisi ISAC 2026 untuk Olimpiade, Business Plan, dan Business IT Case.';
        $defaultImage = $appUrl . '/logo.png';
    @endphp
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia>{{ $appName }}</title>
    <meta name="description" content="{{ $defaultDescription }}">
    <meta name="application-name" content="{{ $appName }}">
    <meta name="author" content="{{ $appName }}">
    <meta name="theme-color" content="#020617">
    <meta property="og:title" content="{{ $appName }}">
    <meta property="og:description" content="{{ $defaultDescription }}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="{{ $appUrl }}">
    <meta property="og:image" content="{{ $defaultImage }}">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="126">
    <meta property="og:image:height" content="45">
    <meta property="og:image:alt" content="Logo ISAC 2026">
    <meta property="og:site_name" content="{{ $appName }}">
    <meta property="og:locale" content="id_ID">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="{{ $appName }}">
    <meta name="twitter:description" content="{{ $defaultDescription }}">
    <meta name="twitter:image" content="{{ $defaultImage }}">
    <meta name="twitter:image:alt" content="Logo ISAC 2026">
    <link rel="icon" type="image/png" href="/logo.png">
    <link rel="apple-touch-icon" href="/logo.png">
    <meta name="csrf-token" content="{{ csrf_token() }}">

    @viteReactRefresh
    @vite(['resources/css/app.css', 'resources/js/app.tsx'])
    @inertiaHead
</head>
<body class="font-sans antialiased bg-background text-foreground">
    @inertia
</body>
</html>
