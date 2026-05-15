<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PurchaseOrder extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'supplier_id',
        'user_id',
        'status',
        'total',
        'notes',
        'ordered_at',
        'received_at',
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'ordered_at' => 'datetime',
        'received_at' => 'datetime',
    ];

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public static function generateReference(): string
    {
        $year = now()->format('Y');
        $last = self::whereYear('created_at', $year)->count();
        return 'BC-' . $year . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
