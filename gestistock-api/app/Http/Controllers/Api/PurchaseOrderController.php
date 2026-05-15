<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Product;
use App\Models\ProductWarehouse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseOrderController extends Controller
{
    public function index(Request $request)
    {
        $query = PurchaseOrder::with(['supplier', 'user', 'items.product']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        if ($request->status_in) {
            $statuses = explode(',', $request->status_in);
            $query->whereIn('status', $statuses);
        }

        if ($request->supplier_id) {
            $query->where('supplier_id', $request->supplier_id);
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
            'supplier_id' => 'required|exists:suppliers,id',
            'notes'       => 'nullable|string',
            'items'       => 'required|array|min:1',
            'items.*.product_id'  => 'required|exists:products,id',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request) {
            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $order = PurchaseOrder::create([
                'reference'   => PurchaseOrder::generateReference(),
                'supplier_id' => $request->supplier_id,
                'user_id'     => $request->user()->id,
                'status'      => 'brouillon',
                'total'       => $total,
                'notes'       => $request->notes,
            ]);

            foreach ($request->items as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $order->id,
                    'product_id'        => $item['product_id'],
                    'quantity'          => $item['quantity'],
                    'unit_price'        => $item['unit_price'],
                    'subtotal'          => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json(
                $order->load(['supplier', 'user', 'items.product']),
                201
            );
        });
    }

    public function show(PurchaseOrder $purchaseOrder)
    {
        return response()->json(
            $purchaseOrder->load(['supplier', 'user', 'items.product'])
        );
    }

    public function update(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seuls les bons au statut "brouillon" peuvent être modifiés.'
            ], 422);
        }

        $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'notes'       => 'nullable|string',
            'items'       => 'required|array|min:1',
            'items.*.product_id'  => 'required|exists:products,id',
            'items.*.quantity'    => 'required|integer|min:1',
            'items.*.unit_price'  => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($request, $purchaseOrder) {
            $total = collect($request->items)->sum(fn($i) => $i['quantity'] * $i['unit_price']);

            $purchaseOrder->update([
                'supplier_id' => $request->supplier_id,
                'total'       => $total,
                'notes'       => $request->notes,
            ]);

            $purchaseOrder->items()->delete();

            foreach ($request->items as $item) {
                PurchaseOrderItem::create([
                    'purchase_order_id' => $purchaseOrder->id,
                    'product_id'        => $item['product_id'],
                    'quantity'          => $item['quantity'],
                    'unit_price'        => $item['unit_price'],
                    'subtotal'          => $item['quantity'] * $item['unit_price'],
                ]);
            }

            return response()->json(
                $purchaseOrder->load(['supplier', 'user', 'items.product'])
            );
        });
    }

    public function destroy(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seuls les bons au statut "brouillon" peuvent être supprimés.'
            ], 422);
        }

        $purchaseOrder->delete();

        return response()->json(['message' => 'Bon de commande supprimé']);
    }

    public function markOrdered(PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'brouillon') {
            return response()->json([
                'message' => 'Seuls les bons au statut "brouillon" peuvent être commandés.'
            ], 422);
        }

        $purchaseOrder->update([
            'status'     => 'commande',
            'ordered_at' => now(),
        ]);

        return response()->json(
            $purchaseOrder->load(['supplier', 'user', 'items.product'])
        );
    }

    public function markReceived(Request $request, PurchaseOrder $purchaseOrder)
    {
        if ($purchaseOrder->status !== 'commande') {
            return response()->json([
                'message' => 'Seuls les bons au statut "commandé" peuvent être reçus.'
            ], 422);
        }

        $warehouseId = $request->warehouse_id ?? 1;

        return DB::transaction(function () use ($purchaseOrder, $warehouseId) {
            $purchaseOrder->update([
                'status'      => 'recu',
                'received_at' => now(),
            ]);

            foreach ($purchaseOrder->items as $item) {
                $product = Product::findOrFail($item->product_id);
                $quantityBefore = $product->quantity;
                $product->increment('quantity', $item->quantity);

                $item->update([
                    'received_quantity' => $item->quantity,
                ]);

                StockMovement::create([
                    'product_id'      => $item->product_id,
                    'warehouse_id'    => $warehouseId,
                    'user_id'         => request()->user()->id,
                    'type'            => 'entree',
                    'quantity'        => $item->quantity,
                    'reason'          => 'Reception commande',
                    'note'            => 'Bon de commande: ' . $purchaseOrder->reference,
                    'quantity_before' => $quantityBefore,
                    'quantity_after'  => $product->fresh()->quantity,
                ]);

                ProductWarehouse::updateOrCreate(
                    ['product_id' => $item->product_id, 'warehouse_id' => $warehouseId],
                    ['quantity' => \DB::raw('quantity + ' . $item->quantity)]
                );
            }

            return response()->json(
                $purchaseOrder->load(['supplier', 'user', 'items.product'])
            );
        });
    }

    public function cancel(PurchaseOrder $purchaseOrder)
    {
        if (!in_array($purchaseOrder->status, ['brouillon', 'commande'])) {
            return response()->json([
                'message' => 'Seuls les bons aux statuts "brouillon" ou "commandé" peuvent être annulés.'
            ], 422);
        }

        $purchaseOrder->update(['status' => 'annule']);

        return response()->json(
            $purchaseOrder->load(['supplier', 'user', 'items.product'])
        );
    }
}
