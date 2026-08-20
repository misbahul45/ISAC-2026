<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_operations', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('requested_by')->constrained('admins')->cascadeOnDelete();
            $table->foreignUuid('target_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->string('action', 32);
            $table->string('status', 32)->default('PENDING');
            $table->string('idempotency_key', 100)->nullable();
            $table->char('request_hash', 64);
            $table->unsignedInteger('total_items')->default(0);
            $table->unsignedInteger('processed_items')->default(0);
            $table->unsignedInteger('success_count')->default(0);
            $table->unsignedInteger('skipped_count')->default(0);
            $table->unsignedInteger('failed_count')->default(0);
            $table->string('announcement_title', 180)->nullable();
            $table->string('announcement_template', 64)->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('started_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();

            $table->unique(['requested_by', 'idempotency_key']);
            $table->index(['status', 'created_at']);
            $table->index(['action', 'created_at']);
        });

        Schema::create('admin_operation_items', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('operation_id')->constrained('admin_operations')->cascadeOnDelete();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('event_id', 191)->nullable()->unique();
            $table->string('status_before', 191)->nullable();
            $table->string('status_after', 191)->nullable();
            $table->string('processing_status', 32)->default('PENDING');
            $table->string('spreadsheet_status', 32)->default('PENDING');
            $table->text('last_error')->nullable();
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();

            $table->unique(['operation_id', 'team_id']);
            $table->index(['operation_id', 'processing_status']);
            $table->index(['team_id', 'created_at']);
        });

        Schema::create('spreadsheet_integration_events', function (Blueprint $table): void {
            $table->uuid('id')->primary();
            $table->foreignUuid('operation_id')->nullable()->constrained('admin_operations')->nullOnDelete();
            $table->foreignUuid('operation_item_id')->nullable()->constrained('admin_operation_items')->nullOnDelete();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('event_id', 191)->unique();
            $table->string('action', 32);
            $table->json('payload');
            $table->string('status', 32)->default('PENDING');
            $table->unsignedTinyInteger('attempt_count')->default(0);
            $table->string('email_status', 32)->default('NOT_REQUESTED');
            $table->timestamp('email_sent_at')->nullable();
            $table->text('email_last_error')->nullable();
            $table->text('last_error')->nullable();
            $table->timestamp('synced_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'created_at']);
            $table->index(['operation_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('spreadsheet_integration_events');
        Schema::dropIfExists('admin_operation_items');
        Schema::dropIfExists('admin_operations');
    }
};
