<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        $this->simplifyFiles();
        $this->moveTeamDocumentsToUrls();
        $this->separateTeamDataAndEmailVerification();
        $this->makeRegistrationStatusPaymentOnly();
        $this->enforceOneRegistrationPerTeam();
    }

    private function simplifyFiles(): void
    {
        if (! Schema::hasColumn('files', 'file_id')) {
            Schema::table('files', function (Blueprint $table): void {
                $table->string('file_id')->nullable()->after('id');
            });
        }

        if (! Schema::hasColumn('files', 'url')) {
            Schema::table('files', function (Blueprint $table): void {
                $table->text('url')->nullable()->after('file_id');
            });
        }

        if (Schema::hasColumn('files', 'stored_name')) {
            DB::table('files')->whereNull('file_id')->update([
                'file_id' => DB::raw('stored_name'),
            ]);
        }

        if (Schema::hasColumn('files', 'path')) {
            DB::table('files')->whereNull('url')->update([
                'url' => DB::raw('path'),
            ]);
        }

        if (DB::getDriverName() === 'mysql') {
            DB::statement('ALTER TABLE files MODIFY file_id VARCHAR(255) NOT NULL');
            DB::statement('ALTER TABLE files MODIFY url TEXT NOT NULL');
        }

        $legacyColumns = array_values(array_filter([
            'original_name',
            'stored_name',
            'path',
            'disk',
            'mime_type',
            'size',
            'collection',
            'metadata',
            'created_at',
            'updated_at',
            'deleted_at',
        ], fn (string $column): bool => Schema::hasColumn('files', $column)));

        if ($legacyColumns !== []) {
            Schema::table('files', function (Blueprint $table) use ($legacyColumns): void {
                $table->dropColumn($legacyColumns);
            });
        }

        if (! $this->hasIndex('files', ['file_id'], true)) {
            Schema::table('files', function (Blueprint $table): void {
                $table->unique('file_id');
            });
        }
    }

    private function moveTeamDocumentsToUrls(): void
    {
        if (! Schema::hasColumn('teams', 'document_url')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->text('document_url')->nullable()->after('school_address');
            });
        }

        if (! Schema::hasColumn('teams', 'twibbon_url')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->text('twibbon_url')->nullable()->after('document_url');
            });
        }

        if (Schema::hasColumn('teams', 'document_file_id')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->dropForeign(['document_file_id']);
                $table->dropColumn('document_file_id');
            });
        }

        if (Schema::hasColumn('teams', 'twibbon_file_id')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->dropForeign(['twibbon_file_id']);
                $table->dropColumn('twibbon_file_id');
            });
        }
    }

    private function separateTeamDataAndEmailVerification(): void
    {
        if (! Schema::hasColumn('teams', 'email_verified_at')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->timestamp('email_verified_at')->nullable()->after('status');
            });
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE teams MODIFY status VARCHAR(64) NOT NULL DEFAULT 'INCOMPLETE'");

        DB::statement("UPDATE teams
            SET email_verified_at = COALESCE(email_verified_at, verified_at, created_at, CURRENT_TIMESTAMP)
            WHERE UPPER(status) <> 'EMAIL_UNVERIFIED'");

        DB::statement("UPDATE teams SET status = CASE
            WHEN UPPER(status) IN ('VERIFIED', 'COMPLETED') THEN 'VERIFIED'
            WHEN UPPER(status) = 'WAITING_VERIFICATION' THEN 'WAITING_VERIFICATION'
            WHEN UPPER(status) = 'REVISION_REQUIRED' THEN 'REVISION_REQUIRED'
            WHEN UPPER(status) IN ('DISQUALIFIED', 'SUSPENDED', 'REJECTED') THEN 'REJECTED'
            ELSE 'INCOMPLETE'
        END");

        DB::statement("ALTER TABLE teams MODIFY status ENUM(
            'INCOMPLETE', 'WAITING_VERIFICATION', 'VERIFIED', 'REVISION_REQUIRED', 'REJECTED'
        ) NOT NULL DEFAULT 'INCOMPLETE'");
    }

    private function makeRegistrationStatusPaymentOnly(): void
    {
        if (Schema::hasColumn('registrations', 'approved_by') && ! Schema::hasColumn('registrations', 'verified_by')) {
            Schema::table('registrations', function (Blueprint $table): void {
                $table->renameColumn('approved_by', 'verified_by');
            });
        }

        if (Schema::hasColumn('registrations', 'approved_at') && ! Schema::hasColumn('registrations', 'verified_at')) {
            Schema::table('registrations', function (Blueprint $table): void {
                $table->renameColumn('approved_at', 'verified_at');
            });
        }

        foreach (['data_validated_at', 'payment_initiated_at', 'auto_verified_at'] as $column) {
            if (Schema::hasColumn('registrations', $column)) {
                Schema::table('registrations', function (Blueprint $table) use ($column): void {
                    $table->dropColumn($column);
                });
            }
        }

        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        DB::statement("ALTER TABLE registrations MODIFY status VARCHAR(64) NOT NULL DEFAULT 'NOT_REQUIRED'");

        DB::statement("UPDATE registrations SET status = CASE
            WHEN UPPER(status) IN ('PAID', 'WAITING_VERIFICATION') THEN 'WAITING_VERIFICATION'
            WHEN UPPER(status) = 'VERIFIED' THEN 'VERIFIED'
            WHEN UPPER(status) = 'WAITING_PAYMENT' THEN 'WAITING_PAYMENT'
            WHEN UPPER(status) = 'REVISION_REQUIRED' THEN 'REVISION_REQUIRED'
            WHEN UPPER(status) = 'REJECTED' THEN 'REJECTED'
            WHEN UPPER(status) = 'CANCELLED' THEN 'CANCELLED'
            ELSE 'NOT_REQUIRED'
        END");

        DB::statement("ALTER TABLE registrations MODIFY status ENUM(
            'NOT_REQUIRED', 'WAITING_PAYMENT', 'WAITING_VERIFICATION', 'VERIFIED',
            'REVISION_REQUIRED', 'REJECTED', 'CANCELLED'
        ) NOT NULL DEFAULT 'NOT_REQUIRED'");
    }

    private function enforceOneRegistrationPerTeam(): void
    {
        $duplicateTeam = DB::table('registrations')
            ->select('team_id')
            ->groupBy('team_id')
            ->havingRaw('COUNT(*) > 1')
            ->first();

        if ($duplicateTeam !== null) {
            throw new RuntimeException('Cannot enforce one registration per team while duplicate team registrations exist.');
        }

        if (! $this->hasIndex('registrations', ['team_id'], true)) {
            Schema::table('registrations', function (Blueprint $table): void {
                $table->unique('team_id');
            });
        }

        if ($this->hasIndex('registrations', ['team_id', 'batch_id'], true)) {
            Schema::table('registrations', function (Blueprint $table): void {
                $table->dropUnique(['team_id', 'batch_id']);
            });
        }
    }

    /**
     * @param list<string> $columns
     */
    private function hasIndex(string $table, array $columns, bool $unique): bool
    {
        foreach (Schema::getIndexes($table) as $index) {
            if (($index['unique'] ?? false) === $unique && ($index['columns'] ?? []) === $columns) {
                return true;
            }
        }

        return false;
    }

    public function down(): void
    {
        throw new RuntimeException('This data-normalizing migration cannot be safely reversed.');
    }
};
