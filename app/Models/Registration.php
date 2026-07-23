<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

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
        'promo_code',
        'discount_percent',
        'discount_amount',
        'paid_at',
        'payment_verified_by',
        'payment_verified_at',
        'payment_rejection_reason',
        'metadata',
        'team_completed_at',
        'members_completed_at',
        'documents_completed_at',
        'submitted_at',
        'payment_required_at',
        'payment_submitted_at',
        'payment_for_stage_id',
    ];

    protected function casts(): array
    {
        return [
            'status' => RegistrationStatus::class,
            'payment_method' => PaymentMethod::class,

            'amount_paid' => 'decimal:2',
            'discount_percent' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'paid_at' => 'datetime',
            'payment_verified_at' => 'datetime',
            'metadata' => 'array',
            'team_completed_at' => 'datetime',
            'members_completed_at' => 'datetime',
            'documents_completed_at' => 'datetime',
            'submitted_at' => 'datetime',
            'payment_required_at' => 'datetime',
            'payment_submitted_at' => 'datetime',
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

    public function paymentVerifiedBy(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'payment_verified_by', 'id');
    }

    public function paymentForStage(): BelongsTo
    {
        return $this->belongsTo(Stage::class, 'payment_for_stage_id');
    }
}
