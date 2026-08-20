<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class AdminOperationItem extends Model
{
    use HasUuids;

    protected $fillable = [
        'operation_id', 'team_id', 'event_id', 'status_before', 'status_after',
        'processing_status', 'spreadsheet_status', 'last_error', 'processed_at',
    ];

    protected function casts(): array
    {
        return ['processed_at' => 'datetime'];
    }

    public function operation(): BelongsTo
    {
        return $this->belongsTo(AdminOperation::class, 'operation_id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function integrationEvent(): HasOne
    {
        return $this->hasOne(SpreadsheetIntegrationEvent::class, 'operation_item_id');
    }
}
