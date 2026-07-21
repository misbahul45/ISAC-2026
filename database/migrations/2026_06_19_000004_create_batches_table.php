<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('competition_id')->constrained('competitions')->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->decimal('price', 15, 2)->default(0);
            $table->foreignUuid('module_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->integer('quota')->nullable();
            $table->integer('current_registrations')->default(0);
            $table->enum('status', ['draft', 'open', 'closed', 'full'])->default('draft');
            $table->timestamps();
            $table->softDeletes();

            $table->index(['competition_id', 'status']);
            $table->index('slug');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batches');
    }
};