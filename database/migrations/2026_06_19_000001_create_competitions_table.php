<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('competitions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->enum('type', ['OLIMPIADE', 'BUSINESS_PLAN', 'BUSINESS_IT_CASE'])->default('OLIMPIADE');
            $table->enum('payment_flow', ['UPFRONT', 'SEMIFINAL'])->default('UPFRONT');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['DRAFT', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'ONGOING', 'COMPLETED'])->default('DRAFT');
            $table->timestamps();
            $table->softDeletes();

            $table->index('status');
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('competitions');
    }
};