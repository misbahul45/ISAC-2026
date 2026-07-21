<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Competition extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    public const TYPE_OLIMPIADE = 'OLIMPIADE';

    public const TYPE_BUSINESS_PLAN = 'BUSINESS_PLAN';

    public const TYPE_BUSINESS_IT_CASE = 'BUSINESS_IT_CASE';

    public const TYPES = [
        self::TYPE_OLIMPIADE,
        self::TYPE_BUSINESS_PLAN,
        self::TYPE_BUSINESS_IT_CASE,
    ];

    public const PAYMENT_UPFRONT = 'UPFRONT';

    public const PAYMENT_SEMIFINAL = 'SEMIFINAL';

    public const PAYMENTS = [
        self::PAYMENT_UPFRONT,
        self::PAYMENT_SEMIFINAL,
    ];

    public const STATUS_DRAFT = 'DRAFT';

    public const STATUS_REGISTRATION_OPEN = 'REGISTRATION_OPEN';

    public const STATUS_REGISTRATION_CLOSED = 'REGISTRATION_CLOSED';

    public const STATUS_ONGOING = 'ONGOING';

    public const STATUS_COMPLETED = 'COMPLETED';

    public const STATUSES = [
        self::STATUS_DRAFT,
        self::STATUS_REGISTRATION_OPEN,
        self::STATUS_REGISTRATION_CLOSED,
        self::STATUS_ONGOING,
        self::STATUS_COMPLETED,
    ];

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'name', 'slug', 'description', 'type', 'payment_flow', 'start_date', 'end_date', 'status',
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'date',
            'end_date' => 'date',
        ];
    }

    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }

    public function stages(): HasMany
    {
        return $this->hasMany(Stage::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}
