<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        $query = Location::with('warehouse');

        if ($request->warehouse_id) {
            $query->where('warehouse_id', $request->warehouse_id);
        }

        return response()->json($query->orderBy('name')->get());
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'warehouse_id' => 'required|exists:warehouses,id',
            'name'         => 'required|string|max:255',
            'code'         => 'required|string|max:50',
            'description'  => 'nullable|string',
            'active'       => 'boolean',
        ]);

        $exists = Location::where('warehouse_id', $data['warehouse_id'])
            ->where('code', $data['code'])->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce code d\'emplacement existe déjà dans cet entrepôt.'
            ], 422);
        }

        $location = Location::create($data);

        return response()->json($location->load('warehouse'), 201);
    }

    public function update(Request $request, Location $location)
    {
        $data = $request->validate([
            'name'        => 'required|string|max:255',
            'code'        => 'required|string|max:50',
            'description' => 'nullable|string',
            'active'      => 'boolean',
        ]);

        $exists = Location::where('warehouse_id', $location->warehouse_id)
            ->where('code', $data['code'])
            ->where('id', '!=', $location->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Ce code d\'emplacement existe déjà dans cet entrepôt.'
            ], 422);
        }

        $location->update($data);

        return response()->json($location->load('warehouse'));
    }

    public function destroy(Location $location)
    {
        $location->delete();
        return response()->json(['message' => 'Emplacement supprimé']);
    }
}
