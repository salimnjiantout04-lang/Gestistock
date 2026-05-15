<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Supplier;
use Illuminate\Http\Request;

class SupplierController extends Controller
{
    public function index()
    {
        return response()->json(
            Supplier::withCount('products')->orderBy('name')->get()
        );
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255|unique:suppliers,name',
            'contact_name' => 'nullable|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'notes'        => 'nullable|string',
            'active'       => 'boolean',
        ]);

        $supplier = Supplier::create($data);

        return response()->json($supplier, 201);
    }

    public function update(Request $request, Supplier $supplier)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255|unique:suppliers,name,' . $supplier->id,
            'contact_name' => 'nullable|string|max:255',
            'email'        => 'nullable|email|max:255',
            'phone'        => 'nullable|string|max:50',
            'address'      => 'nullable|string',
            'notes'        => 'nullable|string',
            'active'       => 'boolean',
        ]);

        $supplier->update($data);

        return response()->json($supplier);
    }

    public function destroy(Supplier $supplier)
    {
        if ($supplier->products()->exists()) {
            return response()->json([
                'message' => 'Impossible de supprimer un fournisseur lie a des produits.',
            ], 422);
        }

        $supplier->delete();

        return response()->json(['message' => 'Fournisseur supprime']);
    }
}
