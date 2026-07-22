<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('files', 'purpose')) {
            Schema::table('files', function (Blueprint $table): void {
                $table->string('purpose', 32)->nullable()->after('url')->index();
            });
        }

        $this->ensureRegistrationWorkflowColumns();

        if (DB::getDriverName() === 'mysql') {
            DB::statement("UPDATE registrations SET status = 'VERIFIED', payment_verified_at = COALESCE(payment_verified_at, created_at) WHERE status = 'NOT_REQUIRED'");
            DB::statement("ALTER TABLE registrations MODIFY status ENUM('WAITING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED', 'REVISION_REQUIRED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'WAITING_PAYMENT'");
        }

        if (! Schema::hasTable('admin_audit_logs')) {
            Schema::create('admin_audit_logs', function (Blueprint $table): void {
                $table->uuid('id')->primary();
                $table->foreignUuid('admin_id')->nullable()->constrained('admins')->nullOnDelete();
                $table->string('action', 100);
                $table->string('subject_type', 100);
                $table->uuid('subject_id');
                $table->json('before_data')->nullable();
                $table->json('after_data')->nullable();
                $table->text('reason')->nullable();
                $table->string('request_id', 100)->nullable();
                $table->timestamp('created_at')->useCurrent();

                $table->index(['subject_type', 'subject_id']);
                $table->index(['admin_id', 'created_at']);
            });
        }
    }

    private function ensureRegistrationWorkflowColumns(): void
    {
        foreach ([
            'verified_by' => 'payment_verified_by',
            'verified_at' => 'payment_verified_at',
            'rejection_reason' => 'payment_rejection_reason',
        ] as $legacyColumn => $currentColumn) {
            if (Schema::hasColumn('registrations', $legacyColumn)
                && ! Schema::hasColumn('registrations', $currentColumn)) {
                Schema::table('registrations', function (Blueprint $table) use ($legacyColumn, $currentColumn): void {
                    $table->renameColumn($legacyColumn, $currentColumn);
                });
            }
        }

        $missingColumns = array_values(array_filter([
            'payment_verified_by',
            'payment_verified_at',
            'payment_rejection_reason',
            'team_completed_at',
            'members_completed_at',
            'documents_completed_at',
            'submitted_at',
            'payment_required_at',
            'payment_submitted_at',
            'payment_for_stage_id',
        ], fn (string $column): bool => ! Schema::hasColumn('registrations', $column)));

        if ($missingColumns === []) {
            return;
        }

        Schema::table('registrations', function (Blueprint $table) use ($missingColumns): void {
            if (in_array('payment_verified_by', $missingColumns, true)) {
                $table->foreignUuid('payment_verified_by')->nullable()->constrained('admins')->nullOnDelete();
            }
            if (in_array('payment_verified_at', $missingColumns, true)) {
                $table->timestamp('payment_verified_at')->nullable();
            }
            if (in_array('payment_rejection_reason', $missingColumns, true)) {
                $table->text('payment_rejection_reason')->nullable();
            }
            if (in_array('team_completed_at', $missingColumns, true)) {
                $table->timestamp('team_completed_at')->nullable();
            }
            if (in_array('members_completed_at', $missingColumns, true)) {
                $table->timestamp('members_completed_at')->nullable();
            }
            if (in_array('documents_completed_at', $missingColumns, true)) {
                $table->timestamp('documents_completed_at')->nullable();
            }
            if (in_array('submitted_at', $missingColumns, true)) {
                $table->timestamp('submitted_at')->nullable();
            }
            if (in_array('payment_required_at', $missingColumns, true)) {
                $table->timestamp('payment_required_at')->nullable();
            }
            if (in_array('payment_submitted_at', $missingColumns, true)) {
                $table->timestamp('payment_submitted_at')->nullable();
            }
            if (in_array('payment_for_stage_id', $missingColumns, true)) {
                $table->foreignUuid('payment_for_stage_id')->nullable()->constrained('stages')->nullOnDelete();
            }
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_audit_logs');
        if (Schema::hasColumn('files', 'purpose')) {
            Schema::table('files', fn (Blueprint $table) => $table->dropColumn('purpose'));
        }
    }
};
