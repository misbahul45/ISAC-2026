<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class File extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'id',
        'original_name',
        'stored_name',
        'path',
        'disk',
        'mime_type',
        'size',
        'collection',
        'metadata',
    ];

    protected static function booted(): void
    {
        static::creating(function (File $file) {
            if (! $file->id) {
                $file->id = (string) Str::uuid();
            }

            if (! $file->file_id) {
                $file->file_id = 'FILE-' . strtoupper(Str::random(10));
            }
        });
    }

    public function teamDocuments(): HasMany
    {
        return $this->hasMany(TeamDocument::class, 'file_id');
    }

    public function registrationPaymentProofs(): HasMany
    {
        return $this->hasMany(Registration::class, 'payment_proof_file_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'file_id');
    }

    public function teamTwibbons(): HasMany
    {
        return $this->hasMany(Team::class, 'twibbon_file_id');
    }
}
