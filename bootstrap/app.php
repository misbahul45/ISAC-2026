<?php

use App\Exceptions\InvalidCredentialException;
use App\Exceptions\InvalidResetPasswordException;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            HandleInertiaRequests::class,
        ]);

        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*'),
        );

        $exceptions->render(function (ValidationException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null,
                'metadata' => (object) [],
                'error' => [
                    'code' => 'VALIDATION_ERROR',
                    'fields' => $e->errors(),
                ],
            ], $e->status);
        });

        $exceptions->render(function (InvalidCredentialException $e) {
            return response()->json([
                'status' => 'error',
                'message' => $e->getMessage(),
                'data' => null,
                'metadata' => (object) [],
                'error' => [
                    'code' => 'INVALID_CREDENTIALS',
                ],
            ], $e->status);
        });

        $exceptions->render(function (InvalidResetPasswordException $e) {
            return response()->json([
                'status'   => 'error',
                'message'  => $e->getMessage(),
                'data'     => null,
                'metadata' => (object) [],
                'error'    => [
                    'code' => $e->errorCode,
                ],
            ], $e->status);
        });
    })->create();