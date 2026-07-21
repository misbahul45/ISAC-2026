<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_event_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('attempt_id')->constrained('exam_attempts')->cascadeOnDelete();
            $table->enum('type', [
                'started',
                'question_viewed',
                'question_answered',
                'question_changed',
                'tab_switched',
                'window_blurred',
                'window_focused',
                'copy_attempted',
                'paste_attempted',
                'right_click_attempted',
                'devtools_opened',
                'screenshot_attempted',
                'fullscreen_exited',
                'time_warning',
                'time_expired',
                'submitted',
                'auto_submitted',
                'disconnected',
                'reconnected',
                'suspicious_activity',
            ]);
            $table->json('metadata')->nullable();
            $table->timestamps();

            $table->index(['attempt_id', 'created_at']);
            $table->index('type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_event_logs');
    }
};
