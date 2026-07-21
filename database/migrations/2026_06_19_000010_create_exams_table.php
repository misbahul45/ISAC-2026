<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->integer('duration')->default(60);
            $table->integer('passing_score')->nullable();
            $table->enum('type', ['multiple_choice', 'essay', 'mixed'])->default('multiple_choice');
            $table->boolean('shuffle_questions')->default(false);
            $table->boolean('shuffle_options')->default(false);
            $table->boolean('show_result_immediately')->default(true);
            $table->integer('max_attempts')->default(1);
            $table->json('settings')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['stage_id', 'start_date']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exams');
    }
};
