<!DOCTYPE html>
<html lang="<?php echo e(str_replace('_', '-', app()->getLocale())); ?>">
<head>
    <?php
        $appName = config('app.name', 'ISAC 2026');
        $appUrl = rtrim(config('app.url', url('/')), '/');
        $defaultDescription = 'Sistem ISAC 2026 untuk mengelola todo, autentikasi, dan dashboard operasional.';
        $defaultImage = $appUrl . '/og-image.png';
    ?>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title inertia><?php echo e($appName); ?></title>
    <meta name="description" content="<?php echo e($defaultDescription); ?>">
    <meta name="theme-color" content="#020617">
    <meta property="og:title" content="<?php echo e($appName); ?>">
    <meta property="og:description" content="<?php echo e($defaultDescription); ?>">
    <meta property="og:type" content="website">
    <meta property="og:url" content="<?php echo e($appUrl); ?>">
    <meta property="og:image" content="<?php echo e($defaultImage); ?>">
    <meta property="og:site_name" content="<?php echo e($appName); ?>">
    <meta property="og:locale" content="id_ID">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="<?php echo e($appName); ?>">
    <meta name="twitter:description" content="<?php echo e($defaultDescription); ?>">
    <meta name="twitter:image" content="<?php echo e($defaultImage); ?>">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <meta name="csrf-token" content="<?php echo e(csrf_token()); ?>">

    <?php echo app('Illuminate\Foundation\Vite')->reactRefresh(); ?>
    <?php echo app('Illuminate\Foundation\Vite')(['resources/css/app.css', 'resources/js/app.tsx']); ?>
    <?php $__inertiaSsrResponse = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->head; } ?>
</head>
<body class="font-sans antialiased bg-slate-50 text-slate-950">
    <?php $__inertiaSsrResponse = app(\Inertia\Ssr\SsrState::class)->setPage($page)->dispatch();  if ($__inertiaSsrResponse) { echo $__inertiaSsrResponse->body; } else { ?><script data-page="app" type="application/json"><?php echo json_encode($page); ?></script><div id="app"></div><?php } ?>
</body>
</html>
<?php /**PATH C:\Dev\ISAC-2026\resources\views/app.blade.php ENDPATH**/ ?>