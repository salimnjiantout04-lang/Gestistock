<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Notifications\PasswordResetCode;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use Laravel\Socialite\Facades\Socialite;

class AuthController extends Controller
{
    public function register(Request $request)
    {
        $request->validate([
            'civility'   => 'required|in:M.,Mme',
            'first_name' => 'required|string|max:100',
            'last_name'  => 'required|string|max:100',
            'email'      => 'required|string|email|unique:users',
            'phone'      => 'nullable|string|max:20',
            'password'   => [
                'required',
                'confirmed',
                Password::min(8)->max(30)->letters()->mixedCase()->numbers(),
            ],
            'accept_terms' => 'required|accepted',
            'newsletter'   => 'boolean',
        ], [
            'email.unique'      => 'Un compte existe déjà avec cette adresse email.',
            'accept_terms.accepted' => 'Vous devez accepter les conditions générales.',
            'password'          => 'Le mot de passe doit contenir entre 8 et 30 caractères, avec au moins une majuscule, une minuscule et un chiffre.',
        ]);

        $firstName = trim($request->first_name);
        $lastName  = trim($request->last_name);

        $user = User::create([
            'civility'   => $request->civility,
            'first_name' => $firstName,
            'last_name'  => $lastName,
            'name'       => trim("{$firstName} {$lastName}"),
            'email'      => $request->email,
            'phone'      => $request->phone,
            'password'   => Hash::make($request->password),
            'role'       => 'lecteur',
        ]);

        $token = $user->createToken('gestistock')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ], 201);
    }

    public function login(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'password' => 'required',
        ]);

        if (!Auth::attempt($request->only('email', 'password'))) {
            throw ValidationException::withMessages([
                'email' => ['Identifiants incorrects.'],
            ]);
        }

        $user  = Auth::user();
        $token = $user->createToken('gestistock')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }

    public function me(Request $request)
    {
        return response()->json($request->user());
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Déconnecté avec succès']);
    }

    public function forgotPassword(Request $request)
    {
        $request->validate(['email' => 'required|email']);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['message' => 'Si ce compte existe, un code vous a été envoyé.']);
        }

        $code = str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT);

        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $request->email],
            ['token' => $code, 'created_at' => now()]
        );

        $user->notify(new PasswordResetCode($code));

        return response()->json(['message' => 'Code de vérification envoyé.']);
    }

    public function verifyResetCode(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'code'  => 'required|string|size:6',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'code' => ['Code invalide.'],
            ]);
        }

        if (now()->diffInMinutes($record->created_at) > 5) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'code' => ['Code expiré. Veuillez demander un nouveau code.'],
            ]);
        }

        return response()->json(['message' => 'Code vérifié avec succès.']);
    }

    public function resetPassword(Request $request)
    {
        $request->validate([
            'email'    => 'required|email',
            'code'     => 'required|string|size:6',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->where('token', $request->code)
            ->first();

        if (!$record) {
            throw ValidationException::withMessages([
                'code' => ['Code invalide.'],
            ]);
        }

        if (now()->diffInMinutes($record->created_at) > 5) {
            DB::table('password_reset_tokens')->where('email', $request->email)->delete();
            throw ValidationException::withMessages([
                'code' => ['Code expiré. Veuillez demander un nouveau code.'],
            ]);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['Utilisateur non trouvé.'],
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($request->password),
        ])->setRememberToken(Str::random(60));
        $user->save();

        DB::table('password_reset_tokens')->where('email', $request->email)->delete();

        return response()->json(['message' => 'Mot de passe réinitialisé avec succès.']);
    }

    private function splitFullName(?string $fullName): array
    {
        $parts = preg_split('/\s+/', trim($fullName ?? ''), 2);

        return [
            'first_name' => $parts[0] ?? 'Utilisateur',
            'last_name'  => $parts[1] ?? '',
        ];
    }

    public function googleRedirect()
    {
        return response()->json([
            'url' => Socialite::driver('google')->stateless()->redirect()->getTargetUrl(),
        ]);
    }

    public function googleCallback(Request $request)
    {
        $frontendUrl = config('app.frontend_url');

        try {
            $googleUser = Socialite::driver('google')->stateless()->user();
        } catch (\Exception $e) {
            Log::warning('Google OAuth callback failed', ['message' => $e->getMessage()]);

            return redirect()->to($frontendUrl . '/auth/google-callback?error=google_auth_failed');
        }

        $user = User::where('google_id', $googleUser->getId())->first()
            ?? User::where('email', $googleUser->getEmail())->first();

        $nameParts = $this->splitFullName($googleUser->getName());

        if (!$user) {
            $user = User::create([
                'civility'          => 'M.',
                'first_name'        => $nameParts['first_name'],
                'last_name'         => $nameParts['last_name'],
                'name'              => trim($googleUser->getName()),
                'email'             => $googleUser->getEmail(),
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'password'          => Hash::make(Str::random(24)),
                'role'              => 'lecteur',
                'email_verified_at' => now(),
            ]);
        } else {
            $user->forceFill([
                'google_id'         => $googleUser->getId(),
                'avatar'            => $googleUser->getAvatar(),
                'email_verified_at' => $user->email_verified_at ?? now(),
                'first_name'        => $user->first_name ?? $nameParts['first_name'],
                'last_name'         => $user->last_name ?? $nameParts['last_name'],
            ])->save();
        }

        $code = Str::random(64);
        Cache::put('google_oauth:' . $code, $user->id, now()->addMinutes(2));

        return redirect()->to($frontendUrl . '/auth/google-callback?code=' . $code);
    }

    public function googleExchange(Request $request)
    {
        $request->validate([
            'code' => 'required|string|size:64',
        ]);

        $userId = Cache::pull('google_oauth:' . $request->code);

        if (!$userId) {
            throw ValidationException::withMessages([
                'code' => ['Code invalide ou expiré. Veuillez réessayer.'],
            ]);
        }

        $user = User::findOrFail($userId);
        $token = $user->createToken('gestistock-google')->plainTextToken;

        return response()->json([
            'user'  => $user,
            'token' => $token,
        ]);
    }
}
