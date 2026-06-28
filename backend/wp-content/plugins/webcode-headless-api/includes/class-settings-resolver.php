<?php

defined('ABSPATH') || exit;

/**
 * Loads ACF Options fields for the headless settings endpoint.
 */
final class Webcode_Settings_Resolver
{
	/** @var list<string> */
	private const FIELD_KEYS = [
		'header_logo',
		'footer_logo',
		'hide_social_icons',
		'telephone',
		'email',
		'address',
		'working_hours',
		'footer_text',
		'footer_text2',
		'footer_text_image_left',
		'footer_text_image_right',
		'social_items',
		'contact_form',
	];

	/**
	 * @return array<string, mixed>
	 */
	public static function resolve(): array
	{
		if (! function_exists('get_field')) {
			return [];
		}

		$raw = get_fields('option');
		if (! is_array($raw) || $raw === [] || array_is_list($raw)) {
			$raw = get_fields('options');
		}

		if (! is_array($raw) || $raw === [] || array_is_list($raw)) {
			$raw = [];
			foreach (self::FIELD_KEYS as $key) {
				$value = get_field($key, 'option');
				if ($value === null || $value === false || $value === '') {
					$value = get_field($key, 'options');
				}
				if ($value !== null && $value !== false && $value !== '') {
					$raw[ $key ] = $value;
				}
			}
		}

		$normalized = Webcode_ACF_Normalizer::normalize($raw);

		if (! is_array($normalized) || array_is_list($normalized)) {
			return [];
		}

		$normalized['main_nav'] = Webcode_Menu_Resolver::resolve('menu-main');

		return $normalized;
	}
}
