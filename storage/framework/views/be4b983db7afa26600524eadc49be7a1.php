<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
<head>
    <?php
        $appName = config('app.name', 'ISAC 2026');
        $appUrl = rtrim(config('app.url', url('/')), '/');
        $defaultDescription = 'Platform resmi pendaftaran kompetisi ISAC 2026 untuk Olimpiade, Business Plan, dan Business IT Case.';
        $defaultImage = $appUrl . '/logo.png';
    ?>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia><?php echo e($appName); ?></title>
    <meta name="description" content="<?php echo e($defaultDescription); ?>">
    <meta name="application-name" content="<?php echo e($appName); ?>">
    <meta name="author" content="<?php echo e($appName); ?>">
    <meta name="theme-color" content="#020617">
    <meta property="og:title" content="<?php echo e($appName); ?>">
    <meta property="og:description" content="<?php echo e($defaultDescription); ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo e($appUrl); ?>">
    <meta property="og:image" content="<?php echo e($defaultImage); ?>">
    <meta property="og:image:type" content="image/png">
    <meta property="og:image:width" content="126">
    <meta property="og:image:height" content="45">
    <meta property="og:image:alt" content="Logo ISAC 2026">
    <meta property="og:site_name" content="<?php echo e($appName); ?>">
    <meta property="og:locale" content="id_ID">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="<?php echo e($appName); ?>">
    <meta name="twitter:description" content="<?php echo e($defaultDescription); ?>">
    <meta name="twitter:image" content="<?php echo e($defaultImage); ?>">
    <meta name="twitter:image:alt" content="Logo ISAC 2026">
    <link rel="icon" type="image/png" href="/logo.png">
    <link rel="apple-touch-icon" href="/logo.png">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.tsx']); ?>
    <?php $__inertiaSsrResponse = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
</head>
<body class="font-sans antialiased bg-background text-foreground">
    <?php $__inertiaSsrResponse = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><script data-page="app" type="application/json"><?php echo json_encode($page); ?></script><div id="app"></div><?php } ?>
</body>
</html>
<?php /**PATH /var/www/html/resources/views/app.blade.php ENDPATH**/ ?>