<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::rename('password_reset_codes', 'auth_challenges');

        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->string('account_type', 16)->nullable()->after('id');
            $table->uuid('account_id')->nullable()->after('account_type');
            $table->string('purpose', 32)->nullable()->after('account_id');
            $table->string('code_hash')->nullable()->after('purpose');
            $table->unsignedTinyInteger('attempt_count')->default(0)->after('code_hash');
            $table->timestamp('sent_at')->nullable()->after('attempt_count');
        });

        DB::table('auth_challenges')
            ->whereNull('account_type')
            ->whereNull('purpose')
            ->update([
                'account_type' => 'TEAM',
                'purpose' => DB::raw("CASE WHEN type = 'verify_email' THEN 'VERIFY_EMAIL' ELSE 'RESET_PASSWORD' END"),
            ]);

        DB::table('auth_challenges')
            ->whereNotNull('code')
            ->whereNull('code_hash')
            ->orderBy('id')
            ->each(function (object $record): void {
                DB::table('auth_challenges')
                    ->where('id', $record->id)
                    ->update(['code_hash' => bcrypt($record->code)]);
            });

        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->string('account_type', 16)->nullable(false)->change();
            $table->uuid('account_id')->nullable(false)->change();
            $table->string('purpose', 32)->nullable(false)->change();
            $table->string('code_hash')->nullable(false)->change();
        });

        if (Schema::hasColumn('auth_challenges', 'email')) {
            Schema::table('auth_challenges', function (Blueprint $table): void {
                $table->dropIndex('password_reset_codes_email_index');
                $table->dropUnique('password_reset_codes_reset_token_unique');
                $table->dropColumn('email');
                $table->dropColumn('code');
                $table->dropColumn('type');
                $table->dropColumn('reset_token');
            });
        }
    }

    public function down(): void
    {
        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->string('email')->nullable()->after('id');
            $table->string('code', 6)->nullable()->after('email');
            $table->string('type', 32)->default('reset_password')->nullable()->after('code');
            $table->string('reset_token')->nullable()->unique()->after('type');
        });

        DB::table('auth_challenges')->orderBy('id')->each(function (object $record): void {
            $email = DB::table('teams')->where('id', $record->account_id)->value('email') ?? '';
            DB::table('auth_challenges')
                ->where('id', $record->id)
                ->update([
                    'email' => $email,
                    'code' => '000000',
                    'type' => $record->purpose === 'VERIFY_EMAIL' ? 'verify_email' : 'reset_password',
                ]);
        });

        Schema::table('auth_challenges', function (Blueprint $table): void {
            $table->dropColumn(['account_type', 'account_id', 'purpose', 'code_hash', 'attempt_count', 'sent_at']);
        });

        Schema::rename('auth_challenges', 'password_reset_codes');
    }
};
