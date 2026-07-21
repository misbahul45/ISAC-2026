<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Team $resource
 */
class AuthResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'email' => $this->email,
            'name' => $this->name,
            'status' => strtoupper((string) $this->status),
            'emailVerifiedAt' => $this->email_verified_at?->toISOString(),
            'nextRedirect' => $this->next_redirect,
            'redirectTo' => $this->next_redirect,
            'createdAt' => $this->created_at?->toISOString(),
        ];
    }
}
