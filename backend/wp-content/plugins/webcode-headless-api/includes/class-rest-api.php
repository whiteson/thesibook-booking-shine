<?php

defined('ABSPATH') || exit;

final class Webcode_Headless_REST_API
{
	private const NAMESPACE = 'webcode/v1';

	public static function register(): void
	{
		add_action('rest_api_init', [self::class, 'register_routes']);
		add_filter('rest_pre_serve_request', [self::class, 'send_cors_headers'], 10, 4);
	}

	public static function register_routes(): void
	{
		register_rest_route(
			self::NAMESPACE,
			'/health',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [self::class, 'health'],
				'permission_callback' => '__return_true',
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/settings',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [self::class, 'get_settings'],
				'permission_callback' => '__return_true',
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/pages/(?P<slug>[a-zA-Z0-9_-]+)',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [self::class, 'get_page_by_slug'],
				'permission_callback' => '__return_true',
				'args'                => [
					'slug' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_title',
					],
				],
			]
		);

		register_rest_route(
			self::NAMESPACE,
			'/home',
			[
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => [self::class, 'get_home_page'],
				'permission_callback' => '__return_true',
			]
		);
	}

	public static function health(): WP_REST_Response
	{
		return new WP_REST_Response(
			[
				'ok'      => true,
				'plugin'  => 'webcode-headless-api',
				'version' => WEBCODE_HEADLESS_API_VERSION,
				'acf'     => function_exists('get_field'),
			],
			200
		);
	}

	public static function get_settings(): WP_REST_Response|WP_Error
	{
		return new WP_REST_Response(
			[
				'settings' => Webcode_Settings_Resolver::resolve(),
			],
			200
		);
	}

	public static function get_home_page(): WP_REST_Response|WP_Error
	{
		$post = self::resolve_front_page();

		if (! $post instanceof WP_Post) {
			return new WP_Error(
				'webcode_no_home',
				'No static front page is set. Assign a page under Settings → Reading, or use /pages/{slug}.',
				['status' => 404]
			);
		}

		return self::page_response($post);
	}

	public static function get_page_by_slug(WP_REST_Request $request): WP_REST_Response|WP_Error
	{
		$slug = (string) $request->get_param('slug');

		if ($slug === 'home') {
			return self::get_home_page();
		}

		$post = get_page_by_path($slug, OBJECT, 'page');

		if (! $post instanceof WP_Post || $post->post_status !== 'publish') {
			return new WP_Error(
				'webcode_page_not_found',
				sprintf('Page not found: %s', $slug),
				['status' => 404]
			);
		}

		return self::page_response($post);
	}

	private static function resolve_front_page(): ?WP_Post
	{
		if (get_option('show_on_front') !== 'page') {
			return null;
		}

		$front_id = (int) get_option('page_on_front');

		if ($front_id <= 0) {
			return null;
		}

		$post = get_post($front_id);

		return $post instanceof WP_Post ? $post : null;
	}

	private static function page_response(WP_Post $post): WP_REST_Response
	{
		$components = get_field('components', $post->ID);
		$template   = get_page_template_slug($post->ID) ?: 'default';

		$seo = Webcode_Yoast_SEO_Resolver::resolve_for_post($post);

		$featured = null;
		if (has_post_thumbnail($post->ID)) {
			$thumb_id = get_post_thumbnail_id($post->ID);
			$image    = acf_get_attachment($thumb_id);
			if (is_array($image)) {
				$featured = Webcode_ACF_Normalizer::normalize($image);
			}
		}

		return new WP_REST_Response(
			[
				'id'        => $post->ID,
				'slug'      => $post->post_name,
				'title'     => get_the_title($post),
				'uri'       => wp_make_link_relative(get_permalink($post)),
				'template'  => $template,
				'modified'  => get_post_modified_time('c', true, $post),
				'seo'       => $seo,
				'featured'  => $featured,
				'sections'  => Webcode_ACF_Normalizer::normalize_sections(
					is_array($components) ? $components : null
				),
			],
			200
		);
	}

	/**
	 * Allow Next.js dev server to read the API.
	 *
	 * @param bool              $served
	 * @param WP_HTTP_Response  $result
	 * @param WP_REST_Request   $request
	 * @param WP_REST_Server    $server
	 */
	public static function send_cors_headers($served, $result, $request, $server): bool
	{
		if (! $request instanceof WP_REST_Request) {
			return $served;
		}

		if (! str_starts_with($request->get_route(), '/webcode/')) {
			return $served;
		}

		$origin = isset($_SERVER['HTTP_ORIGIN']) ? (string) $_SERVER['HTTP_ORIGIN'] : '';
		$allowed = self::allowed_origins();

		if ($origin !== '' && in_array($origin, $allowed, true)) {
			header('Access-Control-Allow-Origin: ' . $origin);
			header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
			header('Access-Control-Allow-Headers: Content-Type, Authorization');
			header('Vary: Origin');
		}

		if ($request->get_method() === 'OPTIONS') {
			status_header(204);
			exit;
		}

		return $served;
	}

	/**
	 * @return list<string>
	 */
	private static function allowed_origins(): array
	{
		$defaults = [
			'http://localhost:3000',
			'http://127.0.0.1:3000',
			'http://localhost:3002',
			'http://127.0.0.1:3002',
		];

		if (defined('WEBCODE_HEADLESS_CORS_ORIGINS')) {
			$extra = WEBCODE_HEADLESS_CORS_ORIGINS;
			if (is_string($extra)) {
				$extra = array_map('trim', explode(',', $extra));
			}
			if (is_array($extra)) {
				return array_values(array_unique(array_merge($defaults, $extra)));
			}
		}

		return $defaults;
	}
}
