<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'supplier']);

        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%')
                  ->orWhere('reference', 'like', '%' . $request->search . '%');
        }

        if ($request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->stock_status) {
            match($request->stock_status) {
                'rupture' => $query->where('quantity', 0),
                'faible'  => $query->where('quantity', '>', 0)->whereColumn('quantity', '<=', 'quantity_min'),
                'normal'  => $query->whereColumn('quantity', '>', 'quantity_min'),
                default   => null,
            };
        }

        return response()->json($query->latest()->paginate(10));
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'reference'    => 'required|string|unique:products',
            'price'        => 'required|numeric|min:0',
            'quantity'     => 'required|integer|min:0',
            'quantity_min' => 'required|integer|min:0',
            'unit'         => 'required|string',
            'category_id'  => 'nullable|exists:categories,id',
            'supplier_id'  => 'nullable|exists:suppliers,id',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product = Product::create($data);

        return response()->json($product->load(['category', 'supplier']), 201);
    }

    public function show(Product $product)
    {
        return response()->json($product->load(['category', 'supplier']));
    }

    public function update(Request $request, Product $product)
    {
        $request->validate([
            'name'         => 'required|string|max:255',
            'reference'    => 'required|string|unique:products,reference,' . $product->id,
            'price'        => 'required|numeric|min:0',
            'quantity'     => 'required|integer|min:0',
            'quantity_min' => 'required|integer|min:0',
            'unit'         => 'required|string',
            'category_id'  => 'nullable|exists:categories,id',
            'supplier_id'  => 'nullable|exists:suppliers,id',
            'description'  => 'nullable|string',
            'image'        => 'nullable|image|max:2048',
        ]);

        $data = $request->except('image');

        if ($request->hasFile('image')) {
            if ($product->image) {
                Storage::disk('public')->delete($product->image);
            }
            $data['image'] = $request->file('image')->store('products', 'public');
        }

        $product->update($data);

        return response()->json($product->load(['category', 'supplier']));
    }

    public function destroy(Product $product)
    {
        if ($product->image) {
            Storage::disk('public')->delete($product->image);
        }

        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }
}
