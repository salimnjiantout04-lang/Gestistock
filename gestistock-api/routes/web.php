<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'app'    => config('app.name', 'GestiStock'),
        'status' => 'ok',
        'time'   => now()->toIso8601String(),
    ]);
});
