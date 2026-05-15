<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\PurchaseOrder;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function alerts()
    {
        $rupture = Product::where('quantity', 0)->count();
        $faible  = Product::where('quantity', '>', 0)
                    ->whereColumn('quantity', '<=', 'quantity_min')->count();
        $commandesEnAttente = PurchaseOrder::whereIn('status', ['brouillon', 'commande'])->count();

        $produitsRupture = Product::where('quantity', 0)->limit(5)->get(['id', 'name', 'reference', 'quantity']);
        $produitsFaible  = Product::where('quantity', '>', 0)
                            ->whereColumn('quantity', '<=', 'quantity_min')
                            ->limit(5)
                            ->get(['id', 'name', 'reference', 'quantity', 'quantity_min']);

        return response()->json([
            'total'       => $rupture + $faible + $commandesEnAttente,
            'rupture'     => $rupture,
            'faible'      => $faible,
            'commandes'   => $commandesEnAttente,
            'produits_rupture' => $produitsRupture,
            'produits_faible'  => $produitsFaible,
        ]);
    }

    public function stats()
    {
        $totalProduits  = Product::count();
        $valeurStock    = Product::selectRaw('SUM(quantity * price) as total')->value('total') ?? 0;
        $enRupture      = Product::where('quantity', 0)->count();
        $stockFaible    = Product::where('quantity', '>', 0)
                            ->whereColumn('quantity', '<=', 'quantity_min')
                            ->count();

        $commandesAttentes = PurchaseOrder::whereIn('status', ['brouillon', 'commande'])->count();
        $ventesDuMois    = Order::where('status', 'livre')
                            ->whereMonth('created_at', now()->month)
                            ->sum('total');

        $mouvements30j  = StockMovement::where('created_at', '>=', now()->subDays(30))
                            ->selectRaw('DATE(created_at) as date, type, SUM(quantity) as total')
                            ->groupBy('date', 'type')
                            ->orderBy('date')
                            ->get();

        // Top produits les plus vendus (via commandes livrées)
        $topVentes = OrderItem::select(
                'product_id',
                DB::raw('SUM(quantity) as total_qty'),
                DB::raw('SUM(subtotal) as total_ventes')
            )
            ->whereHas('order', fn($q) => $q->where('status', 'livre'))
            ->groupBy('product_id')
            ->orderByDesc('total_qty')
            ->limit(5)
            ->with('product')
            ->get();

        $topProduits = Product::with('category')
                        ->orderByDesc('quantity')
                        ->limit(5)
                        ->get();

        $derniersMouvements = StockMovement::with(['product', 'user'])
                                ->latest()
                                ->limit(5)
                                ->get();

        // Ventes mensuelles (12 derniers mois)
        $ventesMensuelles = Order::where('status', 'livre')
            ->where('created_at', '>=', now()->subMonths(12))
            ->selectRaw("DATE_FORMAT(created_at, '%Y-%m') as mois, COUNT(*) as nb_commandes, SUM(total) as total_ventes")
            ->groupBy('mois')
            ->orderBy('mois')
            ->get();

        // Total commandes par statut
        $achatsParStatut = PurchaseOrder::selectRaw("status, COUNT(*) as total")
            ->groupBy('status')->pluck('total', 'status');

        $ventesParStatut = Order::selectRaw("status, COUNT(*) as total")
            ->groupBy('status')->pluck('total', 'status');

        // Alertes récapitulatives
        $totalAlertes = $enRupture + $stockFaible;

        return response()->json([
            'total_produits'      => $totalProduits,
            'valeur_stock'        => round($valeurStock),
            'en_rupture'          => $enRupture,
            'stock_faible'        => $stockFaible,
            'commandes_attentes'  => $commandesAttentes,
            'ventes_du_mois'      => round($ventesDuMois),
            'total_alertes'       => $totalAlertes,
            'mouvements_30j'      => $mouvements30j,
            'top_produits'        => $topProduits,
            'top_ventes'          => $topVentes,
            'ventes_mensuelles'   => $ventesMensuelles,
            'achats_par_statut'   => $achatsParStatut,
            'ventes_par_statut'   => $ventesParStatut,
            'derniers_mouvements' => $derniersMouvements,
        ]);
    }
}