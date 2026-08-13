<?php

defined('ABSPATH') || exit;

/**
 * ThesiBook headless contact form (Contact Form 7) + mail routing.
 */
final class Thesibook_Contact_Form
{
	public const OPTION_FORM_ID = 'webcode_thesibook_contact_form_id';
	public const FORM_TITLE     = 'ThesiBook Contact';

	public static function register(): void
	{
		add_filter('wpcf7_mail_components', [self::class, 'filter_mail_recipient'], 10, 3);

		if (defined('WP_CLI') && WP_CLI) {
			WP_CLI::add_command(
				'webcode ensure-contact-form',
				static function (): void {
					$id = self::ensure();
					if ($id <= 0) {
						WP_CLI::error('Could not create ThesiBook contact form.');
					}
					WP_CLI::success(sprintf('ThesiBook contact form ID %d (mail → %s)', $id, self::mail_recipient()));
				}
			);
		}
	}

	public static function form_id(): int
	{
		$id = (int) get_option(self::OPTION_FORM_ID, 0);
		if ($id > 0 && get_post_status($id)) {
			return $id;
		}

		return self::ensure();
	}

	public static function mail_recipient(): string
	{
		if (defined('WEBCODE_CONTACT_MAIL_TO') && is_email(WEBCODE_CONTACT_MAIL_TO)) {
			return WEBCODE_CONTACT_MAIL_TO;
		}

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

		return 'info@thesibook.gr';
	}

	public static function ensure(): int
	{
		if (! post_type_exists('wpcf7_contact_form') || ! function_exists('wpcf7_save_contact_form')) {
			return 0;
		}

		$existing_id = (int) get_option(self::OPTION_FORM_ID, 0);
		if ($existing_id > 0 && get_post_status($existing_id)) {
			self::apply_form_properties($existing_id);
			return $existing_id;
		}

		$by_title = function_exists('wpcf7_get_contact_form_by_title')
			? wpcf7_get_contact_form_by_title(self::FORM_TITLE)
			: null;

		if ($by_title) {
			$id = (int) $by_title->id();
			update_option(self::OPTION_FORM_ID, $id);
			self::apply_form_properties($id);
			return $id;
		}

		$contact_form = wpcf7_save_contact_form(
			[
				'title'  => self::FORM_TITLE,
				'locale' => 'el',
				'form'   => self::form_markup(),
				'mail'   => self::mail_template(),
			],
			'save'
		);

		if (! $contact_form) {
			return 0;
		}

		$id = (int) $contact_form->id();
		update_option(self::OPTION_FORM_ID, $id);
		return $id;
	}

	/**
	 * @param array<string, mixed> $components
	 * @return array<string, mixed>
	 */
	public static function filter_mail_recipient(array $components, WPCF7_ContactForm $form, WPCF7_Mail $mail): array
	{
		if ($mail->name() !== 'mail') {
			return $components;
		}

		if ((int) $form->id() !== self::form_id()) {
			return $components;
		}

		$components['recipient'] = self::mail_recipient();
		return $components;
	}

	private static function apply_form_properties(int $form_id): void
	{
		if (! function_exists('wpcf7_save_contact_form')) {
			return;
		}

		wpcf7_save_contact_form(
			[
				'id'     => $form_id,
				'title'  => self::FORM_TITLE,
				'locale' => 'el',
				'form'   => self::form_markup(),
				'mail'   => self::mail_template(),
			],
			'save'
		);
	}

	private static function form_markup(): string
	{
		return trim(
			'[text* your-name autocomplete:name]
[email* your-email autocomplete:email]
[tel your-phone]
[text your-company]
[text business-type]
[textarea your-message]
[submit "Αποστολή"]'
		);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function mail_template(): array
	{
		$recipient = self::mail_recipient();

		return [
			'subject'            => 'ThesiBook — Early access από [your-name]',
			'sender'             => sprintf('ThesiBook <%s>', get_option('admin_email') ?: 'wordpress@thesibook.gr'),
			'body'               => "Νέο αίτημα early access από το thesibook.gr\n\n"
				. "Όνομα: [your-name]\n"
				. "Email: [your-email]\n"
				. "Τηλέφωνο: [your-phone]\n"
				. "Επιχείρηση: [your-company]\n"
				. "Τύπος επιχείρησης: [business-type]\n\n"
				. "Μήνυμα:\n[your-message]\n\n"
				. "--\n"
				. 'Αποστολή μέσω ' . home_url(),
			'recipient'          => $recipient,
			'additional_headers' => 'Reply-To: [your-name] <[your-email]>',
			'attachments'        => '',
			'use_html'           => 0,
			'exclude_blank'      => 0,
		];
	}
}
