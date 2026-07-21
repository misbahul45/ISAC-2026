<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('teams', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name')->nullable();
            $table->string('code')->unique();
            $table->string('password');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('school_name')->nullable();
            $table->text('school_address')->nullable();
            $table->text('document_url')->nullable();
            $table->text('twibbon_url')->nullable();
            $table->foreignUuid('current_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->enum('status', [
                'INCOMPLETE',
                'WAITING_VERIFICATION',
                'VERIFIED',
                'REVISION_REQUIRED',
                'REJECTED',
            ])->default('INCOMPLETE');
            $table->timestamp('email_verified_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index('code');
            $table->index('email');
            $table->index('status');
            $table->index('current_stage_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('teams');
    }
};
