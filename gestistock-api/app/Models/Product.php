<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'reference',
        'price',
        'quantity',
        'quantity_min',
        'unit',
        'image',
        'category_id',
        'supplier_id',
    ];

    protected $appends = ['stock_status'];

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function supplier()
    {
        return $this->belongsTo(Supplier::class);
    }

    public function warehouseStocks()
    {
        return $this->hasMany(ProductWarehouse::class);
    }

    public function getStockStatusAttribute()
    {
        if ($this->quantity === 0) return 'rupture';
        if ($this->quantity <= $this->quantity_min) return 'faible';
        return 'normal';
    }
}
