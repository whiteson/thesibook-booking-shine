<?php
/**
 * ThesiBook multi-tenant bootstrap — loads per-tenant DB config from tenants/{slug}/meta.json
 * Session remembers tenant after first ?thesibook_tenant=slug visit.
 */
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

$tenantSlug = '';
if (!empty($_GET['thesibook_tenant']) && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', (string) $_GET['thesibook_tenant'])) {
    $tenantSlug = (string) $_GET['thesibook_tenant'];
    $_SESSION['thesibook_tenant'] = $tenantSlug;
} elseif (!empty($_SESSION['thesibook_tenant']) && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', (string) $_SESSION['thesibook_tenant'])) {
    $tenantSlug = (string) $_SESSION['thesibook_tenant'];
}

$configFile = __DIR__ . '/config.php';

if ($tenantSlug !== '') {
    $metaFile = __DIR__ . '/tenants/' . $tenantSlug . '/meta.json';
    if (is_readable($metaFile)) {
        $meta = json_decode((string) file_get_contents($metaFile), true);
        if (is_array($meta) && !empty($meta['db_name'])) {
            $baseUrl = $meta['base_url'] ?? getenv('EA_BASE_URL') ?: 'http://127.0.0.1:8090';
            $debug = !empty($meta['debug']) ? 'true' : 'false';

            if (!class_exists('Config', false)) {
                eval('class Config {
                    const BASE_URL = ' . var_export($baseUrl, true) . ';
                    const LANGUAGE = ' . var_export($meta['language'] ?? 'english', true) . ';
                    const DEBUG_MODE = ' . $debug . ';
                    const DB_HOST = ' . var_export($meta['db_host'] ?? 'localhost', true) . ';
                    const DB_NAME = ' . var_export($meta['db_name'], true) . ';
                    const DB_USERNAME = ' . var_export($meta['db_user'] ?? 'root', true) . ';
                    const DB_PASSWORD = ' . var_export($meta['db_password'] ?? '', true) . ';
                }');
            }
            return;
        }
    }
}

if (!file_exists($configFile)) {
    die(
        'The root "config.php" file is missing, please run ./scripts/install-book.sh --native'
    );
}

require_once $configFile;
