<?php

namespace App\Models;

use Illuminate\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Sanctum\HasApiTokens;

class Team extends Model
{
    use Authenticatable, HasApiTokens, HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    public const STATUS_INCOMPLETE = 'INCOMPLETE';

    public const STATUS_WAITING_VERIFICATION = 'WAITING_VERIFICATION';

    public const STATUS_VERIFIED = 'VERIFIED';

    public const STATUS_REVISION_REQUIRED = 'REVISION_REQUIRED';

    public const STATUS_REJECTED = 'REJECTED';

    public const STATUSES = [
        self::STATUS_INCOMPLETE,
        self::STATUS_WAITING_VERIFICATION,
        self::STATUS_VERIFIED,
        self::STATUS_REVISION_REQUIRED,
        self::STATUS_REJECTED,
    ];

    protected $fillable = [
        'name',
        'code',
        'password',
        'email',
        'phone',
        'school_name',
        'school_address',
        'document_url',
        'twibbon_url',
        'current_stage_id',
        'status',
        'email_verified_at',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'verified_at' => 'datetime',
        ];
    }

    protected function password(): Attribute
    {
        return Attribute::make(
            set: fn (string $value) => bcrypt($value),
        );
    }

    public function isEmailVerified(): bool
    {
        return $this->email_verified_at !== null;
    }

    public function isVerified(): bool
    {
        return $this->status === self::STATUS_VERIFIED;
    }

    public function isWaitingVerification(): bool
    {
        return $this->status === self::STATUS_WAITING_VERIFICATION;
    }

    public function isBlocked(): bool
    {
        return $this->status === self::STATUS_REJECTED;
    }

    public function getNextRedirectAttribute(): string
    {
        if (! $this->isEmailVerified()) {
            return '/auth/verify-email';
        }

        return match ($this->status) {
            self::STATUS_INCOMPLETE => '/registration',
            self::STATUS_WAITING_VERIFICATION => '/dashboard/waiting-verification',
            self::STATUS_REVISION_REQUIRED => '/dashboard/revision',
            self::STATUS_REJECTED => '/dashboard/rejected',
            self::STATUS_VERIFIED => '/dashboard',
            default => '/dashboard',
        };
    }

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function registration(): HasOne
    {
        return $this->hasOne(Registration::class);
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class);
    }

    public function examAttempts(): HasMany
    {
        return $this->hasMany(ExamAttempt::class);
    }

    public function currentStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'current_stage_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by');
    }
}
