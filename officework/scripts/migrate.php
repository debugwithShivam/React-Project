<?php

declare(strict_types=1);

require_once dirname(__DIR__) . '/app/Support/Env.php';
require_once dirname(__DIR__) . '/app/Support/Database.php';
require_once dirname(__DIR__) . '/app/Support/MigrationRunner.php';

use App\Support\Database;
use App\Support\MigrationRunner;

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Migrations are CLI-only.\n");
    exit(1);
}

$runner = new MigrationRunner(Database::connection(), dirname(__DIR__) . '/database/migrations');
$applied = $runner->run();
echo $applied === [] ? "Database is up to date.\n" : 'Applied: ' . implode(', ', $applied) . "\n";
