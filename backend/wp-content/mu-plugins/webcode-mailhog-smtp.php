<?php
/**
 * Plugin Name: Webcode MailHog SMTP
 * Description: Routes WordPress wp_mail() to MailHog on local development (127.0.0.1:1025).
 */

defined('ABSPATH') || exit;

add_action(
	'phpmailer_init',
	static function ($phpmailer): void {
		if (defined('WEBCODE_MAILHOG') && WEBCODE_MAILHOG === false) {
			return;
		}

		$phpmailer->isSMTP();
		$phpmailer->Host        = defined('WEBCODE_MAILHOG_HOST') ? WEBCODE_MAILHOG_HOST : '127.0.0.1';
		$phpmailer->Port        = defined('WEBCODE_MAILHOG_PORT') ? (int) WEBCODE_MAILHOG_PORT : 1025;
		$phpmailer->SMTPAuth    = false;
		$phpmailer->SMTPSecure  = '';
		$phpmailer->SMTPAutoTLS = false;
	},
	99999
);
