<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Registration extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'id',
        'competition_id',
        'batch_id',
        'team_id',
        'payment_proof_file_id',
        'status',
        'amount_paid',
        'payment_method',
        'transaction_id',
        'paid_at',
        'data_validated_at',
        'payment_initiated_at',
        'auto_verified_at',
        'verified_by',
        'verified_at',
        'rejection_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'amount_paid' => 'decimal:2',
            'paid_at' => 'datetime',
            'data_validated_at' => 'datetime',
            'payment_initiated_at' => 'datetime',
            'auto_verified_at' => 'datetime',
            'verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function paymentProofFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'payment_proof_file_id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by', 'id');
    }
}
