<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Todos/Index', [
        'title' => 'Todo List',
    ]);
})->name('todos.index');

Route::get('/sitemap.xml', function () {
    $appUrl = rtrim(config('app.url'), '/');
    $publicPaths = [];
    $urls = collect($publicPaths)
        ->map(fn (string $path) => sprintf(
            '    <url><loc>%s%s</loc></url>',
            $appUrl,
            str_starts_with($path, '/') ? $path : "/{$path}",
        ))
        ->implode(PHP_EOL);

    $xml = sprintf(
        '<?xml version="1.0" encoding="UTF-8"?>%s<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">%s%s%s</urlset>',
        PHP_EOL,
        $urls ? PHP_EOL : '',
        $urls,
        $urls ? PHP_EOL : '',
    );

    return response($xml, 200)->header('Content-Type', 'application/xml; charset=UTF-8');
})->name('sitemap');

Route::get('/login', function () {
    return Inertia::render('Auth/Login', [
        'title' => 'Login',
    ]);
})->name('login');

Route::get('/register', function () {
    return Inertia::render('Auth/Register', [
        'title' => 'Register',
    ]);
})->name('register');

Route::prefix('auth')->group(function () {
    Route::get('/login', function () {
        return Inertia::render('Auth/Login', [
            'title' => 'Login',
        ]);
    })->name('auth.login');

    Route::get('/register', function () {
        return Inertia::render('Auth/Register', [
            'title' => 'Register',
        ]);
    })->name('auth.register');
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard/Index', [
        'title' => 'Dashboard',
    ]);
})->name('dashboard.index');

Route::get('/todos', function () {
    return Inertia::render('Todos/Index', [
        'title' => 'Todo List',
    ]);
})->name('todos.page');

Route::fallback(function () {
    return Inertia::render('Errors/NotFound')
        ->toResponse(request())
        ->setStatusCode(404);
});
