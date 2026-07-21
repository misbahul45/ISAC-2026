<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('stages', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->string('name');
            $table->enum('type', ['registration', 'submission', 'selection', 'exam', 'interview', 'announcement', 'final'])->default('submission');
            $table->text('description')->nullable();
            $table->integer('order')->default(0);
            $table->dateTime('start_date')->nullable();
            $table->dateTime('end_date')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('criteria')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['competition_id', 'order']);
            $table->index('type');
            $table->index('is_active');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('stages');
    }
};
