<?php

namespace App\Http\Middleware;

use App\Models\Admin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdminPrincipal
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() instanceof Admin || ! $request->user()->is_active) {
            return response()->json([
                'status' => 'error',
                'message' => 'Akses hanya tersedia untuk akun Admin aktif.',
                'data' => null,
                'metadata' => (object) [],
                'error' => ['code' => 'ADMIN_ACCESS_REQUIRED'],
            ], 403);
        }

        return $next($request);
    }
}
