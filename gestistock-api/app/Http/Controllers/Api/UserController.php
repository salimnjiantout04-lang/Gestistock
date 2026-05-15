<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    private function isLastAdmin(User $user): bool
    {
        return $user->role === 'admin' && User::where('role', 'admin')->count() === 1;
    }

    public function index()
    {
        return response()->json(User::orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|string|email|unique:users',
            'password' => 'required|string|min:8',
            'role'     => 'required|in:admin,gestionnaire,lecteur',
        ]);

        $user = User::create([
            'name'     => $request->name,
            'email'    => $request->email,
            'password' => Hash::make($request->password),
            'role'     => $request->role,
        ]);

        return response()->json($user, 201);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name'  => 'required|string|max:255',
            'email' => 'required|string|email|unique:users,email,' . $user->id,
            'role'  => 'required|in:admin,gestionnaire,lecteur',
        ]);

        if ($this->isLastAdmin($user) && $request->role !== 'admin') {
            return response()->json([
                'message' => 'Impossible de retirer le role du dernier administrateur.',
            ], 403);
        }

        $user->update($request->only('name', 'email', 'role'));

        return response()->json($user);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Vous ne pouvez pas vous supprimer vous-même'], 403);
        }

        if ($this->isLastAdmin($user)) {
            return response()->json([
                'message' => 'Impossible de supprimer le dernier administrateur.',
            ], 403);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}
