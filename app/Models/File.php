<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

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

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'metadata' => 'array',
        ];
    }
    
    public function getUrlAttribute(): ?string
    {
        if (! $this->disk || ! $this->path) {
            return null;
        }

        /** @var \Illuminate\Filesystem\FilesystemAdapter $disk */
        $disk = Storage::disk($this->disk);

        return $disk->url($this->path);
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

    public function memberPhotos(): HasMany
    {
        return $this->hasMany(Member::class, 'photo_file_id');
    }

    public function registrationPaymentProofs(): HasMany
    {
        return $this->hasMany(Registration::class, 'payment_proof_file_id');
    }

    public function submissions(): HasMany
    {
        return $this->hasMany(Submission::class, 'file_id');
    }
}
