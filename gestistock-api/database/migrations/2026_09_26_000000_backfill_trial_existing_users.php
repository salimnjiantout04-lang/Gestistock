<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('users')
            ->whereNull('trial_ends_at')
            ->where('role', '!=', 'admin')
            ->update(['trial_ends_at' => now()->addDays(7)]);
    }

    public function down(): void
    {
        DB::table('users')
            ->where('role', '!=', 'admin')
            ->update(['trial_ends_at' => null]);
    }
};