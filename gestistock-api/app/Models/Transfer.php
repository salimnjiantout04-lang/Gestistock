<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'from_warehouse_id',
        'to_warehouse_id',
        'user_id',
        'status',
        'notes',
        'validated_at',
    ];

    protected $casts = [
        'validated_at' => 'datetime',
    ];

    public function fromWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'from_warehouse_id');
    }

    public function toWarehouse()
    {
        return $this->belongsTo(Warehouse::class, 'to_warehouse_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function items()
    {
        return $this->hasMany(TransferItem::class);
    }

    public static function generateReference(): string
    {
        $year = now()->format('Y');
        $last = self::whereYear('created_at', $year)->count();
        return 'TR-' . $year . '-' . str_pad($last + 1, 4, '0', STR_PAD_LEFT);
    }
}
