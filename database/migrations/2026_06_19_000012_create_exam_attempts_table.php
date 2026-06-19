<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_attempts', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignUuid('exam_id')->constrained('exams')->cascadeOnDelete();
            $table->foreignUuid('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->integer('total_score')->default(0);
            $table->integer('max_possible_score')->default(0);
            $table->dateTime('start_time');
            $table->dateTime('end_time')->nullable();
            $table->boolean('finished')->default(false);
            $table->boolean('flagged')->default(false);
            $table->integer('cheat_count')->default(0);
            $table->integer('suspicious_score')->default(0);
            $table->string('device_id')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['team_id', 'exam_id']);
            $table->index('finished');
            $table->index('flagged');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_attempts');
    }
};