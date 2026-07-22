<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use App\Models\Team;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUploadPrincipal
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();
        $allowed = ($user instanceof Team && $user->isEmailVerified())
            || ($user instanceof Admin && $user->is_active);

        if (! $allowed) {
            return new JsonResponse([
                'status' => 'error',
                'message' => 'Akses upload ditolak.',
                'data' => null,
                'metadata' => (object) [],
                'error' => ['code' => 'FORBIDDEN', 'details' => (object) []],
            ], 403);
        }

        return $next($request);
    }
}
