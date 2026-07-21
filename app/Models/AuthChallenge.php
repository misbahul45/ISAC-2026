<?php

namespace App\Models;

use App\Enums\AccountType;
use App\Enums\AuthChallengePurpose;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuthChallenge extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'account_type',
        'account_id',
        'purpose',
        'code_hash',
        'expired_at',
        'verified_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'account_type' => AccountType::class,
            'purpose' => AuthChallengePurpose::class,
            'expired_at' => 'datetime',
            'verified_at' => 'datetime',
            'used_at' => 'datetime',
        ];
    }

    public function isExpired(): bool
    {
        return $this->expired_at->isPast();
    }

    public function isUsed(): bool
    {
        return $this->used_at !== null;
    }

    public function isVerified(): bool
    {
        return $this->verified_at !== null;
    }

    public function markUsed(): void
    {
        $this->update(['used_at' => now()]);
    }
}
