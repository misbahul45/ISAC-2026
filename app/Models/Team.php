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

    /*
    |--------------------------------------------------------------------------
    | Team Status
    |--------------------------------------------------------------------------
    |
    | Status ini mengikuti flow:
    | Register Team
    | -> Verify Email
    | -> Login
    | -> Pilih Competition
    | -> Pilih Batch
    | -> Complete Data Team
    | -> Input Member
    | -> Input Requirement Pendaftaran
    | -> Validasi Sistem
    | -> Jika OLIMPIADE: Pembayaran
    | -> Waiting Verified
    | -> Admin Verification / Auto Verified
    | -> Dashboard Verified
    |
    */

    public const STATUS_EMAIL_UNVERIFIED = 'EMAIL_UNVERIFIED';

    public const STATUS_ACTIVE = 'ACTIVE';

    public const STATUS_COMPETITION_NOT_SELECTED = 'COMPETITION_NOT_SELECTED';

    public const STATUS_BATCH_NOT_SELECTED = 'BATCH_NOT_SELECTED';

    public const STATUS_PROFILE_INCOMPLETE = 'PROFILE_INCOMPLETE';

    public const STATUS_MEMBER_INCOMPLETE = 'MEMBER_INCOMPLETE';

    public const STATUS_REQUIREMENT_INCOMPLETE = 'REQUIREMENT_INCOMPLETE';

    public const STATUS_WAITING_PAYMENT = 'WAITING_PAYMENT';

    public const STATUS_WAITING_VERIFICATION = 'WAITING_VERIFICATION';

    public const STATUS_VERIFIED = 'VERIFIED';

    public const STATUS_REVISION_REQUIRED = 'REVISION_REQUIRED';

    public const STATUS_REJECTED = 'REJECTED';

    public const STATUS_SUSPENDED = 'SUSPENDED';

    public const STATUS_DISQUALIFIED = 'DISQUALIFIED';

    public const STATUSES = [
        self::STATUS_EMAIL_UNVERIFIED,
        self::STATUS_ACTIVE,
        self::STATUS_COMPETITION_NOT_SELECTED,
        self::STATUS_BATCH_NOT_SELECTED,
        self::STATUS_PROFILE_INCOMPLETE,
        self::STATUS_MEMBER_INCOMPLETE,
        self::STATUS_REQUIREMENT_INCOMPLETE,
        self::STATUS_WAITING_PAYMENT,
        self::STATUS_WAITING_VERIFICATION,
        self::STATUS_VERIFIED,
        self::STATUS_REVISION_REQUIRED,
        self::STATUS_REJECTED,
        self::STATUS_SUSPENDED,
        self::STATUS_DISQUALIFIED,
    ];

    protected $fillable = [
        'name',
        'code',
        'password',
        'email',
        'phone',
        'school_name',
        'school_address',
        'document_file_id',
        'twibbon_file_id',
        'current_stage_id',
        'status',
        'verified_at',
        'verified_by',
    ];

    protected function casts(): array
    {
        return [
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
        return $this->status !== self::STATUS_EMAIL_UNVERIFIED;
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
        return in_array($this->status, [
            self::STATUS_SUSPENDED,
            self::STATUS_DISQUALIFIED,
        ], true);
    }

    public function getNextRedirectAttribute(): string
    {
        return match ($this->status) {
            self::STATUS_EMAIL_UNVERIFIED => '/verify-email',
            self::STATUS_ACTIVE,
            self::STATUS_COMPETITION_NOT_SELECTED => '/dashboard/select-competition',
            self::STATUS_BATCH_NOT_SELECTED => '/dashboard/select-batch',
            self::STATUS_PROFILE_INCOMPLETE => '/dashboard/complete-team',
            self::STATUS_MEMBER_INCOMPLETE => '/dashboard/members',
            self::STATUS_REQUIREMENT_INCOMPLETE => '/dashboard/requirements',
            self::STATUS_WAITING_PAYMENT => '/dashboard/payment',
            self::STATUS_WAITING_VERIFICATION => '/dashboard/waiting-verification',
            self::STATUS_REVISION_REQUIRED => '/dashboard/revision',
            self::STATUS_REJECTED => '/dashboard/rejected',
            self::STATUS_VERIFIED => '/dashboard',
            self::STATUS_SUSPENDED => '/suspended',
            self::STATUS_DISQUALIFIED => '/disqualified',
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

    public function documentFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'document_file_id');
    }

    public function twibbonFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'twibbon_file_id');
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
