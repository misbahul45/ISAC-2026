<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ExamQuestion extends Model
{
    use HasFactory, HasUuids, SoftDeletes;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'exam_id', 'question', 'explanation', 'type', 'options', 'correct_answer', 'order', 'correct_score', 'wrong_score', 'empty_score', 'difficulty', 'category', 'tags', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'options' => 'json',
            'order' => 'integer',
            'correct_score' => 'integer',
            'wrong_score' => 'integer',
            'empty_score' => 'integer',
            'is_active' => 'boolean',
            'tags' => 'json',
        ];
    }

    public function exam(): BelongsTo
    {
        return $this->belongsTo(Exam::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(ExamAnswer::class);
    }
}
