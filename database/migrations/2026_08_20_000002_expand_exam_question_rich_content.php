<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('exam_questions', function (Blueprint $table): void {
            $table->text('correct_answer')->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('exam_questions', function (Blueprint $table): void {
            $table->string('correct_answer')->nullable()->change();
        });
    }
};
