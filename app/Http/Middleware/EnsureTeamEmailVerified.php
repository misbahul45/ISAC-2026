<?php

namespace App\Http\Middleware;

use App\Models\Team;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTeamEmailVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $team = $request->user();

        if (! $team instanceof Team || ! $team->isEmailVerified()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email belum diverifikasi.',
                'data' => null,
                'metadata' => (object) [],
                'error' => ['code' => 'EMAIL_VERIFICATION_REQUIRED'],
            ], 403);
        }

        return $next($request);
    }
}
