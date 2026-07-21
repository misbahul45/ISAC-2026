<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('submissions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignUuid('stage_id')->constrained('stages')->cascadeOnDelete();
            $table->string('title');
            $table->text('description')->nullable();
            $table->foreignUuid('file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'revision_requested'])->default('draft');
            $table->foreignUuid('reviewed_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->text('feedback')->nullable();
            $table->integer('score')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->unique(['team_id', 'stage_id']);
            $table->index(['stage_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('submissions');
    }
};
