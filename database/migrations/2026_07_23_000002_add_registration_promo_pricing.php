<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('registrations', function (Blueprint $table): void {
            $table->string('promo_code', 50)->nullable()->after('payment_method');
            $table->decimal('discount_percent', 5, 2)->default(0)->after('promo_code');
            $table->decimal('discount_amount', 15, 2)->default(0)->after('discount_percent');
            $table->dropColumn('transaction_id');
        });
    }

    public function down(): void
    {
        Schema::table('registrations', function (Blueprint $table): void {
            $table->string('transaction_id')->nullable()->after('payment_method');
            $table->dropColumn(['promo_code', 'discount_percent', 'discount_amount']);
        });
    }
};
