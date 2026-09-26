<?php

declare(strict_types=1);

namespace App\Controllers\Admin;

use App\Support\Auth;
use App\Support\Database;
use App\Support\VendorSchema;
use App\Support\MedicalServiceSchema;
use App\Support\View;

final class DashboardController
{
    public function index(): void
    {
        Auth::requireAdmin();
        $db = Database::connection();
        VendorSchema::ensure();
        MedicalServiceSchema::ensure();
        $count = static function (string $sql) use ($db): int {
            $stmt = $db->prepare($sql);
            $stmt->execute(Auth::zoneParams());
            return (int) $stmt->fetchColumn();
        };

        $stats = [
            'categories' => (int) $db->query("select count(*) from categories where module_key='medical'")->fetchColumn(),
            'products' => $count("select count(*) from products where module_key='medical'" . Auth::zoneWhere('products')),
            'orders' => $count("select count(*) from orders where module_key='medical'" . Auth::zoneWhere('orders')),
            'low_stock' => $count("select count(*) from products where module_key='medical' and stock <= 5" . Auth::zoneWhere('products')),
            'pending_partners' => $count("select count(*) from medical_providers where status='pending'" . Auth::zoneWhere('medical_providers')),
            'doctors' => $count("select count(*) from medical_providers where provider_type='doctor' and status='approved'" . Auth::zoneWhere('medical_providers')),
            'labs' => $count("select count(*) from medical_providers where provider_type='lab' and status='approved'" . Auth::zoneWhere('medical_providers')),
            'pharmacies' => $count("select count(*) from medical_providers where provider_type='pharmacy' and status='approved'" . Auth::zoneWhere('medical_providers')),
        ];

        $orders = $db->prepare("select * from orders where module_key='medical'" . Auth::zoneWhere('orders') . ' order by id desc limit 8');
        $orders->execute(Auth::zoneParams());

        View::render('admin/dashboard', [
            'title' => 'Dashboard',
            'stats' => $stats,
            'orders' => $orders->fetchAll(),
        ]);
    }
}
