// database/migrations/2026_06_24_000001_create_password_reset_codes_table.php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('password_reset_codes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email')->index();
            $table->string('code', 6);
            $table->string('reset_token')->nullable()->unique();
            $table->timestamp('expired_at');
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('used_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('password_reset_codes');
    }
};
