<?php
/**
 * ThesiBook multi-tenant bootstrap — loads per-tenant DB config from tenants/{slug}/meta.json
 * Session remembers tenant after first ?thesibook_tenant=slug visit.
 */
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    ini_set('session.gc_probability', '1');
    ini_set('session.gc_divisor', '100');
    session_start();
}

$thesibookSsoSecretFile = __DIR__ . '/thesibook-sso-secret.php';

if (is_readable($thesibookSsoSecretFile)) {
    require_once $thesibookSsoSecretFile;
}

$tenantSlug = '';
$cliTenant = getenv('THESIBOOK_TENANT') ?: '';
if (!empty($_GET['thesibook_tenant']) && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', (string) $_GET['thesibook_tenant'])) {
    $tenantSlug = (string) $_GET['thesibook_tenant'];
    $_SESSION['thesibook_tenant'] = $tenantSlug;
} elseif ($cliTenant !== '' && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', $cliTenant)) {
    $tenantSlug = $cliTenant;
    $_SESSION['thesibook_tenant'] = $tenantSlug;
} elseif (!empty($_SESSION['thesibook_tenant']) && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', (string) $_SESSION['thesibook_tenant'])) {
    $tenantSlug = (string) $_SESSION['thesibook_tenant'];
} else {
    $tenantSlug = thesibook_resolve_default_tenant();
    if ($tenantSlug !== '') {
        $_SESSION['thesibook_tenant'] = $tenantSlug;
    }
}

$configFile = __DIR__ . '/config.php';

if ($tenantSlug !== '' && thesibook_load_tenant_config($tenantSlug)) {
    return;
}

if (!file_exists($configFile)) {
    die(
        'The root "config.php" file is missing, please run ./scripts/install-book.sh --native'
    );
}

require_once $configFile;

/**
 * Resolve default tenant slug when none is in the URL or session.
 */
function thesibook_resolve_default_tenant(): string
{
    $tenantsDir = __DIR__ . '/tenants';
    $defaultFile = $tenantsDir . '/default';

    if (is_readable($defaultFile)) {
        $slug = trim((string) file_get_contents($defaultFile));

        if ($slug !== '' && preg_match('/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/', $slug)) {
            return $slug;
        }
    }

    $metaFiles = glob($tenantsDir . '/*/meta.json') ?: [];

    if (count($metaFiles) === 1) {
        return basename(dirname($metaFiles[0]));
    }

    return '';
}

/**
 * Load tenant DB config from tenants/{slug}/meta.json into Config class.
 */
function thesibook_load_tenant_config(string $tenantSlug): bool
{
    $metaFile = __DIR__ . '/tenants/' . $tenantSlug . '/meta.json';

    if (!is_readable($metaFile)) {
        return false;
    }

    $meta = json_decode((string) file_get_contents($metaFile), true);

    if (!is_array($meta) || empty($meta['db_name'])) {
        return false;
    }

    $baseUrl = $meta['base_url'] ?? getenv('EA_BASE_URL') ?: 'http://localhost/thesibook-booking-shine/book';
    $debug = !empty($meta['debug']) ? 'true' : 'false';
    $dbPrefix = $meta['db_prefix'] ?? 'ea_';

    if (!class_exists('Config', false)) {
        eval('class Config {
            const BASE_URL = ' . var_export($baseUrl, true) . ';
            const LANGUAGE = ' . var_export($meta['language'] ?? 'english', true) . ';
            const DEBUG_MODE = ' . $debug . ';
            const DB_HOST = ' . var_export($meta['db_host'] ?? 'localhost', true) . ';
            const DB_NAME = ' . var_export($meta['db_name'], true) . ';
            const DB_USERNAME = ' . var_export($meta['db_user'] ?? 'root', true) . ';
            const DB_PASSWORD = ' . var_export($meta['db_password'] ?? '', true) . ';
            const DB_PREFIX = ' . var_export($dbPrefix, true) . ';
        }');
    }

    $GLOBALS['THESIBOOK_TENANT_META'] = $meta;

    return true;
}

/**
 * Active tenant meta.json contents (after bootstrap).
 *
 * @return array<string, mixed>|null
 */
function thesibook_active_tenant_meta(): ?array
{
    if (!empty($GLOBALS['THESIBOOK_TENANT_META']) && is_array($GLOBALS['THESIBOOK_TENANT_META'])) {
        return $GLOBALS['THESIBOOK_TENANT_META'];
    }

    $slug = (string) ($_SESSION['thesibook_tenant'] ?? '');

    if ($slug === '') {
        return null;
    }

    $metaFile = __DIR__ . '/tenants/' . $slug . '/meta.json';

    if (!is_readable($metaFile)) {
        return null;
    }

    $meta = json_decode((string) file_get_contents($metaFile), true);

    return is_array($meta) ? $meta : null;
}

