<?php

use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Schema;

uses(LazilyRefreshDatabase::class);

test('registration profile schema only keeps fields required by the current forms', function (): void {
    expect(Schema::hasColumns('teams', ['name', 'phone', 'institution_name', 'institution_address']))->toBeTrue()
        ->and(Schema::hasColumn('teams', 'school_name'))->toBeFalse()
        ->and(Schema::hasColumn('teams', 'school_address'))->toBeFalse()
        ->and(Schema::hasColumn('teams', 'school_province'))->toBeFalse()
        ->and(Schema::hasColumn('teams', 'school_city'))->toBeFalse()
        ->and(Schema::hasColumns('members', [
            'name', 'email', 'major', 'faculty', 'student_id', 'photo_file_id',
        ]))->toBeTrue()
        ->and(Schema::hasColumn('members', 'phone'))->toBeFalse()
        ->and(Schema::hasColumn('members', 'education_level'))->toBeFalse()
        ->and(Schema::hasColumn('members', 'birth_date'))->toBeFalse();
});
