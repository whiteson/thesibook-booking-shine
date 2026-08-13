<?php defined('BASEPATH') or exit('No direct script access allowed');

// Add custom values by settings them to the $config array.
// Example: $config['smtp_host'] = 'smtp.gmail.com';
// @link https://codeigniter.com/user_guide/libraries/email.html

$config['useragent'] = 'thesibook.gr';
$config['protocol'] = 'mail'; // or 'smtp'
$config['mailtype'] = 'html'; // or 'text'
$config['from_name'] = 'thesibook.gr';
$config['from_address'] = 'info@thesibook.gr';
$config['reply_to'] = 'info@thesibook.gr';
$config['crlf'] = "\r\n";
$config['newline'] = "\r\n";

$thesibookEmailConfigFile = __DIR__ . '/../../thesibook-email-config.php';

if (is_readable($thesibookEmailConfigFile)) {
    require_once $thesibookEmailConfigFile;

    if (defined('THESIBOOK_EMAIL_CONFIG') && is_array(THESIBOOK_EMAIL_CONFIG)) {
        foreach (THESIBOOK_EMAIL_CONFIG as $key => $value) {
            $config[$key] = $value;
        }
    }
}

$thesibookWpSmtpBridge = __DIR__ . '/../../thesibook-wp-smtp-bridge.php';

if (is_readable($thesibookWpSmtpBridge)) {
    require_once $thesibookWpSmtpBridge;
    $config = thesibook_merge_wp_smtp_config($config);
    $config = thesibook_apply_konsoleh_local_smtp_fallback($config);
}
