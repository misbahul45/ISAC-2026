<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->foreignUuid('question_id')->constrained('exam_questions')->cascadeOnDelete();
            $table->text('answer')->nullable();
            $table->json('selected_options')->nullable();
            $table->boolean('is_correct')->nullable();
            $table->integer('score_obtained')->default(0);
            $table->dateTime('answered_at');
            $table->integer('time_spent')->nullable();
            $table->timestamps();

            $table->unique(['attempt_id', 'question_id']);
            $table->index('question_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_answers');
    }
};
