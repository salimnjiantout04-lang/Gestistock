<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'customer_name',
        'customer_email',
        'customer_phone',
        'customer_address',
        'user_id',
        'status',
        'total',
        'notes',
        'confirmed_at',
        'delivered_at',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'confirmed_at' => 'datetime',
        'delivered_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(OrderItem::class);
    }

    public static function generateReference(): string
    {
        $year = now()->format('Y');
        $last = self::whereYear('created_at', $year)->count();
        return 'CMD-' . $year . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
