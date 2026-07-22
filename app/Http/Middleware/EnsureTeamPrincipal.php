<?php

namespace App\Http\Middleware;

use App\Models\Team;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamPrincipal
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user() instanceof Team) {
            return $this->forbidden();
        }

        return $next($request);
    }

    private function forbidden(): JsonResponse
    {
        return response()->json([
            'status' => 'error',
            'message' => 'Akses hanya tersedia untuk akun Team.',
            'data' => null,
            'metadata' => (object) [],
            'error' => ['code' => 'TEAM_ACCESS_REQUIRED'],
        ], 403);
    }
}
