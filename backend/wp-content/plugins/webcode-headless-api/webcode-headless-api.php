<?php
/**
 * Plugin Name: Webcode Headless API
 * Description: REST endpoints for headless Next.js — pages, ACF page builder sections, and site options.
 * Version: 1.0.0
 * Author: Webcode
 * Requires PHP: 8.0
 * Text Domain: webcode-headless-api
 */

defined('ABSPATH') || exit;

define('WEBCODE_HEADLESS_API_VERSION', '1.0.0');
define('WEBCODE_HEADLESS_API_DIR', plugin_dir_path(__FILE__));

require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-menu-resolver.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-settings-resolver.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-image-webp.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-acf-normalizer.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-section-enricher.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-yoast-seo-resolver.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-contact-handler.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-content-seeder.php';
require_once WEBCODE_HEADLESS_API_DIR . 'includes/class-rest-api.php';

add_action('plugins_loaded', static function (): void {
	if (! function_exists('get_field')) {
		add_action('admin_notices', static function (): void {
			echo '<div class="notice notice-error"><p><strong>Webcode Headless API</strong> requires Advanced Custom Fields (ACF).</p></div>';
		});
		return;
	}

	Webcode_Image_Webp::register();
	Webcode_Headless_REST_API::register();
	Webcode_Contact_Handler::register();
});
