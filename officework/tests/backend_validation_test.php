<?php

declare(strict_types=1);

require __DIR__ . '/bootstrap.php';

use App\Support\Auth;
use App\Support\Database;
use App\Support\MedicalChatAuthorization;

$root = dirname(__DIR__);
$sqliteSchema = (string) file_get_contents($root . '/database/schema_sqlite.sql');
$mysqlSchema = (string) file_get_contents($root . '/database/schema_mysql.sql');
$chatController = (string) file_get_contents($root . '/app/Controllers/Api/MedicalChatController.php');
$chatAuth = (string) file_get_contents($root . '/app/Support/MedicalChatAuthorization.php');

$sqlite = static function (string $database, string $sql = '', string $input = ''): string {
    static $binary;
    $binary ??= trim((string) shell_exec('command -v sqlite3'));
    expect($binary !== '', 'sqlite3 CLI is required for SQLite validation.');

    $command = escapeshellarg($binary) . ' -batch -noheader -separator ' . escapeshellarg("\t") . ' ' . escapeshellarg($database);
    if ($sql !== '') {
        $command .= ' ' . escapeshellarg($sql);
    }
    $pipes = [];
    $process = proc_open($command, [0 => ['pipe', 'r'], 1 => ['pipe', 'w'], 2 => ['pipe', 'w']], $pipes);
    expect(is_resource($process), 'Could not start sqlite3 CLI.');
    fwrite($pipes[0], $input);
    fclose($pipes[0]);
    $output = stream_get_contents($pipes[1]);
    fclose($pipes[1]);
    $error = stream_get_contents($pipes[2]);
    fclose($pipes[2]);
    $status = proc_close($process);
    expect($status === 0, 'sqlite3 failed: ' . trim($error));
    return $output;
};

$database = tempnam(sys_get_temp_dir(), 'aimedix-schema-');
expect($database !== false, 'Could not create a temporary SQLite database.');
try {
    $sqlite($database, '', $sqliteSchema);

$columns = static function (string $table) use ($sqlite, $database): array {
    $output = trim($sqlite($database, "pragma table_info($table);"));
    return $output === '' ? [] : array_map(static fn (string $line): string => explode("\t", $line)[1], explode("\n", $output));
};
$mysqlTable = static function (string $table) use ($mysqlSchema): string {
    preg_match('/create table if not exists ' . preg_quote($table, '/') . '\s*\((.*?)\) engine=/is', $mysqlSchema, $match);
    return $match[1] ?? '';
};
$expected = [
    'delivery_men' => ['password', 'auth_token', 'auth_token_expires_at', 'zone_id', 'availability_status', 'current_latitude', 'current_longitude', 'last_seen_at'],
    'payment_transactions' => ['currency'],
    'medical_payment_transactions' => ['currency', 'gateway_response'],
    'medical_lab_tests' => ['zone_id'],
    'medical_prescriptions' => ['order_id', 'file_path', 'reviewed_at'],
    'schema_migrations' => ['migration', 'applied_at'],
];
foreach ($expected as $table => $required) {
    foreach ($required as $column) {
        expect(in_array($column, $columns($table), true), "$table.$column is missing from the SQLite schema.");
        expect(preg_match('/\b' . preg_quote($column, '/') . '\b/i', $mysqlTable($table)) === 1, "$table.$column is missing from the MySQL schema.");
    }
}
foreach (['payment_method', 'payment_reference', 'payment_note'] as $column) {
    foreach (['medical_lab_bookings', 'medical_consultations'] as $table) {
        expect(in_array($column, $columns($table), true), "$table.$column is missing from the SQLite schema.");
        expect(preg_match('/\b' . preg_quote($column, '/') . '\b/i', $mysqlTable($table)) === 1, "$table.$column is missing from the MySQL schema.");
    }
}
foreach (['medical_conversations', 'medical_conversation_messages'] as $table) {
    expect($columns($table) !== [], "$table is missing from the SQLite schema.");
    expect(str_contains($mysqlSchema, 'create table if not exists ' . $table), "$table is missing from the MySQL schema.");
}

$migrationSource = (string) file_get_contents($root . '/database/migrations/001_phase_0_2_foundation.php');
expect(str_contains($migrationSource, 'if (!$mysql)'), 'Migration 001 must retain its SQLite branch.');
foreach ([
    "'password' => 'text'", "'auth_token' => 'text'", "'auth_token_expires_at' => 'text'",
    "'zone_id' => 'integer'", "'availability_status' => \"text not null default 'offline'\"",
    "'current_latitude' => 'real'", "'current_longitude' => 'real'", "'last_seen_at' => 'text'",
    chr(36) . "column('medical_lab_tests', 'zone_id', 'integer')",
    chr(36) . "column('payment_transactions', 'currency', \"text not null default 'INR'\")",
    chr(36) . "column('medical_payment_transactions', 'gateway_response', 'text')",
] as $migrationClause) {
    expect(str_contains($migrationSource, $migrationClause), "Migration 001 SQLite clause is missing: $migrationClause");
}
expect(str_contains($migrationSource, 'create table if not exists medical_payment_transactions'), 'Migration 001 must create medical payment transactions on SQLite.');
} finally {
    if (is_string($database) && is_file($database)) unlink($database);
}

