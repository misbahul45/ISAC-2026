<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'name' => 'Admin ISAC',
            'email' => 'admin@isac.com',
            'password' => 'password',
            'role' => 'super_admin',
        ]);
    }
}
