<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('batches', function (Blueprint $table): void {
            $table->string('status')->default('DRAFT')->change();
        });

        DB::table('batches')->update(['status' => DB::raw('UPPER(status)')]);

        Schema::table('batches', function (Blueprint $table): void {
            $table->dropUnique('batches_slug_unique');
            $table->dropIndex('batches_slug_index');
            $table->unique(['competition_id', 'slug']);
        });
    }

    public function down(): void
    {
        Schema::table('batches', function (Blueprint $table): void {
            $table->dropUnique('batches_competition_id_slug_unique');
            $table->unique('slug');
            $table->index('slug');
        });
    }
};
