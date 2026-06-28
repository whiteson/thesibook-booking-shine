<?php

defined('ABSPATH') || exit;

/**
 * Resolves query-driven ACF layouts (carousel, services_grid) for headless JSON.
 */
final class Webcode_Section_Enricher
{
	/**
	 * @param array<string, mixed> $section
	 * @return array<string, mixed>
	 */
	public static function enrich(array $section): array
	{
		$type = isset($section['type']) ? (string) $section['type'] : '';

		switch ($type) {
			case 'carousel':
				return self::enrich_carousel($section);
			case 'services_grid':
				return self::enrich_services_grid($section);
			case 'contact_form':
				return self::enrich_contact_form($section);
			default:
				return $section;
		}
	}

	/**
	 * @param array<string, mixed> $section
	 * @return array<string, mixed>
	 */
	private static function enrich_carousel(array $section): array
	{
		$post_type = (string) self::field($section, 'carousel_post_type', 'post_type', 'post');
		$count     = (int) self::field($section, 'carousel_number_of_items', 'number_of_items', 6);

		$args = [
			'post_type'      => sanitize_key($post_type),
			'post_status'    => 'publish',
			'posts_per_page' => $count > 0 ? $count : 6,
			'orderby'        => 'date',
			'order'          => 'DESC',
		];

		$category = (string) self::field($section, 'carousel_category', 'category', '');
		if ($category !== '') {
			$args['category_name'] = sanitize_title($category);
		}

		$query = new WP_Query($args);

		$items = [];
		if ($query->have_posts()) {
			while ($query->have_posts()) {
				$query->the_post();
				$id    = get_the_ID();
				$thumb = null;
				if (has_post_thumbnail($id)) {
					$image = acf_get_attachment(get_post_thumbnail_id($id));
					if (is_array($image)) {
						$thumb = Webcode_ACF_Normalizer::normalize($image);
					}
				}
				$tag = trim(get_post_meta($id, 'project_tag', true));
				if ($tag === '') {
					$excerpt = trim(get_the_excerpt($id));
					if ($excerpt !== '' && $excerpt !== 'Work' && $excerpt !== 'Services') {
						$tag = $excerpt;
					}
				}
				if ($tag === '') {
					$content = get_post_field('post_content', $id);
					if (is_string($content) && preg_match('/<p[^>]*>(.*?)<\/p>/is', $content, $match)) {
						$tag = trim(wp_strip_all_tags($match[1]));
					}
				}
				if ($tag === '') {
					$terms = get_the_terms($id, 'category');
					if (is_array($terms) && ! empty($terms)) {
						$tag = (string) $terms[0]->name;
					}
				}
				$carousel_title = function_exists('get_field')
					? (string) (get_field('carousel_title', $id) ?: '')
					: '';

				$items[] = array_filter(
					[
						'title' => $carousel_title !== '' ? $carousel_title : get_the_title(),
						'tag'   => $tag,
						'year'  => get_the_date('Y'),
						'image' => $thumb,
					],
					static fn($v) => $v !== null && $v !== ''
				);
			}
			wp_reset_postdata();
		}

		$section['items'] = $items;

		return $section;
	}

	/**
	 * @param array<string, mixed> $section
	 * @return array<string, mixed>
	 */
	private static function enrich_services_grid(array $section): array
	{
		$category = sanitize_title((string) self::field($section, 'services_grid_category', 'category', 'services'));
		$count    = (int) self::field($section, 'services_grid_number_of_items', 'number_of_items', -1);

		$query = new WP_Query(
			[
				'post_type'           => 'post',
				'post_status'         => 'publish',
				'posts_per_page'      => $count > 0 ? $count : -1,
				'category_name'       => $category,
				'orderby'             => 'date',
				'order'               => 'ASC',
				'ignore_sticky_posts' => true,
			]
		);

		$items = [];
		$index = 0;
		if ($query->have_posts()) {
			while ($query->have_posts()) {
				$query->the_post();
				$index++;
				$content    = get_the_content();
				$summary    = '';
				$list_items = [];

				if (preg_match('/<p[^>]*>(.*?)<\/p>/is', $content, $matches)) {
					$summary = wp_strip_all_tags($matches[1]);
				}
				if (preg_match('/<ul[^>]*>(.*?)<\/ul>/is', $content, $list_match)) {
					if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $list_match[1], $li)) {
						foreach ($li[1] as $item) {
							$text = trim(wp_strip_all_tags($item));
							if ($text !== '') {
								$list_items[] = $text;
							}
						}
					}
				}
				if ($summary === '') {
					$summary = get_the_excerpt();
				}

				$items[] = [
					'num'   => str_pad((string) $index, 2, '0', STR_PAD_LEFT),
					'title' => get_the_title(),
					'body'  => $summary,
					'items' => $list_items,
				];
			}
			wp_reset_postdata();
		}

		$section['cards'] = $items;

		return $section;
	}

	/**
	 * @param array<string, mixed> $section
	 * @return array<string, mixed>
	 */
	private static function enrich_contact_form(array $section): array
	{
		$form = self::field($section, 'contact_form_contact_form', 'contact_form');
		$form_id = 0;

		if ($form instanceof WP_Post) {
			$form_id = (int) $form->ID;
		} elseif (is_array($form)) {
			$form_id = isset($form['ID']) ? (int) $form['ID'] : (isset($form['id']) ? (int) $form['id'] : 0);
		} elseif (is_numeric($form)) {
			$form_id = (int) $form;
		}

		if ($form_id > 0 && shortcode_exists('contact-form-7')) {
			$section['form_id'] = $form_id;
			$section['shortcode'] = '[contact-form-7 id="' . $form_id . '"]';
		}

		$section['title'] = (string) self::field($section, 'contact_form_title', 'title', '');
		$section['description'] = (string) self::field(
			$section,
			'contact_form_description',
			'description',
			''
		);

		return $section;
	}

	private static function field(array $section, string $prefixed, string $plain, $default = '')
	{
		if (array_key_exists($prefixed, $section) && $section[$prefixed] !== null && $section[$prefixed] !== '') {
			return $section[$prefixed];
		}

		if (array_key_exists($plain, $section) && $section[$plain] !== null && $section[$plain] !== '') {
			return $section[$plain];
		}

		return $default;
	}
}
