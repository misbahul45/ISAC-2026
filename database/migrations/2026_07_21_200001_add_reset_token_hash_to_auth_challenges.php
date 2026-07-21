<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->string('reset_token_hash', 255)->nullable()->after('code_hash');
        });
    }

    public function down(): void
    {
        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->dropColumn('reset_token_hash');
        });
    }
};