foreach (['medical-services.php', 'medical-provider-profile.php', 'medical-prescription-requests.php', 'payments.php'] as $view) {
    $source = (string) file_get_contents($root . '/resources/views/admin/' . $view);
    preg_match_all('/<form\b.*?<\/form>/is', $source, $forms);
    expect($forms[0] !== [], "$view has no active forms to validate.");
    foreach ($forms[0] as $form) {
        expect(str_contains($form, 'name="_csrf_token"'), "$view contains a POST form without CSRF.");
    }
}

$routes = (string) file_get_contents($root . '/public/index.php');
foreach ([
    "path === '/admin/medical/providers' && \$method === 'POST'",
    "providers/(\\d+)/update$#', \$path, \$m) === 1 && \$method === 'POST'",
    "providers/(\\d+)/status$#', \$path, \$m) === 1 && \$method === 'POST'",
    "path === '/admin/medical/lab-tests' && \$method === 'POST'",
    "lab-tests/(\\d+)/update$#', \$path, \$m) === 1 && \$method === 'POST'",
    "prescription-requests/(\\d+)/assign$#', \$path, \$m) === 1 && \$method === 'POST'",
    "medical/payments/(lab_booking|consultation)/(\\d+)$#', \$path, \$m) === 1 && \$method === 'POST'",
    "admin/payments/(\\d+)/status$#', \$path, \$m) === 1 && \$method === 'POST'",
] as $route) {
    expect(str_contains($routes, $route), "Expected POST route is missing: $route");
}
foreach ([
    'admin/ecommerce/banners', 'admin/ecommerce/coupons', 'admin/banners',
    'admin/coupons', 'admin/medical/banners', 'admin/medical/coupons',
] as $deleteBase) {
    $fragment = "#^/$deleteBase/(\\d+)/delete$#', \$path, \$m) === 1 && \$method === 'POST'";
    expect(str_contains($routes, $fragment), "Delete route must be POST-only: /$deleteBase/{id}/delete");
}

foreach (['banners.php', 'banner_edit.php', 'coupons.php'] as $view) {
    $source = (string) file_get_contents($root . '/resources/views/admin/' . $view);
    preg_match_all('/<form\b.*?<\/form>/is', $source, $forms);
    foreach ($forms[0] as $form) {
        expect(str_contains($form, 'name="_csrf_token"'), "$view contains a POST form without CSRF.");
    }
}

$_SESSION = ['admin_role' => 'zone_manager', 'admin_zone_id' => 7];
expect(Auth::zoneWhere('orders') === ' and orders.zone_id = :admin_zone_id', 'Zone manager query must be scoped.');
expect(Auth::zoneParams() === ['admin_zone_id' => 7], 'Zone manager query parameters must carry its zone.');

