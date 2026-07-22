<?php

namespace App\Services;

use App\Models\Admin;
use App\Models\Team;
use Illuminate\Support\Facades\Log;

class SecurityAuditService
{
    /** @param array<string, scalar|null> $context */
    public function record(string $event, Team|Admin|null $actor = null, array $context = []): void
    {
        $request = request();
        $ip = $request->ip();

        Log::info('security.audit', array_filter([
            'event' => $event,
            'actor_id' => $actor?->getAuthIdentifier(),
            'account_type' => match (true) {
                $actor instanceof Team => 'TEAM',
                $actor instanceof Admin => 'ADMIN',
                default => null,
            },
            'ip_hash' => $ip === null ? null : substr(hash_hmac('sha256', $ip, (string) config('app.key')), 0, 24),
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 160),
            'request_id' => $request->header('X-Request-ID'),
            ...$context,
        ], static fn (mixed $value): bool => $value !== null && $value !== ''));
    }
}
