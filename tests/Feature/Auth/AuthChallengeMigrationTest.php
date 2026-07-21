<?php

use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('password_reset_codes table is renamed to auth_challenges with new columns', function (): void {
    expect(Schema::hasTable('auth_challenges'))->toBeTrue();
    expect(Schema::hasTable('password_reset_codes'))->toBeFalse();

    expect(Schema::hasColumn('auth_challenges', 'account_type'))->toBeTrue();
    expect(Schema::hasColumn('auth_challenges', 'account_id'))->toBeTrue();
    expect(Schema::hasColumn('auth_challenges', 'purpose'))->toBeTrue();
    expect(Schema::hasColumn('auth_challenges', 'code_hash'))->toBeTrue();
});

test('auth challenge stores account_type and purpose', function (): void {
    $team = Team::factory()->create();

    $challenge = \App\Models\AuthChallenge::create([
        'account_type' => 'TEAM',
        'account_id' => $team->id,
        'purpose' => 'VERIFY_EMAIL',
        'code_hash' => bcrypt('123456'),
        'expired_at' => now()->addMinutes(5),
    ]);

    expect($challenge->fresh()->account_type->value)->toBe('TEAM');
    expect($challenge->fresh()->purpose->value)->toBe('VERIFY_EMAIL');
});
