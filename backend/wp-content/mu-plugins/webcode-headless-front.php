<?php
/**
 * Plugin Name: Webcode Headless Front
 * Description: Replaces the public WordPress theme with a minimal logo screen for headless setups.
 * Version: 1.0.0
 */

defined('ABSPATH') || exit;

add_action('template_redirect', static function (): void {
	if (is_admin() || wp_doing_ajax() || wp_doing_cron()) {
		return;
	}

	$uri = $_SERVER['REQUEST_URI'] ?? '';
	if (
		str_contains($uri, '/wp-json/')
		|| str_contains($uri, '/wp-login.php')
		|| str_contains($uri, '/wp-admin')
	) {
		return;
	}

	status_header(200);
	nocache_headers();

	$site_name = get_bloginfo('name') ?: 'ThesiBook';
	$frontend  = webcode_headless_front_url();
	$logo      = webcode_headless_front_logo($site_name);

	header('Content-Type: text/html; charset=' . get_bloginfo('charset'));

	echo '<!DOCTYPE html><html lang="' . esc_attr(get_bloginfo('language') ?: 'en') . '"><head>';
	echo '<meta charset="' . esc_attr(get_bloginfo('charset')) . '">';
	echo '<meta name="viewport" content="width=device-width, initial-scale=1">';
	echo '<meta name="robots" content="noindex, nofollow">';
	echo '<title>' . esc_html($site_name) . '</title>';
	echo '<style>
		*,*::before,*::after{box-sizing:border-box}
		html,body{height:100%;margin:0}
		body{
			display:flex;align-items:center;justify-content:center;
			background:#141418;color:#f8f8f6;
			font-family:system-ui,-apple-system,sans-serif;
		}
		a{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;color:inherit}
		a:focus-visible{outline:2px solid #6eb5ff;outline-offset:4px;border-radius:4px}
		img{display:block;max-width:min(240px,70vw);height:auto;object-fit:contain}
		.fallback{
			font-size:1.125rem;letter-spacing:.28em;text-transform:uppercase;
		}
	</style></head><body>';
	echo '<a href="' . esc_url($frontend) . '" rel="home">';

	if ($logo !== null) {
		printf(
			'<img src="%s" alt="%s" width="%d" height="%d">',
			esc_url($logo['url']),
			esc_attr($logo['alt']),
			(int) $logo['width'],
			(int) $logo['height']
		);
	} else {
		echo '<span class="fallback">' . esc_html($site_name) . '</span>';
	}

	echo '</a></body></html>';
	exit;
}, 0);

function webcode_headless_front_url(): string
{
	if (defined('WEBCODE_FRONTEND_URL') && is_string(WEBCODE_FRONTEND_URL) && WEBCODE_FRONTEND_URL !== '') {
		return rtrim(WEBCODE_FRONTEND_URL, '/') . '/';
	}

	return 'http://localhost:3000/';
}

/**
 * @return array{url: string, alt: string, width: int, height: int}|null
 */
function webcode_headless_front_logo(string $site_name): ?array
{
	if (! function_exists('get_field')) {
		return null;
	}

	$image = get_field('header_logo', 'option');
	if (! is_array($image) || empty($image['url'])) {
		$image = get_field('header_logo', 'options');
	}

	if (! is_array($image) || empty($image['url'])) {
		$image = get_field('footer_logo', 'option');
	}

	if (! is_array($image) || empty($image['url'])) {
		return null;
	}

	$url = (string) $image['url'];
	if (function_exists('webcode_prefer_webp_url') && ! empty($image['ID'])) {
		$url = webcode_prefer_webp_url($url, (int) $image['ID']);
	}

	return [
		'url'    => $url,
		'alt'    => isset($image['alt']) && $image['alt'] !== ''
			? (string) $image['alt']
			: $site_name,
		'width'  => isset($image['width']) ? max(1, (int) $image['width']) : 160,
		'height' => isset($image['height']) ? max(1, (int) $image['height']) : 40,
	];
}
