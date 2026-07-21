<?php

namespace App\Http\Resources;

use App\Models\Team;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Team $resource
 */
class TeamAuthResource extends JsonResource
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
            'phone' => $this->phone,
            'schoolName' => $this->school_name,
            'status' => strtoupper((string) $this->status),
            'emailVerifiedAt' => $this->email_verified_at?->toISOString(),
        ];
    }
}
