<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $registrations = DB::table('registrations')
            ->join('competitions', 'competitions.id', '=', 'registrations.competition_id')
            ->whereIn('competitions.type', ['BUSINESS_PLAN', 'BUSINESS_IT_CASE'])
            ->select('registrations.id', 'registrations.team_id')
            ->get();

        foreach ($registrations as $registration) {
            $memberCount = DB::table('members')
                ->where('team_id', $registration->team_id)
                ->whereNull('deleted_at')
                ->count();

            if ($memberCount === 3) {
                continue;
            }

            DB::table('registrations')
                ->where('id', $registration->id)
                ->update([
                    'members_completed_at' => null,
                    'documents_completed_at' => null,
                    'submitted_at' => null,
                    'updated_at' => now(),
                ]);
        }
    }

    public function down(): void
    {
        // Completion timestamps cannot be reconstructed safely.
    }
};
