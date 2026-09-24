<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'civility',
        'first_name',
        'last_name',
        'phone',
        'email',
        'password',
        'role',
        'google_id',
        'avatar',
        'email_verified_at',
        'trial_ends_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $appends = [
        'trial_days_left',
        'trial_expired',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'trial_ends_at'     => 'datetime',
        ];
    }

    public function getTrialDaysLeftAttribute(): int
    {
        if (!$this->trial_ends_at) {
            return 0;
        }

        return max(0, (int) now()->diffInDays($this->trial_ends_at, false));
    }

    public function getTrialExpiredAttribute(): bool
    {
        return $this->trial_ends_at !== null && $this->trial_ends_at->isPast();
    }

    public function isAdmin(): bool
    {
        return $this->role === 'admin';
    }

    public function isGestionnaire(): bool
    {
        return in_array($this->role, ['admin', 'gestionnaire']);
    }

    public function sendPasswordResetNotification($code): void
    {
        $this->notify(new \App\Notifications\PasswordResetCode($code));
    }
}
