<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('registrations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->foreignUuid('batch_id')->constrained('batches')->cascadeOnDelete();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->foreignUuid('payment_proof_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->enum('status', [
                'WAITING_PAYMENT',
                'WAITING_VERIFICATION',
                'VERIFIED',
                'REVISION_REQUIRED',
                'REJECTED',
                'CANCELLED',
            ])->default('WAITING_PAYMENT');
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->enum('payment_method', ['BANK_TRANSFER', 'QRIS'])->nullable();
            $table->string('transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignUuid('payment_verified_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('payment_verified_at')->nullable();
            $table->text('payment_rejection_reason')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamp('team_completed_at')->nullable();
            $table->timestamp('members_completed_at')->nullable();
            $table->timestamp('documents_completed_at')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('payment_required_at')->nullable();
            $table->timestamp('payment_submitted_at')->nullable();
            $table->foreignUuid('payment_for_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->unique('team_id');
            $table->index(['competition_id', 'status']);
            $table->index(['batch_id', 'status']);
            $table->index('status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('registrations');
    }
};