$dashboard = (string) file_get_contents($root . '/app/Controllers/Admin/DashboardController.php');
$medical = (string) file_get_contents($root . '/app/Controllers/Admin/MedicalServicesController.php');
$medicalApi = (string) file_get_contents($root . '/app/Controllers/Api/MedicalServicesController.php');
$ecommerceApi = (string) file_get_contents($root . '/app/Controllers/Api/EcommerceController.php');
$gateway = (string) file_get_contents($root . '/app/Support/PaymentGatewayClient.php');
$adminUsers = (string) file_get_contents($root . '/app/Controllers/Admin/AdminUserController.php');
foreach (['products', 'orders', 'medical_providers'] as $table) {
    expect(str_contains($dashboard, "Auth::zoneWhere('$table')"), "Dashboard does not scope $table.");
}
foreach (['medical_lab_bookings', 'medical_consultations', 'medical_prescription_requests', 'vendors'] as $table) {
    expect(str_contains($medical, $table), "Medical controller no longer reads $table.");
}
expect(substr_count($medical, "Auth::zoneWhere('vendors')") >= 5, 'Pharmacy vendor reads and writes are not consistently scoped.');
expect(str_contains($medicalApi, 'b.zone_id=:zone and (b.provider_id is null or b.provider_id=:id)'), 'Unassigned lab tasks must be scoped to the provider zone.');
expect(str_contains($medicalApi, 'id=:id and zone_id=:zone and (provider_id=:provider or provider_id is null)'), 'Lab report claim/completion must be scoped to the provider zone.');
expect(str_contains($medicalApi, "join zones z on z.id=p.zone_id and z.status=1"), 'Provider authentication must require an active valid zone.');
expect(substr_count($medicalApi, "'currency'=>Settings::moduleGet('medical','currency','INR')") === 2, 'Lab and consultation payments must persist the configured medical currency.');
expect(str_contains($medicalApi, 'medical_payment_transactions.currency'), 'Medical booking API responses must expose the persisted transaction currency.');
expect(str_contains($medicalApi, "join zones z on z.id=t.zone_id and z.status=1"), 'Medical catalog must require an active lab zone.');
expect(str_contains($medicalApi, "join zones z on z.id=p.zone_id and z.status=1"), 'Medical catalog must require an active doctor zone.');
expect(str_contains($chatAuth, 'customerEntity') && str_contains($chatAuth, 'providerEntity'), 'Medical chat authorization must derive both participants from the entity.');
expect(str_contains($chatAuth, "'prescription_request'") && str_contains($chatAuth, 'r.pharmacy_id'), 'Prescription request chat must derive the assigned pharmacy provider.');
expect(str_contains($chatController, 'MedicalChatAuthorization::customerEntity($actorId, $type, $entityId)'), 'Customer chat creation must authorize the requested entity from stored ownership.');
expect(!str_contains($chatController, "['customer_id'] ??") && !str_contains($chatController, "['provider_id'] ??"), 'Medical chat must not trust client participant IDs.');
expect(str_contains($chatController, 'poll_interval_seconds') && str_contains($chatController, 'MAX_TEXT'), 'Medical chat must publish polling and text bounds.');
expect(str_contains($routes, '/api/v1/medical/chat') && str_contains($routes, '/api/v1/providers/medical-chat'), 'Dedicated medical chat routes are required.');
expect(str_contains($medicalApi, "status='approved'") && str_contains($ecommerceApi, 'provider_visibility = 1'), 'Medical public catalog must enforce approved providers and visible products.');
expect(substr_count($ecommerceApi, '$this->catalogWhere()') === 5, 'Every standard and ranked product query must use the canonical catalog predicate.');
foreach ([
    "products.provider_visibility = 1",
    "vendors.module_key = 'medical'",
    "vendors.status = 'approved'",
    'coalesce(vendors.is_temporarily_closed, 0) = 0',
    "mp.provider_type = 'pharmacy'",
    "mp.status = 'approved'",
    'active_product_zone.status = 1',
] as $catalogPredicate) {
    expect(str_contains($ecommerceApi, $catalogPredicate), "Medical catalog predicate is missing: $catalogPredicate");
}
expect(substr_count($ecommerceApi, 'coalesce(sum(case when orders.id is not null then order_items.quantity else 0 end), 0) as sold_quantity') === 2, 'Best-selling queries must exclude quantities from cancelled orders.');
expect(substr_count($ecommerceApi, 'having sold_quantity > 0') === 2, 'Best-selling queries must retain the existing exclusion of zero-sale products.');
expect(str_contains((string) file_get_contents($root . '/app/Controllers/Api/WorkerController.php'), 'Invalid booking transition from'), 'Service booking worker transitions must be state validated.');
expect(str_contains((string) file_get_contents($root . '/app/Controllers/Api/WorkerController.php'), "Order is not an accepted assignment"), 'Worker location must validate an optional assigned order.');
expect(str_contains($medical, "'currency'=>(string)\$current['currency']"), 'Medical refunds must reconcile with the persisted transaction currency.');
expect(str_contains($gateway, "\$refund['currency'] ?? \$subject['currency']"), 'Gateway refund payloads must carry transaction currency.');
expect(!str_contains($adminUsers, 'Auth::zoneWhere'), 'Global admin-user management must remain unscoped.');

putenv('DB_CONNECTION=sqlite');
$chatDatabase = tempnam(sys_get_temp_dir(), 'aimedix-chat-');
expect($chatDatabase !== false, 'Could not create chat authorization database.');
putenv('DB_DATABASE=' . $chatDatabase);
try {
    $chatDb = Database::connection();
    $chatDb->exec('create table medical_prescription_requests (id integer primary key, pharmacy_id integer, customer_id integer)');
    $chatDb->exec("create table medical_providers (id integer primary key, provider_type text, status text)");
    $chatDb->exec("insert into medical_prescription_requests values (41, 9, 7)");
    $chatDb->exec("insert into medical_providers values (9, 'pharmacy', 'approved'), (10, 'pharmacy', 'approved')");
    expect(MedicalChatAuthorization::customerEntity(7, 'prescription_request', 41) === ['customer_id' => 7, 'provider_id' => 9], 'Prescription request customer authorization must use stored participants.');
    expect(MedicalChatAuthorization::customerEntity(8, 'prescription_request', 41) === null, 'Another customer must not access prescription request chat.');
    expect(MedicalChatAuthorization::providerEntity(9, 'prescription_request', 41) === ['customer_id' => 7, 'provider_id' => 9], 'Assigned pharmacy must authorize prescription request chat.');
    expect(MedicalChatAuthorization::providerEntity(10, 'prescription_request', 41) === null, 'Another pharmacy must not access prescription request chat.');
} finally {
    if (is_string($chatDatabase) && is_file($chatDatabase)) unlink($chatDatabase);
}

echo "backend validation checks passed\n";
