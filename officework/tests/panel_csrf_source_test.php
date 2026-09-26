<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

$root = dirname(__DIR__);
$viewFiles = [
    'admin/banner_edit.php',
    'admin/banners.php',
    'admin/brand_edit.php',
    'admin/brands.php',
    'admin/categories.php',
    'admin/category_edit.php',
    'admin/coupons.php',
    'admin/delivery_men.php',
    'admin/login.php',
    'admin/medical-prescription-requests.php',
    'admin/medical-provider-profile.php',
    'admin/medical-services.php',
    'admin/medical_prescriptions.php',
    'admin/order_show.php',
    'admin/payments.php',
    'admin/product_edit.php',
    'admin/products.php',
    'admin/refunds.php',
    'admin/reviews.php',
    'admin/settings.php',
    'admin/subcategories.php',
    'admin/subcategory_edit.php',
    'admin/vendors.php',
    'service_provider/dashboard.php',
    'service_provider/login.php',
    'vendor/dashboard.php',
    'vendor/login.php',
    'vendor/notifications.php',
    'vendor/orders.php',
    'vendor/product_edit.php',
    'vendor/products.php',
    'vendor/reviews.php',
    'vendor/support_show.php',
    'vendor/wallet.php',
];

foreach ($viewFiles as $viewFile) {
    $source = (string) file_get_contents($root . '/resources/views/' . $viewFile);
    preg_match_all('/<form\b[^>]*\bmethod\s*=\s*["\']?post\b.*?<\/form>/is', $source, $forms);
    expect($forms[0] !== [], "$viewFile has no active POST forms to validate.");
    foreach ($forms[0] as $form) {
        expect(str_contains($form, 'name="_csrf_token"'), "$viewFile contains a POST form without an explicit CSRF token.");
    }
}

$routes = (string) file_get_contents($root . '/public/index.php');
$mutationHandler = '/->(?:login|store\w*|update\w*|delete\w*|status|assign\w*|tracking|markRead|reply|requestWithdrawal|withdrawalStatus|profile|archive\w*|paymentStatus|testFirebase)\(/';
$checkedRoutes = 0;
foreach (preg_split('/\R/', $routes) as $line) {
    if (preg_match('/(?:\/admin|\/service-provider|\/vendor)/', $line) !== 1 || preg_match($mutationHandler, $line) !== 1) {
        continue;
    }
    $checkedRoutes++;
    expect(str_contains($line, "\$method === 'POST'"), 'Active panel mutation route is not POST-only: ' . trim($line));
}
expect($checkedRoutes > 0, 'No active panel mutation routes were checked.');

$auth = (string) file_get_contents($root . '/app/Support/Auth.php');
expect(str_contains($auth, "\$method === 'POST' && !self::validCsrf"), 'Global panel POST CSRF enforcement was weakened.');
foreach (['/admin/login', '/vendor/login', '/service-provider/login'] as $loginPath) {
    expect(str_contains($auth, "'$loginPath'"), "$loginPath must retain its authentication/session exception.");
}

echo "panel CSRF source checks passed\n";
