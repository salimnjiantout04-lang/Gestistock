<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Models\TransferItem;
use App\Models\ProductWarehouse;
use App\Models\StockMovement;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $query = Transfer::with(['fromWarehouse', 'toWarehouse', 'user', 'items.product']);

        if ($request->status) {
            $query->where('status', $request->status);
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'from_warehouse_id' => 'required|exists:warehouses,id|different:to_warehouse_id',
            'to_warehouse_id'   => 'required|exists:warehouses,id',
            'notes'             => 'nullable|string',
            'items'             => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity'   => 'required|integer|min:1',
        ]);

        return DB::transaction(function () use ($request) {
            $transfer = Transfer::create([
                'reference'          => Transfer::generateReference(),
                'from_warehouse_id'  => $request->from_warehouse_id,
                'to_warehouse_id'    => $request->to_warehouse_id,
                'user_id'            => $request->user()->id,
                'status'             => 'brouillon',
                'notes'              => $request->notes,
            ]);

            foreach ($request->items as $item) {
                TransferItem::create([
                    'transfer_id' => $transfer->id,
                    'product_id'  => $item['product_id'],
                    'quantity'    => $item['quantity'],
                ]);
            }

            return response()->json(
                $transfer->load(['fromWarehouse', 'toWarehouse', 'user', 'items.product']),
                201
            );
        });
    }

    public function show(Transfer $transfer)
    {
        return response()->json(
            $transfer->load(['fromWarehouse', 'toWarehouse', 'user', 'items.product'])
        );
    }

    public function destroy(Transfer $transfer)
    {
        if ($transfer->status !== 'brouillon') {
            return response()->json(['message' => 'Seuls les transferts au statut brouillon peuvent être supprimés.'], 422);
        }

        $transfer->delete();

        return response()->json(['message' => 'Transfert supprimé']);
    }

    public function validateTransfer(Transfer $transfer)
    {
        if ($transfer->status !== 'brouillon') {
            return response()->json(['message' => 'Ce transfert a déjà été traité.'], 422);
        }

        return DB::transaction(function () use ($transfer) {
            // Vérifier le stock disponible
            foreach ($transfer->items as $item) {
                $stock = ProductWarehouse::where('product_id', $item->product_id)
                    ->where('warehouse_id', $transfer->from_warehouse_id)
                    ->sum('quantity');

                $globalStock = Product::findOrFail($item->product_id)->quantity;

                if ($globalStock < $item->quantity) {
                    $product = $item->product;
                    return response()->json([
                        'message' => "Stock insuffisant pour {$product->name}. Disponible: {$globalStock}, demandé: {$item->quantity}"
                    ], 422);
                }
            }

            $transfer->update([
                'status'       => 'valide',
                'validated_at' => now(),
            ]);

            foreach ($transfer->items as $item) {
                $product = Product::findOrFail($item->product_id);

                // Sortie de l'entrepôt source
                $qtyBefore = $product->quantity;
                $product->decrement('quantity', $item->quantity);

                StockMovement::create([
                    'product_id'      => $item->product_id,
                    'warehouse_id'    => $transfer->from_warehouse_id,
                    'user_id'         => request()->user()->id,
                    'type'            => 'sortie',
                    'quantity'        => $item->quantity,
                    'reason'          => 'Transfert vers ' . $transfer->toWarehouse->name,
                    'note'            => 'Transfert: ' . $transfer->reference,
                    'quantity_before' => $qtyBefore,
                    'quantity_after'  => $product->fresh()->quantity,
                ]);

                // Entrée dans l'entrepôt destination
                $qtyBefore = $product->fresh()->quantity;
                $product->increment('quantity', $item->quantity);

                StockMovement::create([
                    'product_id'      => $item->product_id,
                    'warehouse_id'    => $transfer->to_warehouse_id,
                    'user_id'         => request()->user()->id,
                    'type'            => 'entree',
                    'quantity'        => $item->quantity,
                    'reason'          => 'Transfert depuis ' . $transfer->fromWarehouse->name,
                    'note'            => 'Transfert: ' . $transfer->reference,
                    'quantity_before' => $qtyBefore,
                    'quantity_after'  => $product->fresh()->quantity,
                ]);

                // Mettre à jour le stock par entrepôt
                $fromStock = ProductWarehouse::firstOrCreate(
                    ['product_id' => $item->product_id, 'warehouse_id' => $transfer->from_warehouse_id],
                    ['quantity' => 0]
                );
                $fromStock->decrement('quantity', $item->quantity);

                $toStock = ProductWarehouse::firstOrCreate(
                    ['product_id' => $item->product_id, 'warehouse_id' => $transfer->to_warehouse_id],
                    ['quantity' => 0]
                );
                $toStock->increment('quantity', $item->quantity);
            }

            return response()->json(
                $transfer->load(['fromWarehouse', 'toWarehouse', 'user', 'items.product'])
            );
        });
    }

    public function cancel(Transfer $transfer)
    {
        if (!in_array($transfer->status, ['brouillon'])) {
            return response()->json(['message' => 'Ce transfert ne peut pas être annulé.'], 422);
        }

        $transfer->update(['status' => 'annule']);

        return response()->json($transfer->load(['fromWarehouse', 'toWarehouse', 'user', 'items.product']));
    }
}
