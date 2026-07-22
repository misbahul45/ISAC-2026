<?php

use Illuminate\Support\Facades\Route;
use Inertia\Testing\AssertableInertia as Assert;

test('legacy login and register pages redirect to canonical auth routes', function (): void {
    $this->get('/login')->assertRedirect('/auth/login');
    $this->get('/register')->assertRedirect('/auth/register');
});

test('web shell exposes ISAC metadata and the official logo', function (): void {
    $this->get('/')
        ->assertOk()
        ->assertSee('Platform resmi pendaftaran kompetisi ISAC 2026', false)
        ->assertSee('property="og:image"', false)
        ->assertSee('/logo.png', false)
        ->assertSee('rel="icon" type="image/png" href="/logo.png"', false)
        ->assertDontSee('todo, autentikasi, dan dashboard operasional', false);
});

test('sitemap contains the public landing page', function (): void {
    $this->get('/sitemap.xml')
        ->assertOk()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8')
        ->assertSee('<loc>'.rtrim(config('app.url'), '/').'/</loc>', false);
});

test('web fallback returns the themed Inertia not found page', function (): void {
    $this->get('/halaman-yang-tidak-ada')
        ->assertNotFound()
        ->assertInertia(fn (Assert $page) => $page
            ->component('Errors/NotFound', false)
            ->where('status', 404)
            ->where('errorPage', true));
});

test('web server errors use the themed error page while api errors stay json', function (): void {
    Route::get('/__test/service-unavailable', fn () => abort(503));

    $this->get('/__test/service-unavailable')
        ->assertStatus(503)
        ->assertInertia(fn (Assert $page) => $page
            ->component('Errors/Error', false)
            ->where('status', 503)
            ->where('errorPage', true));

    $this->getJson('/api/resource-yang-tidak-ada')
        ->assertNotFound()
        ->assertJsonPath('status', 'error')
        ->assertJsonPath('error.code', 'NOT_FOUND');
});
