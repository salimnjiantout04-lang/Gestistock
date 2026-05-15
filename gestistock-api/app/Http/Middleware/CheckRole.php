<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    public function handle(Request $request, Closure $next, string $role): mixed
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Non authentifié'], 401);
        }

        $hierarchy = ['lecteur' => 1, 'gestionnaire' => 2, 'admin' => 3];

        if (($hierarchy[$user->role] ?? 0) < ($hierarchy[$role] ?? 0)) {
            return response()->json(['message' => 'Accès refusé'], 403);
        }

        return $next($request);
    }
}