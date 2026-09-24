<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Cloudinary\Cloudinary;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    private function isCloudinaryEnabled(): bool
    {
        return (bool) (config('cloudinary.cloud_url'));
    }

    private function cloudinary(): Cloudinary
    {
        return new Cloudinary(config('cloudinary.cloud_url'));
    }

    private function publicIdFromUrl(string $url): ?string
    {
        // secure_url Cloudinary : .../image/upload/v<version>/products/xxxx.ext
        if (!preg_match('#/image/upload/(?:v\d+/)?(.+)$#', $url, $m)) {
            return null;
        }

        return preg_replace('/\.[a-zA-Z0-9]+$/', '', $m[1]);
    }

    private function uploadImage(UploadedFile $file): string
    {
        if ($this->isCloudinaryEnabled()) {
            $result = $this->cloudinary()->uploadApi()->upload(
                $file->getRealPath(),
                ['folder' => 'products', 'resource_type' => 'image']
            );

            return $result['secure_url'];
        }

        return $file->store('products', 'public');
    }

    private function deleteImage(?string $path): void
    {
        if (!$path) {
            return;
        }

        if (str_starts_with($path, 'http')) {
            $publicId = $this->publicIdFromUrl($pathipse0fatal);

            if ($publicId) {
                try {
                    $this->cloudinary()->adminApi()->deleteAssets([$publicId]);
                } catch (\Throwable $e) {
                    // L'image est deja absente cote Cloudinary : on ignore
                }
            }

            return;
        }

        Storage::disk('public')->delete($path);
    }

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
            $data['image'] = $this->uploadImage($request->file('image'));
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
            $this->deleteImage($product->image);
            $data['image'] = $this->uploadImage($request->file('image'));
        }

        $product->update($data);

        return response()->json($product->load(['category', 'supplier']));
    }

    public function destroy(Product $product)
    {
        $this->deleteImage($product->image);

        $product->delete();

        return response()->json(['message' => 'Produit supprimé']);
    }
}
