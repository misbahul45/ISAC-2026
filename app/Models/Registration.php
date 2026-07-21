<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

enum RegistrationStatus: string
{
    case NOT_REQUIRED = 'NOT_REQUIRED';
    case WAITING_PAYMENT = 'WAITING_PAYMENT';
    case WAITING_VERIFICATION = 'WAITING_VERIFICATION';
    case VERIFIED = 'VERIFIED';
    case REJECTED = 'REJECTED';
    case REVISION_REQUIRED = 'REVISION_REQUIRED';
    case CANCELLED = 'CANCELLED';
}

enum PaymentMethod: string
{
    case BANK_TRANSFER = 'BANK_TRANSFER';
    case QRIS = 'QRIS';
}

class Registration extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $table = 'registrations';

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
        'verified_by',
        'verified_at',
        'rejection_reason',
        'metadata',
    ];

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'payment_method' => PaymentMethod::class,

            'amount_paid' => 'decimal:2',
            'paid_at' => 'datetime',
            'verified_at' => 'datetime',
            'metadata' => 'array',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class, 'competition_id', 'id');
    }

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class, 'batch_id', 'id');
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class, 'team_id', 'id');
    }

    public function paymentProofFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'payment_proof_file_id', 'id');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'verified_by', 'id');
    }
}
