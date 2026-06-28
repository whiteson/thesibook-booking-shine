<?php

defined('ABSPATH') || exit;

/**
 * Resolves Yoast SEO head output for headless page responses.
 */
final class Webcode_Yoast_SEO_Resolver
{
	/**
	 * @return array{
	 *   title: string,
	 *   description: string,
	 *   yoast: array<string, mixed>|null,
	 *   yoast_head: string|null
	 * }
	 */
	public static function resolve_for_post(WP_Post $post): array
	{
		$fallback = [
			'title'       => get_the_title($post),
			'description' => self::acf_description($post->ID),
			'yoast'       => null,
			'yoast_head'  => null,
		];

		if (! function_exists('YoastSEO')) {
			return $fallback;
		}

		try {
			$head_action = \YoastSEO()->classes->get(
				\Yoast\WP\SEO\Actions\Indexables\Indexable_Head_Action::class
			);
			$head = $head_action->for_post((int) $post->ID);

			if (! is_object($head) || (int) ($head->status ?? 404) !== 200) {
				return $fallback;
			}

			$json = is_array($head->json ?? null) ? $head->json : [];
			$html = is_string($head->html ?? null) ? $head->html : '';

			if ($json === [] && $html === '') {
				return $fallback;
			}

			return self::from_yoast($json, $post, $html);
		} catch (\Throwable $e) {
			return $fallback;
		}
	}

	/**
	 * @param array<string, mixed> $json
	 * @return array{
	 *   title: string,
	 *   description: string,
	 *   yoast: array<string, mixed>,
	 *   yoast_head: string|null
	 * }
	 */
	private static function from_yoast(array $json, WP_Post $post, string $html): array
	{
		$json = self::rewrite_frontend_urls($json, $post);

		$title = isset($json['title']) && is_string($json['title']) && $json['title'] !== ''
			? $json['title']
			: get_the_title($post);

		$description = isset($json['description']) && is_string($json['description'])
			? $json['description']
			: self::acf_description($post->ID);

		return [
			'title'       => $title,
			'description' => $description,
			'yoast'       => $json,
			'yoast_head'  => $html !== '' ? $html : null,
		];
	}

	/**
	 * Point canonical and Open Graph URLs at the public Next.js site.
	 *
	 * @param array<string, mixed> $json
	 * @return array<string, mixed>
	 */
	private static function rewrite_frontend_urls(array $json, WP_Post $post): array
	{
		$frontend_base = self::frontend_base();

		if ($frontend_base === '') {
			return $json;
		}

		$uri = wp_make_link_relative(get_permalink($post));

		foreach (['canonical', 'og_url'] as $key) {
			if (! isset($json[$key]) || ! is_string($json[$key]) || $json[$key] === '') {
				continue;
			}
			$json[$key] = self::rewrite_url($json[$key], $uri, $frontend_base);
		}

		return $json;
	}

	private static function rewrite_url(string $url, string $uri, string $frontend_base): string
	{
		$path = $uri !== '' ? $uri : wp_parse_url($url, PHP_URL_PATH) ?? '/';

		if (! str_starts_with($path, '/')) {
			$path = '/' . $path;
		}

		return rtrim($frontend_base, '/') . $path;
	}

	private static function frontend_base(): string
	{
		if (defined('WEBCODE_FRONTEND_URL') && is_string(WEBCODE_FRONTEND_URL) && WEBCODE_FRONTEND_URL !== '') {
			return rtrim(WEBCODE_FRONTEND_URL, '/');
		}

		return '';
	}

	private static function acf_description(int $post_id): string
	{
		if (! function_exists('get_field')) {
			return '';
		}

		return (string) (get_field('meta_description', $post_id) ?: '');
	}
}
