<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\StockMovementController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\SupplierController;
use App\Http\Controllers\Api\WarehouseController;
use App\Http\Controllers\Api\PurchaseOrderController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\LocationController;
use App\Http\Controllers\Api\TransferController;
use App\Http\Controllers\Api\ProductWarehouseController;

Route::post('/register',       [AuthController::class, 'register']);
Route::post('/login',          [AuthController::class, 'login']);
Route::post('/forgot-password',   [AuthController::class, 'forgotPassword']);
Route::post('/verify-reset-code', [AuthController::class, 'verifyResetCode']);
Route::post('/reset-password',    [AuthController::class, 'resetPassword']);
Route::get('/auth/google',              [AuthController::class, 'googleRedirect']);
Route::get('/auth/google/callback',     [AuthController::class, 'googleCallback']);
Route::post('/auth/google/exchange',    [AuthController::class, 'googleExchange'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/me',      [AuthController::class, 'me']);

    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    Route::get('/dashboard/alerts', [DashboardController::class, 'alerts']);

    // Lecture seule pour tous
    Route::get('/categories',      [CategoryController::class,      'index']);
    Route::get('/suppliers',       [SupplierController::class,      'index']);
    Route::get('/warehouses',      [WarehouseController::class,     'index']);
    Route::get('/products',        [ProductController::class,        'index']);
    Route::get('/products/{product}', [ProductController::class,     'show']);
    Route::get('/stock-movements', [StockMovementController::class,  'index']);

    Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
    Route::get('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'show']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{order}', [OrderController::class, 'show']);
    Route::get('/locations', [LocationController::class, 'index']);
    Route::get('/transfers', [TransferController::class, 'index']);
    Route::get('/transfers/{transfer}', [TransferController::class, 'show']);
    Route::get('/product-warehouse', [ProductWarehouseController::class, 'index']);

    // Gestionnaire et admin
    Route::middleware('role:gestionnaire')->group(function () {
        Route::post('/purchase-orders', [PurchaseOrderController::class, 'store']);
        Route::put('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'update']);
        Route::delete('/purchase-orders/{purchaseOrder}', [PurchaseOrderController::class, 'destroy']);
        Route::post('/purchase-orders/{purchaseOrder}/order', [PurchaseOrderController::class, 'markOrdered']);
        Route::post('/purchase-orders/{purchaseOrder}/receive', [PurchaseOrderController::class, 'markReceived']);
        Route::post('/purchase-orders/{purchaseOrder}/cancel', [PurchaseOrderController::class, 'cancel']);
        Route::post('/categories',             [CategoryController::class,     'store']);
        Route::put('/categories/{category}',   [CategoryController::class,     'update']);
        Route::delete('/categories/{category}',[CategoryController::class,     'destroy']);
        Route::post('/suppliers',              [SupplierController::class,     'store']);
        Route::put('/suppliers/{supplier}',    [SupplierController::class,     'update']);
        Route::delete('/suppliers/{supplier}', [SupplierController::class,     'destroy']);
        Route::post('/warehouses',             [WarehouseController::class,    'store']);
        Route::put('/warehouses/{warehouse}',  [WarehouseController::class,    'update']);
        Route::delete('/warehouses/{warehouse}',[WarehouseController::class,   'destroy']);
        Route::post('/products',               [ProductController::class,      'store']);
        Route::post('/products/{product}',     [ProductController::class,      'update']);
        Route::delete('/products/{product}',   [ProductController::class,      'destroy']);
        Route::post('/stock-movements',        [StockMovementController::class,'store']);
        Route::post('/orders', [OrderController::class, 'store']);
        Route::put('/orders/{order}', [OrderController::class, 'update']);
        Route::delete('/orders/{order}', [OrderController::class, 'destroy']);
        Route::post('/orders/{order}/confirm', [OrderController::class, 'confirm']);
        Route::post('/orders/{order}/deliver', [OrderController::class, 'deliver']);
        Route::post('/orders/{order}/cancel', [OrderController::class, 'cancel']);
        Route::post('/locations', [LocationController::class, 'store']);
        Route::put('/locations/{location}', [LocationController::class, 'update']);
        Route::delete('/locations/{location}', [LocationController::class, 'destroy']);
        Route::post('/transfers', [TransferController::class, 'store']);
        Route::delete('/transfers/{transfer}', [TransferController::class, 'destroy']);
        Route::post('/transfers/{transfer}/validate', [TransferController::class, 'validateTransfer']);
        Route::post('/transfers/{transfer}/cancel', [TransferController::class, 'cancel']);
        Route::post('/product-warehouse', [ProductWarehouseController::class, 'store']);
        Route::delete('/product-warehouse/{id}', [ProductWarehouseController::class, 'destroy']);
    });

    // Admin uniquement
    Route::middleware('role:admin')->group(function () {
        Route::get('/users',             [UserController::class, 'index']);
        Route::post('/users',            [UserController::class, 'store']);
        Route::put('/users/{user}',      [UserController::class, 'update']);
        Route::delete('/users/{user}',   [UserController::class, 'destroy']);
    });
});
