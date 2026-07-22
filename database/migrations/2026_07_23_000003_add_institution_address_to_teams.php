<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasColumn('teams', 'institution_address')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->text('institution_address')->nullable()->after('institution_name');
            });
        }
    }

    public function down(): void
    {
        if (Schema::hasColumn('teams', 'institution_address')) {
            Schema::table('teams', function (Blueprint $table): void {
                $table->dropColumn('institution_address');
            });
        }
    }
};
