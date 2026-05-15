<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Http\Request;

class StockMovementController extends Controller
{
    public function index(Request $request)
    {
        $query = StockMovement::with(['product', 'user']);

        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->latest()->paginate(15));
    }

    public function store(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'type'       => 'required|in:entree,sortie',
            'quantity'   => 'required|integer|min:1',
            'reason'     => 'nullable|string|max:255',
            'note'       => 'nullable|string',
        ]);

        $product = Product::findOrFail($request->product_id);

        if ($request->type === 'sortie' && $product->quantity < $request->quantity) {
            return response()->json([
                'message' => 'Stock insuffisant. Quantité disponible : ' . $product->quantity
            ], 422);
        }

        $quantityBefore = $product->quantity;

        if ($request->type === 'entree') {
            $product->increment('quantity', $request->quantity);
        } else {
            $product->decrement('quantity', $request->quantity);
        }

        $movement = StockMovement::create([
            'product_id'      => $product->id,
            'user_id'         => $request->user()->id,
            'type'            => $request->type,
            'quantity'        => $request->quantity,
            'reason'          => $request->reason,
            'note'            => $request->note,
            'quantity_before' => $quantityBefore,
            'quantity_after'  => $product->fresh()->quantity,
        ]);

        return response()->json($movement->load(['product', 'user']), 201);
    }
}