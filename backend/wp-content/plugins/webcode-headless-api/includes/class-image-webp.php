<?php

defined('ABSPATH') || exit;

/**
 * Creates companion .webp files. URL rewriting is always on via MU plugin webcode-webp-urls.php.
 *
 * @see https://developers.google.com/speed/webp/docs/cwebp
 */
final class Webcode_Image_Webp
{
	private const QUALITY = 82;

	public static function register(): void
	{
		add_filter('image_editor_output_format', [self::class, 'editor_output_format'], 10, 1);
		add_filter('wp_generate_attachment_metadata', [self::class, 'on_generate_metadata'], 20, 2);

		if (defined('WP_CLI') && WP_CLI) {
			WP_CLI::add_command(
				'webcode webp',
				[Webcode_Image_Webp_CLI::class, '__invoke'],
				[
					'shortdesc' => 'Create .webp files; WordPress and /wp-json/webcode/v1 then return .webp URLs.',
					'synopsis'  => [
						[
							'type'        => 'flag',
							'name'        => 'dry-run',
							'optional'    => true,
							'description' => 'List attachments without writing files.',
						],
						[
							'type'        => 'flag',
							'name'        => 'force',
							'optional'    => true,
							'description' => 'Regenerate .webp even when a newer file already exists.',
						],
					],
				]
			);
		}
	}

	/**
	 * @param array<string, string> $formats
	 * @return array<string, string>
	 */
	public static function editor_output_format(array $formats): array
	{
		if (self::can_write_webp()) {
			$formats['image/jpeg'] = 'image/webp';
			$formats['image/png']  = 'image/webp';
		}

		return $formats;
	}

	/**
	 * @param array<string, mixed> $metadata
	 * @return array<string, mixed>
	 */
	public static function on_generate_metadata(array $metadata, int $attachment_id): array
	{
		self::generate_for_attachment($attachment_id, true);

		return $metadata;
	}

	public static function generate_for_attachment(int $attachment_id, bool $only_missing = true): bool
	{
		$mime = get_post_mime_type($attachment_id);
		if (! in_array($mime, ['image/jpeg', 'image/png'], true)) {
			return false;
		}

		$file = get_attached_file($attachment_id);
		if (! $file || ! is_readable($file)) {
			return false;
		}

		$ok = self::convert_file_to_webp($file, $only_missing);

		$metadata = wp_get_attachment_metadata($attachment_id);
		if (! empty($metadata['sizes']) && is_array($metadata['sizes'])) {
			$base_dir = dirname($file);
			foreach ($metadata['sizes'] as $size) {
				if (empty($size['file']) || ! is_string($size['file'])) {
					continue;
				}
				$size_path = $base_dir . '/' . $size['file'];
				if (is_readable($size_path)) {
					$ok = self::convert_file_to_webp($size_path, $only_missing) || $ok;
				}
			}
		}

		return $ok;
	}

	public static function can_write_webp(): bool
	{
		if (class_exists('Imagick')) {
			return in_array('WEBP', Imagick::queryFormats('WEBP'), true);
		}

		return function_exists('imagewebp');
	}

	private static function convert_file_to_webp(string $path, bool $only_missing = true): bool
	{
		if (preg_match('/\.webp$/i', $path)) {
			return true;
		}

		if (! preg_match('/\.(jpe?g|png)$/i', $path)) {
			return false;
		}

		$webp_path = preg_replace('/\.(jpe?g|png)$/i', '.webp', $path);
		if (! $webp_path || $webp_path === $path) {
			return false;
		}

		if (
			$only_missing
			&& is_readable($webp_path)
			&& filemtime($webp_path) >= filemtime($path)
		) {
			return true;
		}

		if (! self::can_write_webp()) {
			return false;
		}

		$editor = wp_get_image_editor($path);
		if (is_wp_error($editor)) {
			return false;
		}

		$editor->set_quality(self::QUALITY);
		$saved = $editor->save($webp_path, 'image/webp');

		return ! is_wp_error($saved);
	}
}

/**
 * @internal WP-CLI handler
 */
final class Webcode_Image_Webp_CLI
{
	/**
	 * @param array<string, mixed> $args
	 * @param array<string, mixed> $assoc_args
	 */
	public function __invoke(array $args, array $assoc_args): void
	{
		unset($args);

		if (! Webcode_Image_Webp::can_write_webp()) {
			WP_CLI::error('WebP is not supported by this PHP image stack (enable GD imagewebp or Imagick).');
		}

		$dry_run      = isset($assoc_args['dry-run']);
		$only_missing = ! isset($assoc_args['force']);

		$query = new WP_Query(
			[
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'post_mime_type' => ['image/jpeg', 'image/png'],
				'posts_per_page' => -1,
				'fields'         => 'ids',
			]
		);

		$ids = $query->posts;
		if (! is_array($ids) || $ids === []) {
			WP_CLI::success('No JPEG/PNG attachments found.');
			return;
		}

		$converted = 0;
		$skipped   = 0;

		foreach ($ids as $id) {
			$id = (int) $id;
			$file = get_attached_file($id);
			$label = $file ? basename($file) : (string) $id;

			if ($dry_run) {
				WP_CLI::log(sprintf('[dry-run] attachment %d — %s', $id, $label));
				continue;
			}

			$before_webp = $file ? preg_replace('/\.(jpe?g|png)$/i', '.webp', $file) : '';
			$had_webp    = $before_webp && is_readable($before_webp);

			if (Webcode_Image_Webp::generate_for_attachment($id, $only_missing)) {
				if ($had_webp && $only_missing) {
					++$skipped;
					WP_CLI::log(sprintf('skip %d — %s (webp exists)', $id, $label));
				} else {
					++$converted;
					WP_CLI::log(sprintf('ok   %d — %s', $id, $label));
				}
			} else {
				WP_CLI::warning(sprintf('fail %d — %s', $id, $label));
			}
		}

		if ($dry_run) {
			WP_CLI::success(sprintf('Dry run: %d attachment(s) would be processed.', count($ids)));
			return;
		}

		WP_CLI::log('MU plugin webcode-webp-urls will serve .webp URLs when those files exist.');

		WP_CLI::success(sprintf('WebP pass complete. Updated: %d, skipped (already had webp): %d.', $converted, $skipped));
	}
}
