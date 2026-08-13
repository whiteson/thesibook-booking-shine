<?php
/**
 * Merge WordPress WEBCODE_SMTP_* constants (from wp-config.php) into EA email config.
 * Keeps booking mail in sync with CMS mail — no duplicate secrets file required.
 */
declare(strict_types=1);

/**
 * @return array<string, string>
 */
function thesibook_parse_wp_config_constants(string $wp_config_path): array
{
    if (!is_readable($wp_config_path)) {
        return [];
    }

    $contents = (string) file_get_contents($wp_config_path);
    $constants = [];
    $pattern = "/define\\s*\\(\\s*'([A-Z0-9_]+)'\\s*,\\s*'([^']*)'\\s*\\)/";

    if (preg_match_all($pattern, $contents, $matches, PREG_SET_ORDER)) {
        foreach ($matches as $match) {
            $constants[$match[1]] = $match[2];
        }
    }

    return $constants;
}

/**
 * @param array<string, mixed> $config
 *
 * @return array<string, mixed>
 */
function thesibook_merge_wp_smtp_config(array $config): array
{
    $candidates = [
        FCPATH . '../thesibook-booking-shine/backend/wp-config.php',
        FCPATH . '../../thesibook-booking-shine/backend/wp-config.php',
    ];

    $wp_constants = [];

    foreach ($candidates as $path) {
        $resolved = realpath($path);

        if ($resolved !== false) {
            $wp_constants = thesibook_parse_wp_config_constants($resolved);
            break;
        }
    }

    if ($wp_constants === []) {
        return $config;
    }

    $host = trim($wp_constants['WEBCODE_SMTP_HOST'] ?? '');
    $user = trim($wp_constants['WEBCODE_SMTP_USER'] ?? '');
    $password = $wp_constants['WEBCODE_SMTP_PASSWORD'] ?? '';
    $from = trim($wp_constants['WEBCODE_SMTP_FROM'] ?? $user);
    $port = (int) ($wp_constants['WEBCODE_SMTP_PORT'] ?? 587);
    $crypto = trim($wp_constants['WEBCODE_SMTP_ENCRYPTION'] ?? 'tls');

    if ($host === '' && $user !== '' && $password !== '') {
        $host = 'mail.your-server.de';
    }

    if ($host === '' || $user === '' || $password === '') {
        return $config;
    }

    $config['protocol'] = 'smtp';
    $config['smtp_host'] = $host;
    $config['smtp_port'] = $port > 0 ? $port : 587;
    $config['smtp_user'] = $user;
    $config['smtp_pass'] = $password;
    $config['smtp_crypto'] = $crypto !== '' ? $crypto : 'tls';
    $config['smtp_auth'] = true;
    $config['from_address'] = $from !== '' ? $from : $user;
    $config['reply_to'] = $config['from_address'];

    return $config;
}

/**
 * konsoleH shared hosting: relay via local Exim on 127.0.0.1:25 when no authenticated SMTP is set.
 *
 * @param array<string, mixed> $config
 *
 * @return array<string, mixed>
 */
function thesibook_apply_konsoleh_local_smtp_fallback(array $config): array
{
    if ($config['protocol'] === 'smtp' && !empty($config['smtp_host'])) {
        return $config;
    }

    $config['protocol'] = 'smtp';
    $config['smtp_host'] = '127.0.0.1';
    $config['smtp_port'] = 25;
    $config['smtp_user'] = '';
    $config['smtp_pass'] = '';
    $config['smtp_crypto'] = '';
    $config['smtp_auth'] = false;
    $config['delivery_mode'] = 'konsoleh_local_exim';

    return $config;
}

/**
 * @return array<string, mixed>
 */
function thesibook_email_debug_status(): array
{
    $status = [
        'email_config_file' => is_readable(FCPATH . 'thesibook-email-config.php') ? 'loaded' : 'missing',
        'wp_config_path' => null,
        'wp_smtp_host' => '',
        'wp_smtp_user' => '',
        'wp_smtp_password_set' => false,
        'wp_smtp_bridge_active' => false,
    ];

    $candidates = [
        FCPATH . '../thesibook-booking-shine/backend/wp-config.php',
        FCPATH . '../../thesibook-booking-shine/backend/wp-config.php',
    ];

    foreach ($candidates as $path) {
        $resolved = realpath($path);

        if ($resolved !== false) {
            $status['wp_config_path'] = $resolved;
            $wp_constants = thesibook_parse_wp_config_constants($resolved);
            $status['wp_smtp_host'] = trim($wp_constants['WEBCODE_SMTP_HOST'] ?? '');
            $status['wp_smtp_user'] = trim($wp_constants['WEBCODE_SMTP_USER'] ?? '');
            $status['wp_smtp_password_set'] =
                ($wp_constants['WEBCODE_SMTP_PASSWORD'] ?? '') !== '';
            $status['wp_smtp_bridge_active'] =
                ($status['wp_smtp_host'] !== '' || $status['wp_smtp_user'] !== '') &&
                $status['wp_smtp_user'] !== '' &&
                $status['wp_smtp_password_set'];
            break;
        }
    }

    if (
        $status['wp_smtp_host'] === '' &&
        $status['wp_smtp_user'] !== '' &&
        $status['wp_smtp_password_set']
    ) {
        $status['wp_smtp_host_default'] = 'mail.your-server.de';
        $status['wp_smtp_bridge_active'] = true;
    }

    if (!$status['wp_smtp_bridge_active']) {
        $status['delivery_mode'] = 'konsoleh_local_exim';
        $status['delivery_hint'] =
            'No WEBCODE_SMTP_PASSWORD in wp-config. Using local Exim (127.0.0.1:25). ' .
            'If Gmail does not receive mail, set WEBCODE_SMTP_HOST=mail.your-server.de and the mailbox password in scripts/deploy/.env, then redeploy.';
    } else {
        $status['delivery_mode'] = 'authenticated_smtp';
        $status['delivery_hint'] = 'Authenticated SMTP via WordPress wp-config constants.';
    }

    return $status;
}
