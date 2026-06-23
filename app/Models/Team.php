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
    use HasFactory, SoftDeletes, HasApiTokens, HasUuids, Authenticatable;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'name', 'code', 'password', 'email', 'phone', 'school_name', 'school_address', 'document_file_id', 'twibbon_file_id', 'current_stage_id', 'status', 'verified_at', 'verified_by'
    ];

    protected function casts(): array
    {
        return [
            'verified_at' => 'datetime',
        ];
    }

    protected function password(): \Illuminate\Database\Eloquent\Casts\Attribute
    {
        return \Illuminate\Database\Eloquent\Casts\Attribute::make(
            set: fn(string $value) => bcrypt($value),
        );
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
