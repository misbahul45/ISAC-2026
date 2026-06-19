<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('members', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('team_id')->constrained('teams')->cascadeOnDelete();
            $table->string('name');
            $table->enum('role', ['leader', 'member'])->default('member');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->string('major')->nullable();
            $table->string('faculty')->nullable();
            $table->string('student_id')->nullable();
            $table->date('birth_date')->nullable();
            $table->foreignUuid('photo_file_id')->nullable()->constrained('files')->nullOnDelete();
            $table->timestamps();
            $table->softDeletes();

            $table->index(['team_id', 'role']);
            $table->index('email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('members');
    }
};