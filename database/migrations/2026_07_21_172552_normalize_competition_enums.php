<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('competitions', function (Blueprint $table): void {
            $table->string('type', 64)->change();
            $table->string('payment_flow', 64)->change();
            $table->string('status', 64)->change();
        });

        DB::statement('UPDATE competitions SET type = UPPER(type)');
        DB::statement('UPDATE competitions SET payment_flow = UPPER(payment_flow)');
        DB::statement('UPDATE competitions SET status = UPPER(status)');
    }

    public function down(): void
    {
        Schema::table('competitions', function (Blueprint $table): void {
            $table->string('type', 64)->change();
            $table->string('payment_flow', 64)->change();
            $table->string('status', 64)->change();
        });
    }
};
