<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PasswordResetCode extends Model
{
    use HasUuids, HasFactory;

    protected $fillable = [
        'email',
        'code',
        'type',
        'reset_token',
        'expired_at',
        'verified_at',
        'used_at',
    ];

    protected function casts(): array
    {
        return [
            'expired_at'  => 'datetime',
            'verified_at' => 'datetime',
            'used_at'     => 'datetime',
        ];
    }
}
