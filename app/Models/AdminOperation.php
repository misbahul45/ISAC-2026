<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdminOperation extends Model
{
    use HasUuids;

    public const ACTION_VERIFY_TEAM = 'VERIFY_TEAM';
    public const ACTION_VERIFY_PAYMENT = 'VERIFY_PAYMENT';
    public const ACTION_ADVANCE_STAGE = 'ADVANCE_STAGE';
    public const ACTION_ANNOUNCE_RESULT = 'ANNOUNCE_RESULT';

    public const ACTIONS = [
        self::ACTION_VERIFY_TEAM,
        self::ACTION_VERIFY_PAYMENT,
        self::ACTION_ADVANCE_STAGE,
        self::ACTION_ANNOUNCE_RESULT,
    ];

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_PROCESSING = 'PROCESSING';
    public const STATUS_COMPLETED = 'COMPLETED';
    public const STATUS_PARTIAL = 'PARTIAL';
    public const STATUS_FAILED = 'FAILED';

    protected $fillable = [
        'requested_by', 'target_stage_id', 'action', 'status', 'idempotency_key', 'request_hash',
        'total_items', 'processed_items', 'success_count', 'skipped_count', 'failed_count',
        'announcement_title', 'announcement_template', 'metadata', 'started_at', 'completed_at',
    ];

    protected function casts(): array
    {
        return ['metadata' => 'array', 'started_at' => 'datetime', 'completed_at' => 'datetime'];
    }

    public function requestedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'requested_by');
    }

    public function targetStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'target_stage_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(AdminOperationItem::class, 'operation_id');
    }

    public function integrationEvents(): HasMany
    {
        return $this->hasMany(SpreadsheetIntegrationEvent::class, 'operation_id');
    }
}
