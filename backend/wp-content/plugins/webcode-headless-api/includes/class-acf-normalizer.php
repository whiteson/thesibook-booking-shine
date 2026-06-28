<?php

defined('ABSPATH') || exit;

/**
 * Normalizes ACF values for JSON consumers (Next.js adapters).
 */
final class Webcode_ACF_Normalizer
{
	/**
	 * @param mixed $value
	 * @return mixed
	 */
	public static function normalize($value)
	{
		if ($value === null || $value === false || $value === '') {
			return null;
		}

		if ($value instanceof WP_Post) {
			return self::normalize_post_object(
				[
					'ID'         => $value->ID,
					'post_name'  => $value->post_name,
					'post_title' => $value->post_title,
					'post_type'  => $value->post_type,
				]
			);
		}

		if (is_array($value)) {
			if (self::is_flexible_row($value)) {
				return self::normalize_flexible_row($value);
			}

			if (self::is_image_field($value)) {
				return self::normalize_image($value);
			}

			if (self::is_link_field($value)) {
				return self::normalize_link($value);
			}

			if (self::is_post_object($value)) {
				return self::normalize_post_object($value);
			}

			$normalized = [];
			foreach ($value as $key => $item) {
				$normalized[$key] = self::normalize($item);
			}

			return $normalized;
		}

		return $value;
	}

	/**
	 * @param array<int, array<string, mixed>>|null $rows
	 * @return array<int, array<string, mixed>>|null
	 */
	public static function normalize_sections(?array $rows): ?array
	{
		if (empty($rows) || ! is_array($rows)) {
			return null;
		}

		$sections = [];
		foreach ($rows as $row) {
			if (! is_array($row)) {
				continue;
			}
			$normalized = self::normalize_flexible_row($row);
			$sections[]   = Webcode_Section_Enricher::enrich($normalized);
		}

		return $sections;
	}

	/**
	 * @param array<string, mixed> $row
	 * @return array<string, mixed>
	 */
	private static function normalize_flexible_row(array $row): array
	{
		$type = isset($row['acf_fc_layout']) ? (string) $row['acf_fc_layout'] : 'unknown';
		unset($row['acf_fc_layout']);

		if (isset($row['section_payload'])) {
			$raw_payload = $row['section_payload'];
			unset($row['section_payload']);

			if (is_string($raw_payload) && $raw_payload !== '') {
				$decoded = json_decode($raw_payload, true);
				if (is_array($decoded)) {
					$normalized_payload = [];
					foreach ($decoded as $key => $value) {
						$normalized_payload[ $key ] = self::normalize($value);
					}

					return array_merge(['type' => $type], $normalized_payload);
				}
			}
		}

		$payload = [];
		foreach ($row as $key => $value) {
			$payload[ $key ] = self::normalize($value);
		}

		return array_merge(
			['type' => $type],
			$payload
		);
	}

	/**
	 * @param array<string, mixed> $image
	 * @return array<string, mixed>
	 */
	private static function normalize_image(array $image): array
	{
		$id = isset($image['ID']) ? (int) $image['ID'] : (isset($image['id']) ? (int) $image['id'] : 0);
		$src = $image['url'] ?? ($image['sizes']['large'] ?? ($image['sizes']['medium'] ?? null));

		if ($id > 0) {
			$large = wp_get_attachment_image_src($id, 'large');
			if ($large && ! empty($large[0])) {
				$src = $large[0];
			}
		}

		if ($src && function_exists('webcode_prefer_webp_url')) {
			$src = webcode_prefer_webp_url((string) $src, $id > 0 ? $id : null);
		}

		return array_filter(
			[
				'src'    => $src ? (string) $src : null,
				'alt'    => isset($image['alt']) ? (string) $image['alt'] : '',
				'width'  => isset($image['width']) ? (int) $image['width'] : null,
				'height' => isset($image['height']) ? (int) $image['height'] : null,
				'id'     => $id > 0 ? $id : null,
			],
			static fn($v) => $v !== null && $v !== ''
		);
	}

	/**
	 * @param array<string, mixed> $link
	 * @return array<string, mixed>
	 */
	private static function normalize_link(array $link): array
	{
		return array_filter(
			[
				'label'  => isset($link['title']) ? (string) $link['title'] : '',
				'href'   => isset($link['url']) ? (string) $link['url'] : '',
				'target' => ! empty($link['target']) ? (string) $link['target'] : '_self',
			],
			static fn($v) => $v !== ''
		);
	}

	/**
	 * @param array<string, mixed> $post
	 * @return array<string, mixed>
	 */
	private static function normalize_post_object(array $post): array
	{
		$id = isset($post['ID']) ? (int) $post['ID'] : (isset($post['id']) ? (int) $post['id'] : 0);

		return array_filter(
			[
				'id'    => $id ?: null,
				'slug'  => isset($post['post_name']) ? (string) $post['post_name'] : null,
				'title' => isset($post['post_title']) ? (string) $post['post_title'] : null,
				'type'  => isset($post['post_type']) ? (string) $post['post_type'] : null,
				'link'  => $id ? get_permalink($id) : null,
			],
			static fn($v) => $v !== null && $v !== ''
		);
	}

	/**
	 * @param array<string, mixed> $value
	 */
	private static function is_flexible_row(array $value): bool
	{
		return isset($value['acf_fc_layout']);
	}

	/**
	 * @param array<string, mixed> $value
	 */
	private static function is_image_field(array $value): bool
	{
		return isset($value['url']) && (isset($value['mime_type']) || isset($value['ID']) || isset($value['id']));
	}

	/**
	 * @param array<string, mixed> $value
	 */
	private static function is_link_field(array $value): bool
	{
		return isset($value['url'], $value['title']) && ! isset($value['acf_fc_layout']);
	}

	/**
	 * @param array<string, mixed> $value
	 */
	private static function is_post_object(array $value): bool
	{
		return isset($value['post_type'], $value['post_title']);
	}
}
