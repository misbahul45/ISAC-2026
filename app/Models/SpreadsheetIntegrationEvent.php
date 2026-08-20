<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SpreadsheetIntegrationEvent extends Model
{
    use HasUuids;

    public const STATUS_PENDING = 'PENDING';
    public const STATUS_PROCESSING = 'PROCESSING';
    public const STATUS_SYNCED = 'SYNCED';
    public const STATUS_FAILED = 'FAILED';
    public const STATUS_SKIPPED = 'SKIPPED';

    protected $fillable = [
        'operation_id', 'operation_item_id', 'team_id', 'event_id', 'action', 'payload', 'status',
        'attempt_count', 'email_status', 'email_sent_at', 'email_last_error', 'last_error', 'synced_at',
    ];

    protected function casts(): array
    {
        return ['payload' => 'array', 'email_sent_at' => 'datetime', 'synced_at' => 'datetime'];
    }

    public function operation(): BelongsTo
    {
        return $this->belongsTo(AdminOperation::class, 'operation_id');
    }

    public function item(): BelongsTo
    {
        return $this->belongsTo(AdminOperationItem::class, 'operation_item_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }
}
