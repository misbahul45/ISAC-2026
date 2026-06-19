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
            $table->string('name');
            $table->string('code')->unique();
            $table->string('password');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('school_name')->nullable();
            $table->text('school_address')->nullable();
            $table->foreignUuid('document_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->foreignUuid('twibbon_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->foreignUuid('current_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->enum('status', ['registered', 'verified', 'disqualified', 'completed'])->default('registered');
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