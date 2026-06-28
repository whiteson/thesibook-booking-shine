<?php

defined('ABSPATH') || exit;

/**
 * Resolves WordPress nav menus for headless consumers.
 */
final class Webcode_Menu_Resolver
{
	/**
	 * @return list<array{label: string, href: string, target?: string}>
	 */
	public static function resolve(string $location): array
	{
		$locations = get_nav_menu_locations();

		if (! isset($locations[ $location ])) {
			return [];
		}

		$items = wp_get_nav_menu_items((int) $locations[ $location ]);

		if (! is_array($items)) {
			return [];
		}

		$links = [];

		foreach ($items as $item) {
			if (! $item instanceof WP_Post) {
				continue;
			}

			if ((int) $item->menu_item_parent !== 0) {
				continue;
			}

			$url = isset($item->url) ? (string) $item->url : '';

			if ($url === '') {
				continue;
			}

			$href = wp_make_link_relative($url);

			if ($href === '' || $href === false) {
				$href = '/';
			}

			$link = [
				'label' => (string) $item->title,
				'href'  => $href,
			];

			if (! empty($item->target) && $item->target === '_blank') {
				$link['target'] = '_blank';
			}

			$links[] = $link;
		}

		return $links;
	}
}
