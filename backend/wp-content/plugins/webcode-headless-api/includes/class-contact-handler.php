<?php

defined('ABSPATH') || exit;

/**
 * Headless early-access / contact submissions (CF7 when available, wp_mail fallback).
 */
final class Webcode_Contact_Handler
{
	public static function register(): void
	{
		add_action('rest_api_init', [self::class, 'register_route']);
	}

	public static function register_route(): void
	{
		register_rest_route(
			'webcode/v1',
			'/contact',
			[
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => [self::class, 'submit'],
				'permission_callback' => '__return_true',
				'args'                => [
					'form_id' => [
						'type'              => 'integer',
						'sanitize_callback' => 'absint',
					],
					'name' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'email' => [
						'required'          => true,
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_email',
					],
					'phone' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'company' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'business_type' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'businessType' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
					'message' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_textarea_field',
					],
					'website' => [
						'type'              => 'string',
						'sanitize_callback' => 'sanitize_text_field',
					],
				],
			]
		);
	}

	public static function submit(WP_REST_Request $request): WP_REST_Response|WP_Error
	{
		if ((string) $request->get_param('website') !== '') {
			return new WP_REST_Response(
				[
					'ok'      => true,
					'status'  => 'mail_sent',
					'message' => 'Thank you for your message.',
				],
				200
			);
		}

		$name          = trim((string) $request->get_param('name'));
		$email         = trim((string) $request->get_param('email'));
		$phone         = trim((string) ($request->get_param('phone') ?? ''));
		$company       = trim((string) ($request->get_param('company') ?? ''));
		$business_type = trim((string) ($request->get_param('business_type') ?? $request->get_param('businessType') ?? ''));
		$message       = trim((string) ($request->get_param('message') ?? ''));

		if ($name === '' || $email === '' || ! is_email($email)) {
			return new WP_Error(
				'webcode_invalid_contact',
				'Name and a valid email are required.',
				['status' => 400]
			);
		}

		if ($message === '') {
			$message = self::compose_message($phone, $company, $business_type);
		}

		if (function_exists('wpcf7_contact_form')) {
			$cf7_result = self::submit_via_cf7($request, $name, $email, $company, $message);
			if ($cf7_result instanceof WP_REST_Response || $cf7_result instanceof WP_Error) {
				return $cf7_result;
			}
		}

		return self::submit_via_mail($name, $email, $phone, $company, $business_type, $message);
	}

	/**
	 * @return WP_REST_Response|WP_Error|null Null when CF7 is not configured.
	 */
	private static function submit_via_cf7(
		WP_REST_Request $request,
		string $name,
		string $email,
		string $company,
		string $message
	): WP_REST_Response|WP_Error|null {
		$form_id = (int) $request->get_param('form_id');
		if ($form_id <= 0) {
			$form_id = self::default_form_id();
		}

		if ($form_id <= 0) {
			return null;
		}

		$form = wpcf7_contact_form($form_id);
		if (! $form) {
			return null;
		}

		$_POST = [
			'your-name'             => $name,
			'your-email'            => $email,
			'company'               => $company,
			'your-message'          => $message,
			'_wpcf7'                => (string) $form_id,
			'_wpcf7_version'        => WPCF7_VERSION,
			'_wpcf7_locale'         => $form->locale(),
			'_wpcf7_unit_tag'       => $form->unit_tag(),
			'_wpcf7_container_post' => '0',
		];

		$result = $form->submit();
		$status = isset($result['status']) ? (string) $result['status'] : 'error';
		$ok     = $status === 'mail_sent';

		return new WP_REST_Response(
			[
				'ok'      => $ok,
				'status'  => $status,
				'message' => isset($result['message']) ? (string) $result['message'] : '',
			],
			$ok ? 200 : 422
		);
	}

	private static function submit_via_mail(
		string $name,
		string $email,
		string $phone,
		string $company,
		string $business_type,
		string $message
	): WP_REST_Response|WP_Error {
		$to = self::recipient_email();
		$subject = sprintf('[ThesiBook] Early access: %s', $name);

		$lines = [
			'Νέο αίτημα early access από το ThesiBook',
			'',
			sprintf('Ονοματεπώνυμο: %s', $name),
			sprintf('Email: %s', $email),
		];

		if ($phone !== '') {
			$lines[] = sprintf('Τηλέφωνο: %s', $phone);
		}
		if ($company !== '') {
			$lines[] = sprintf('Επιχείρηση: %s', $company);
		}
		if ($business_type !== '') {
			$lines[] = sprintf('Τύπος επιχείρησης: %s', $business_type);
		}
		if ($message !== '') {
			$lines[] = '';
			$lines[] = 'Μήνυμα:';
			$lines[] = $message;
		}

		$body = implode("\n", $lines);
		$headers = [
			'Content-Type: text/plain; charset=UTF-8',
			sprintf('Reply-To: %s <%s>', $name, $email),
		];

		$sent = wp_mail($to, $subject, $body, $headers);

		if (! $sent) {
			return new WP_Error(
				'webcode_mail_failed',
				'Could not send the message. Please try again later.',
				['status' => 500]
			);
		}

		return new WP_REST_Response(
			[
				'ok'      => true,
				'status'  => 'mail_sent',
				'message' => 'Thank you for your message.',
			],
			200
		);
	}

	private static function compose_message(string $phone, string $company, string $business_type): string
	{
		$parts = [];

		if ($business_type !== '') {
			$parts[] = sprintf('Τύπος επιχείρησης: %s', $business_type);
		}
		if ($phone !== '') {
			$parts[] = sprintf('Τηλέφωνο: %s', $phone);
		}
		if ($company !== '') {
			$parts[] = sprintf('Επιχείρηση: %s', $company);
		}

		if ($parts === []) {
			return 'Early access request via ThesiBook website.';
		}

		return implode("\n", $parts);
	}

	private static function recipient_email(): string
	{
		if (function_exists('get_field')) {
			$option_email = get_field('email', 'option');
			if (is_string($option_email) && is_email($option_email)) {
				return $option_email;
			}
		}

		$admin = get_option('admin_email');
		if (is_string($admin) && is_email($admin)) {
			return $admin;
		}

		return 'hello@thesibook.gr';
	}

	private static function default_form_id(): int
	{
		if (! post_type_exists('wpcf7_contact_form')) {
			return 0;
		}

		$forms = get_posts(
			[
				'post_type'      => 'wpcf7_contact_form',
				'post_status'    => 'publish',
				'posts_per_page' => 1,
				'orderby'        => 'date',
				'order'          => 'ASC',
				'fields'         => 'ids',
			]
		);

		return ! empty($forms) ? (int) $forms[0] : 0;
	}
}
