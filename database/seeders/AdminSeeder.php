<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::query()->updateOrCreate(['email' => 'admin@isac.com'], [
            'name' => 'Admin ISAC',
            'password' => 'password',
            'role' => 'super_admin',
            'is_active' => true,
        ]);
    }
}
