<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->text('question');
            $table->text('explanation')->nullable();
            $table->enum('type', ['multiple_choice', 'true_false', 'essay'])->default('multiple_choice');
            $table->json('options')->nullable();
            $table->string('correct_answer')->nullable();
            $table->integer('order')->default(0);
            $table->integer('correct_score')->default(10);
            $table->integer('wrong_score')->default(0);
            $table->integer('empty_score')->default(0);
            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->string('category')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();

            $table->index(['exam_id', 'order']);
            $table->index('type');
            $table->index('difficulty');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_questions');
    }
};