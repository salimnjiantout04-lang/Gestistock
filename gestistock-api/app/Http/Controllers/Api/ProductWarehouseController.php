<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ProductWarehouse;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductWarehouseController extends Controller
{
    public function index(Request $request)
    {
        $query = ProductWarehouse::with(['product', 'warehouse', 'location']);

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        if ($request->product_id) {
            $query->where('product_id', $request->product_id);
        }

        return response()->json($query->paginate(20));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'product_id'   => 'required|exists:products,id',
            'warehouse_id' => 'required|exists:warehouses,id',
            'location_id'  => 'nullable|exists:locations,id',
            'quantity'     => 'required|integer|min:0',
        ]);

        $stock = ProductWarehouse::updateOrCreate(
            ['product_id' => $data['product_id'], 'warehouse_id' => $data['warehouse_id'], 'location_id' => $data['location_id'] ?? null],
            $data
        );

        // Recalculer la quantité totale du produit
        $total = ProductWarehouse::where('product_id', $data['product_id'])->sum('quantity');
        Product::where('id', $data['product_id'])->update(['quantity' => $total]);

        return response()->json($stock->load(['product', 'warehouse', 'location']), 201);
    }

    public function destroy($id)
    {
        $stock = ProductWarehouse::findOrFail($id);
        $productId = $stock->product_id;
        $stock->delete();

        $total = ProductWarehouse::where('product_id', $productId)->sum('quantity');
        Product::where('id', $productId)->update(['quantity' => $total]);

        return response()->json(['message' => 'Stock supprimé']);
    }
}
