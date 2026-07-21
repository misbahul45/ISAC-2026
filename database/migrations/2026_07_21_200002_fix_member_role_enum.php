<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('members', function ($table): void {
            $table->string('role', 10)->default('MEMBER')->change();
        });
    }

    public function down(): void
    {
        Schema::table('members', function ($table): void {
            $table->string('role', 10)->default('member')->change();
        });
    }
};
