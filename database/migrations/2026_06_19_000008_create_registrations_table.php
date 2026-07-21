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
                'NOT_REQUIRED',
                'WAITING_PAYMENT',
                'WAITING_VERIFICATION',
                'VERIFIED',
                'REVISION_REQUIRED',
                'REJECTED',
                'CANCELLED',
            ])->default('NOT_REQUIRED');
            $table->decimal('amount_paid', 15, 2)->default(0);
            $table->enum('payment_method', ['BANK_TRANSFER', 'QRIS'])->nullable();
            $table->string('transaction_id')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->foreignUuid('verified_by')->nullable()->constrained('admins')->nullOnDelete();
            $table->timestamp('verified_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->json('metadata')->nullable();
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
