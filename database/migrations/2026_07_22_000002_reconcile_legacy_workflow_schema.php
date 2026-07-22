<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->reconcileTeams();
        $this->reconcileMembers();
        $this->reconcileRegistrations();
    }

    private function reconcileTeams(): void
    {
        $missingColumns = array_values(array_filter([
            'school_province',
            'school_city',
            'verification_note',
            'revision_step',
        ], fn (string $column): bool => ! Schema::hasColumn('teams', $column)));

        if ($missingColumns === []) {
            return;
        }

        Schema::table('teams', function (Blueprint $table) use ($missingColumns): void {
            if (in_array('school_province', $missingColumns, true)) {
                $table->string('school_province')->nullable();
            }
            if (in_array('school_city', $missingColumns, true)) {
                $table->string('school_city')->nullable();
            }
            if (in_array('verification_note', $missingColumns, true)) {
                $table->text('verification_note')->nullable();
            }
            if (in_array('revision_step', $missingColumns, true)) {
                $table->string('revision_step')->nullable();
            }
        });
    }

    private function reconcileMembers(): void
    {
        $missingColumns = array_values(array_filter([
            'education_level',
            'sort_order',
        ], fn (string $column): bool => ! Schema::hasColumn('members', $column)));

        if ($missingColumns === []) {
            return;
        }

        Schema::table('members', function (Blueprint $table) use ($missingColumns): void {
            if (in_array('education_level', $missingColumns, true)) {
                $table->string('education_level')->nullable();
            }
            if (in_array('sort_order', $missingColumns, true)) {
                $table->unsignedTinyInteger('sort_order')->nullable();
            }
        });
    }

    private function reconcileRegistrations(): void
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
        throw new RuntimeException('Legacy schema reconciliation cannot be safely reversed.');
    }
};