/**
 * Human-readable tenant / business name for the public booking UI.
 */
function thesibook_tenant_display_name(): string
{
    $meta = thesibook_active_tenant_meta();

    if ($meta && !empty($meta['display_name'])) {
        return trim((string) $meta['display_name']);
    }

    if ($meta && !empty($meta['slug'])) {
        return ucwords(str_replace('-', ' ', (string) $meta['slug']));
    }

    return '';
}

/**
 * Active tenant slug (session / URL).
 */
function thesibook_tenant_slug(): string
{
    return (string) ($_SESSION['thesibook_tenant'] ?? '');
}

/**
 * Query string for the active ThesiBook tenant (empty when none).
 */
function thesibook_tenant_query(): string
{
    if (empty($_SESSION['thesibook_tenant'])) {
        return '';
    }

    return '?thesibook_tenant=' . rawurlencode((string) $_SESSION['thesibook_tenant']);
}

/**
 * Append the active tenant query param to a URL.
 */
function thesibook_append_tenant(string $url): string
{
    if (empty($_SESSION['thesibook_tenant'])) {
        return $url;
    }

    $separator = str_contains($url, '?') ? '&' : '?';

    return $url . $separator . 'thesibook_tenant=' . rawurlencode((string) $_SESSION['thesibook_tenant']);
}

/**
 * Password reset URL for the active tenant (embedded in outbound email).
 */
function thesibook_password_reset_link(string $token): string
{
    return thesibook_append_tenant(site_url('recovery/reset?token=' . rawurlencode($token)));
}

/**
 * Control-plane MySQL credentials for plan checks. Never log the password.
 *
 * @return array{host: string, user: string, password: string, database: string}|null
 */
function thesibook_control_plane_config(): ?array
{
    static $resolved = false;
    static $config = null;

    if ($resolved) {
        return $config;
    }

    $resolved = true;
    $file = __DIR__ . '/thesibook-control-plane.php';

    if (is_readable($file)) {
        $loaded = require $file;

        if (is_array($loaded) && !empty($loaded['database'])) {
            $config = [
                'host' => (string) ($loaded['host'] ?? '127.0.0.1'),
                'user' => (string) ($loaded['user'] ?? 'root'),
                'password' => (string) ($loaded['password'] ?? ''),
                'database' => (string) $loaded['database'],
            ];

            return $config;
        }
    }

    $values = [];
    $files = [
        dirname(__DIR__) . '/frontend/.env.local',
        dirname(__DIR__) . '/frontend/.env',
        dirname(__DIR__) . '/scripts/local.env',
        dirname(__DIR__) . '/scripts/book.env',
    ];

    foreach ($files as $path) {
        if (!is_readable($path)) {
            continue;
        }

        $lines = file($path, FILE_IGNORE_NEW_LINES);

        if ($lines === false) {
            continue;
        }

        foreach ($lines as $line) {
            $line = trim($line);

            if ($line === '' || str_starts_with($line, '#')) {
                continue;
            }

            if (str_starts_with($line, 'export ')) {
                $line = trim(substr($line, 7));
            }

            $eq = strpos($line, '=');

            if ($eq === false) {
                continue;
            }

            $key = trim(substr($line, 0, $eq));
            $value = trim(substr($line, $eq + 1));

            if (
                (str_starts_with($value, '"') && str_ends_with($value, '"'))
                || (str_starts_with($value, "'") && str_ends_with($value, "'"))
            ) {
                $value = substr($value, 1, -1);
            }

            $values[$key] = $value;
        }
    }

    foreach (['BOOKING_DB_HOST', 'BOOKING_DB_USER', 'BOOKING_DB_PASSWORD', 'BOOKING_DB_NAME'] as $key) {
        $fromEnv = getenv($key);

        if (is_string($fromEnv) && $fromEnv !== '') {
            $values[$key] = $fromEnv;
        }
    }

    if (empty($values['BOOKING_DB_NAME'])) {
        return null;
    }

    $config = [
        'host' => (string) ($values['BOOKING_DB_HOST'] ?? '127.0.0.1'),
        'user' => (string) ($values['BOOKING_DB_USER'] ?? 'root'),
        'password' => (string) ($values['BOOKING_DB_PASSWORD'] ?? ''),
        'database' => (string) $values['BOOKING_DB_NAME'],
    ];

    return $config;
}
