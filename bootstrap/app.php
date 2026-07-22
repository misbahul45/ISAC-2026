<?php

use App\Exceptions\EmailDeliveryException;
use App\Exceptions\InvalidCredentialException;
use App\Exceptions\InvalidResetPasswordException;
use App\Http\Middleware\EnsureAdminPrincipal;
use App\Http\Middleware\EnsureTeamEmailVerified;
use App\Http\Middleware\EnsureTeamPrincipal;
use App\Http\Middleware\EnsureUploadPrincipal;
use App\Http\Middleware\HandleInertiaRequests;
use App\Models\Admin;
use App\Models\Team;
use App\Services\SecurityAuditService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Exceptions\ThrottleRequestsException;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php', api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php', health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [HandleInertiaRequests::class]);
        $middleware->alias([
            'principal.admin' => EnsureAdminPrincipal::class,
            'principal.team' => EnsureTeamPrincipal::class,
            'team.verified' => EnsureTeamEmailVerified::class,
            'upload.principal' => EnsureUploadPrincipal::class,
        ]);
        $middleware->trustProxies(at: '*');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(fn (Request $request) => $request->is('api/*'));
        $error = static fn (string $message, string $code, int $status, array $details = [], array $headers = []) => response()->json([
            'status' => 'error', 'message' => $message, 'data' => null, 'metadata' => (object) [],
            'error' => array_filter(['code' => $code, 'details' => $details]),
        ], $status, $headers);
        $audit = static function (string $event): void {
            $actor = request()->user();
            app(SecurityAuditService::class)->record(
                $event,
                $actor instanceof Team || $actor instanceof Admin ? $actor : null,
                ['path' => request()->path()],
            );
        };

        $exceptions->render(fn (ValidationException $exception) => $error($exception->getMessage(), 'VALIDATION_ERROR', $exception->status, $exception->errors()));
        $exceptions->render(fn (EmailDeliveryException $exception) => $error($exception->getMessage(), 'EMAIL_DELIVERY_FAILED', $exception->status));
        $exceptions->render(fn (InvalidCredentialException $exception) => $error($exception->getMessage(), 'INVALID_CREDENTIALS', $exception->status));
        $exceptions->render(fn (InvalidResetPasswordException $exception) => $error($exception->getMessage(), $exception->errorCode, $exception->status));
        $exceptions->render(fn (AuthenticationException $exception) => $error('Authentication required.', 'UNAUTHENTICATED', 401));
        $exceptions->render(function (AuthorizationException $exception) use ($audit, $error) {
            $audit('authorization.denied');

            return $error('Akses ditolak.', 'FORBIDDEN', 403);
        });
        $exceptions->render(function (AccessDeniedHttpException $exception) use ($audit, $error) {
            $audit('authorization.denied');

            return $error('Akses ditolak.', 'FORBIDDEN', 403);
        });
        $exceptions->render(function (NotFoundHttpException $exception, Request $request) use ($error) {
            if ($request->is('api/*')) {
                return $error('Resource not found.', 'NOT_FOUND', 404);
            }

            return null;
        });
        $exceptions->render(function (ThrottleRequestsException $exception) use ($audit, $error) {
            $audit('auth.rate_limited');

            return $error(
                'Terlalu banyak permintaan. Silakan coba lagi nanti.', 'RETRY_LATER', 429, [], $exception->getHeaders(),
            );
        });
        $exceptions->respond(function (Response $response): Response {
            $request = request();
            $status = $response->getStatusCode();

            if (
                $request->is('api/*')
                || (app()->environment('local') && config('app.debug'))
                || ! in_array($status, [403, 404, 419, 429, 500, 503], true)
            ) {
                return $response;
            }

            $component = $status === 404 ? 'Errors/NotFound' : 'Errors/Error';

            return Inertia::render($component, [
                'status' => $status,
                'errorPage' => true,
            ])->toResponse($request)->setStatusCode($status);
        });
    })->create();
