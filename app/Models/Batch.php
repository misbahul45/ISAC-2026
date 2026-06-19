<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Batch extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'competition_id', 'name', 'slug', 'description', 'start_date', 'end_date', 'price', 'module_file_id', 'quota', 'current_registrations', 'status'
    ];

    protected function casts(): array
    {
        return [
            'start_date' => 'datetime',
            'end_date' => 'datetime',
            'price' => 'decimal:2',
            'quota' => 'integer',
            'current_registrations' => 'integer',
        ];
    }

    public function competition(): BelongsTo
    {
        return $this->belongsTo(Competition::class);
    }

    public function moduleFile(): BelongsTo
    {
        return $this->belongsTo(File::class, 'module_file_id');
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class);
    }
}