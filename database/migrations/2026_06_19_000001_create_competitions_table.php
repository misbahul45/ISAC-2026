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
            $table->enum('type', ['olympiad', 'business_plan', 'business_it_case'])->default('olympiad');
            $table->enum('payment_flow', ['upfront', 'semifinal'])->default('upfront');
            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['draft', 'registration_open', 'registration_closed', 'ongoing', 'completed'])->default('draft');
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
