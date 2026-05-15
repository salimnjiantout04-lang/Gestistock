<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $adminEmail = env('ADMIN_EMAIL');
        $adminPassword = env('ADMIN_PASSWORD');

        if (!$adminEmail || !$adminPassword) {
            $this->command?->warn('Admin non cree : definissez ADMIN_EMAIL et ADMIN_PASSWORD dans .env avant php artisan db:seed.');
            return;
        }

        User::updateOrCreate(
            ['email' => $adminEmail],
            [
                'name'     => env('ADMIN_NAME', 'Administrateur'),
                'password' => Hash::make($adminPassword),
                'role'     => 'admin',
            ]
        );
    }
}
