<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Backward-compatible entry point for older local setup commands.
 *
 * Domain demo transactions were intentionally removed: the official seed now
 * contains only Admin identity plus the deterministic ISAC 2026 timeline.
 */
class IsacDomainSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,
            Isac2026TimelineSeeder::class,
        ]);
    }
}
