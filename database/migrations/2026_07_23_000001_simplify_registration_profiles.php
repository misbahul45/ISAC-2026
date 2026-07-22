<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasColumn('teams', 'school_name') && ! Schema::hasColumn('teams', 'institution_name')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->renameColumn('school_name', 'institution_name');
            });
        }

        if (! Schema::hasColumn('teams', 'institution_name')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->string('institution_name')->nullable()->after('phone');
            });
        }

        $teamColumns = array_values(array_filter(
            ['school_address', 'school_province', 'school_city'],
            fn (string $column): bool => Schema::hasColumn('teams', $column),
        ));

        if ($teamColumns !== []) {
            Schema::table('teams', function (Blueprint $table) use ($teamColumns): void {
                $table->dropColumn($teamColumns);
            });
        }

        $memberColumns = array_values(array_filter(
            ['phone', 'education_level', 'birth_date'],
            fn (string $column): bool => Schema::hasColumn('members', $column),
        ));

        if ($memberColumns !== []) {
            Schema::table('members', function (Blueprint $table) use ($memberColumns): void {
                $table->dropColumn($memberColumns);
            });
        }
    }

    public function down(): void
    {
        Schema::table('members', function (Blueprint $table): void {
            $table->string('phone')->nullable()->after('email');
            $table->string('education_level')->nullable()->after('role');
            $table->date('birth_date')->nullable()->after('student_id');
        });

        Schema::table('teams', function (Blueprint $table): void {
            $table->text('school_address')->nullable()->after('institution_name');
            $table->string('school_province')->nullable()->after('school_address');
            $table->string('school_city')->nullable()->after('school_province');
        });

        if (Schema::hasColumn('teams', 'institution_name') && ! Schema::hasColumn('teams', 'school_name')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->renameColumn('institution_name', 'school_name');
            });
        }
    }
};
