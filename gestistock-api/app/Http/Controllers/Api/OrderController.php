<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $query = Order::with(['user', 'items.product']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->date_from) {
            $query->whereDate('created_at', '>=', $request->date_from);
        }

        if ($request->date_to) {
            $query->whereDate('created_at', '<=', $request->date_to);
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'nullable|email|max:255',
            'customer_phone'   => 'nullable|string|max:50',
            'customer_address' => 'nullable|string',
            'notes'            => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $order = Order::create([
                'reference'        => Order::generateReference(),
                'customer_name'    => $request->customer_name,
                'customer_email'   => $request->customer_email,
                'customer_phone'   => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'user_id'          => $request->user()->id,
                'status'           => 'brouillon',
                'total'            => $total,
                'notes'            => $request->notes,
            ]);

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json($order->load(['user', 'items.product']), 201);
        });
    }

    public function show(Order $order)
    {
        return response()->json($order->load(['user', 'items.product']));
    }

    public function update(Request $request, Order $order)
    {
        if ($order->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seules les commandes au statut "brouillon" peuvent être modifiées.'
            ], 422);
        }

        $request->validate([
            'customer_name'    => 'required|string|max:255',
            'customer_email'   => 'nullable|email|max:255',
            'customer_phone'   => 'nullable|string|max:50',
            'customer_address' => 'nullable|string',
            'notes'            => 'nullable|string',
            'items'            => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $order) {
            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $order->update([
                'customer_name'    => $request->customer_name,
                'customer_email'   => $request->customer_email,
                'customer_phone'   => $request->customer_phone,
                'customer_address' => $request->customer_address,
                'total'            => $total,
                'notes'            => $request->notes,
            ]);

            $order->items()->delete();

            foreach ($request->items as $item) {
                OrderItem::create([
                    'order_id'   => $order->id,
                    'product_id' => $item['product_id'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                    'subtotal'   => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json($order->load(['user', 'items.product']));
        });
    }

    public function destroy(Order $order)
    {
        if ($order->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seules les commandes au statut "brouillon" peuvent être supprimées.'
            ], 422);
        }

        $order->delete();

        return response()->json(['message' => 'Commande supprimée']);
    }

    public function confirm(Order $order)
    {
        if ($order->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seules les commandes au statut "brouillon" peuvent être confirmées.'
            ], 422);
        }

        $order->update([
            'status'        => 'confirme',
            'confirmed_at'  => now(),
        ]);

        return response()->json($order->load(['user', 'items.product']));
    }

    public function deliver(Order $order)
    {
        if ($order->status !== 'confirme') {
            return response()->json([
                'message' => 'Seules les commandes au statut "confirmé" peuvent être livrées.'
            ], 422);
        }

        return DB::transaction(function () use ($order) {
            // Vérifier le stock pour tous les produits avant de livrer
            foreach ($order->items as $item) {
                $product = Product::findOrFail($item->product_id);
                if ($product->quantity < $item->quantity) {
                    return response()->json([
                        'message' => "Stock insuffisant pour {$product->name}. Disponible: {$product->quantity}, demandé: {$item->quantity}"
                    ], 422);
                }
            }

            $order->update([
                'status'       => 'livre',
                'delivered_at' => now(),
            ]);

            foreach ($order->items as $item) {
                $product = Product::findOrFail($item->product_id);
                $quantityBefore = $product->quantity;
                $product->decrement('quantity', $item->quantity);

                StockMovement::create([
                    'product_id'      => $item->product_id,
                    'user_id'         => request()->user()->id,
                    'type'            => 'sortie',
                    'quantity'        => $item->quantity,
                    'reason'          => 'Vente',
                    'note'            => 'Commande client: ' . $order->reference,
                    'quantity_before' => $quantityBefore,
                    'quantity_after'  => $product->fresh()->quantity,
                ]);
            }

            return response()->json($order->load(['user', 'items.product']));
        });
    }

    public function cancel(Order $order)
    {
        if (!in_array($order->status, ['brouillon', 'confirme'])) {
            return response()->json([
                'message' => 'Seules les commandes aux statuts "brouillon" ou "confirmé" peuvent être annulées.'
            ], 422);
        }

        $order->update(['status' => 'annule']);

        return response()->json($order->load(['user', 'items.product']));
    }
}
