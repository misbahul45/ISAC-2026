<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class File extends Model
{
    use HasFactory, SoftDeletes;

    protected $keyType = 'string';
    public $incrementing = false;

    protected $fillable = [
        'original_name', 'stored_name', 'path', 'disk', 'mime_type', 'size', 'collection', 'metadata'
    ];

    protected function casts(): array
    {
        return [
            'size' => 'integer',
            'metadata' => 'json',
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
}
