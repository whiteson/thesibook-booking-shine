<?php
/**
 * Plugin Name: Webcode SMTP
 * Description: Sets wp_mail From address; uses authenticated SMTP only when WEBCODE_SMTP_HOST is set.
 * On Hetzner konsoleH, outbound SMTP :587 from PHP is often blocked — leave HOST empty and use local sendmail.
 */

defined('ABSPATH') || exit;

add_action(
	'phpmailer_init',
	static function ($phpmailer): void {
		if (defined('WEBCODE_MAILHOG') && WEBCODE_MAILHOG === true) {
			return;
		}

		$from = '';
		if (defined('WEBCODE_SMTP_FROM') && WEBCODE_SMTP_FROM !== '') {
			$from = WEBCODE_SMTP_FROM;
		} elseif (defined('WEBCODE_CONTACT_MAIL_TO') && WEBCODE_CONTACT_MAIL_TO !== '') {
			$from = WEBCODE_CONTACT_MAIL_TO;
		} elseif (defined('WEBCODE_SMTP_USER') && WEBCODE_SMTP_USER !== '') {
			$from = WEBCODE_SMTP_USER;
		}

		if ($from !== '') {
			$phpmailer->setFrom($from, get_bloginfo('name') ?: 'ThesiBook', false);
		}

		if (! defined('WEBCODE_SMTP_HOST') || WEBCODE_SMTP_HOST === '') {
			return;
		}

		$phpmailer->isSMTP();
		$phpmailer->Host        = WEBCODE_SMTP_HOST;
		$phpmailer->Port        = defined('WEBCODE_SMTP_PORT') ? (int) WEBCODE_SMTP_PORT : 587;
		$phpmailer->SMTPAuth    = true;
		$phpmailer->Username    = defined('WEBCODE_SMTP_USER') ? WEBCODE_SMTP_USER : '';
		$phpmailer->Password    = defined('WEBCODE_SMTP_PASSWORD') ? WEBCODE_SMTP_PASSWORD : '';
		$phpmailer->SMTPSecure  = defined('WEBCODE_SMTP_ENCRYPTION') ? WEBCODE_SMTP_ENCRYPTION : 'tls';
		$phpmailer->SMTPAutoTLS = true;
	},
	99998
);
