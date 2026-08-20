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

    public const STATUSES = [self::STATUS_INCOMPLETE, self::STATUS_WAITING_VERIFICATION, self::STATUS_VERIFIED, self::STATUS_REVISION_REQUIRED, self::STATUS_REJECTED];

    protected $fillable = [
        'name', 'code', 'password', 'email', 'phone', 'institution_name', 'institution_address', 'document_url', 'twibbon_url',
        'current_stage_id', 'status', 'email_verified_at', 'verified_at', 'verified_by', 'verification_note',
        'revision_step',
    ];

    protected function casts(): array
    {
        return ['email_verified_at' => 'datetime', 'verified_at' => 'datetime'];
    }

    protected function password(): Attribute
    {
        return Attribute::make(set: fn (string $value) => bcrypt($value));
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
        if ($this->status === self::STATUS_REVISION_REQUIRED && $this->revision_step !== null) {
            return match ($this->revision_step) {
                'TEAM' => '/registration/team',
                'MEMBERS' => '/registration/biodata',
                'DOCUMENTS' => '/registration/documents',
                default => '/registration',
            };
        }
        $registration = $this->relationLoaded('registration') ? $this->registration : $this->registration()->with('competition')->first();
        if ($registration === null) {
            return '/registration';
        }
        if ($registration->team_completed_at === null) {
            return '/registration/team';
        }
        if ($registration->members_completed_at === null) {
            return '/registration/biodata';
        }
        if ($registration->documents_completed_at === null) {
            return '/registration/documents';
        }
        $isStagePaymentCheckpoint = $registration->payment_for_stage_id !== null;
        if (
            ! $isStagePaymentCheckpoint
            && ($registration->status === RegistrationStatus::WAITING_PAYMENT || $registration->status === RegistrationStatus::REVISION_REQUIRED)
        ) {
            return '/registration/payment';
        }

        return '/dashboard';
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
