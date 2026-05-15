<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Warehouse;
use Illuminate\Http\Request;

class WarehouseController extends Controller
{
    public function index()
    {
        return response()->json(Warehouse::orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'code'         => 'required|string|max:50|unique:warehouses,code',
            'address'      => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:50',
            'active'       => 'boolean',
        ]);

        $warehouse = Warehouse::create($data);

        return response()->json($warehouse, 201);
    }

    public function update(Request $request, Warehouse $warehouse)
    {
        $data = $request->validate([
            'name'         => 'required|string|max:255',
            'code'         => 'required|string|max:50|unique:warehouses,code,' . $warehouse->id,
            'address'      => 'nullable|string',
            'manager_name' => 'nullable|string|max:255',
            'phone'        => 'nullable|string|max:50',
            'active'       => 'boolean',
        ]);

        $warehouse->update($data);

        return response()->json($warehouse);
    }

    public function destroy(Warehouse $warehouse)
    {
        $warehouse->delete();

        return response()->json(['message' => 'Entrepot supprime']);
    }
}
