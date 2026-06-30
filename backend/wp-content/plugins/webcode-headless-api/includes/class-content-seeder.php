<?php

defined('ABSPATH') || exit;

/**
 * Seeds ThesiBook ACF page builder content from Lovable / frontend mock data.
 */
final class Webcode_Content_Seeder
{
	/** @var list<string> */
	private const LEGACY_SLUGS = ['about', 'services', 'work', 'hosting', 'new-eras'];

	/** @var list<string> */
	private const PAGE_SLUGS = ['home', 'business', 'how-it-works', 'features', 'contact'];

	/**
	 * @return array<string, int|string>
	 */
	public static function run(): array
	{
		if (! function_exists('update_field')) {
			return ['error' => 'ACF is not available'];
		}

		self::remove_legacy_pages();
		self::seed_branding_options();
		self::seed_main_menu();

		$pages = [
			'home'          => self::home_components(),
			'business'      => self::business_components(),
			'how-it-works'  => self::how_it_works_components(),
			'features'      => self::features_components(),
			'contact'       => self::contact_components(),
		];

		$page_titles = [
			'home'         => 'ThesiBook',
			'business'     => 'Για επιχειρήσεις',
			'how-it-works' => 'Πώς λειτουργεί',
			'features'     => 'Λειτουργίες',
			'contact'      => 'Επικοινωνία',
		];

		$results = [];

		foreach ($pages as $slug => $components) {
			$post_id = self::ensure_page($slug, $page_titles[ $slug ] ?? $slug);
			if ($post_id <= 0) {
				$results[ $slug ] = 'missing page';
				continue;
			}

			update_field('components', $components, $post_id);

			if ($slug === 'home') {
				update_option('show_on_front', 'page');
				update_option('page_on_front', $post_id);
			}

			$results[ $slug ] = 'ok (' . count($components) . ' sections)';
		}

		return $results;
	}

	/**
	 * @param array<string, mixed> $data
	 * @return array<string, mixed>
	 */
	private static function section_row(string $layout, array $data): array
	{
		return [
			'acf_fc_layout'   => $layout,
			'section_payload' => wp_json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
		];
	}

	/**
	 * @return array{title: string, url: string, target: string}
	 */
	private static function link(string $label, string $href, string $target = ''): array
	{
		return [
			'title'  => $label,
			'url'    => $href,
			'target' => $target,
		];
	}

	private static function frontend_url(string $path = ''): string
	{
		$base = defined('WEBCODE_FRONTEND_URL')
			? rtrim((string) WEBCODE_FRONTEND_URL, '/')
			: 'http://localhost:3010';

		if ($path === '' || $path === '/') {
			return $base . '/';
		}

		return $base . '/' . ltrim($path, '/');
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function home_components(): array
	{
		return [
			self::section_row('hero', [
				'badge'                  => 'Early access · Ελλάδα',
				'title'                  => 'Η πιο εύκολη πλατφόρμα κρατήσεων για',
				'highlighted_text'       => 'σεμινάρια, μαθήματα και εκπαιδευτικές επιχειρήσεις στην Ελλάδα.',
				'description'            => 'Με το ThesiBook, οι πελάτες βρίσκουν διαθέσιμες θέσεις, κάνουν κράτηση online και οι επιχειρήσεις οργανώνουν εύκολα τα προγράμματά τους.',
				'primary_cta'            => self::link('Ζήτησε early access', '#early-access'),
				'secondary_cta'          => self::link('Δες πώς λειτουργεί', '#how'),
				'trust_bullets'          => [
					['icon' => 'CheckCircle2', 'title' => 'Χωρίς πιστωτική κάρτα'],
					['icon' => 'CheckCircle2', 'title' => 'Στήσιμο σε λεπτά'],
					['icon' => 'CheckCircle2', 'title' => 'Στα Ελληνικά'],
				],
				'dashboard_title'          => 'Πίνακας ελέγχου',
				'dashboard_subtitle'       => 'Καλώς ήρθες',
				'dashboard_avatar_label'   => 'A',
				'stats'                    => [
					['icon' => 'Calendar', 'label' => 'Επόμενα', 'value' => '12'],
					['icon' => 'Users', 'label' => 'Κρατήσεις', 'value' => '128'],
					['icon' => 'MapPin', 'label' => 'Θέσεις', 'value' => '340'],
				],
				'featured_event'           => [
					'title'               => 'Digital Marketing Seminar',
					'meta'                => '24 Μαΐου · 10:00 — 14:00 · Αθήνα',
					'seats_label'         => '12 θέσεις',
					'total_seats'         => 24,
					'taken_indexes'       => [3, 7, 11, 16],
					'selected_index'      => 14,
					'selected_seat_label' => 'Επιλεγμένη θέση: A5',
					'price_label'         => '€49',
				],
				'floating_card'            => [
					'icon'  => 'CheckCircle2',
					'label' => 'Νέα κράτηση',
					'title' => 'Leadership Workshop',
				],
			]),
			self::section_row('icon_grid', [
				'variant'     => 'problem',
				'eyebrow'     => 'Το πρόβλημα',
				'title'       => 'Οι κρατήσεις δεν χρειάζεται να γίνονται δύσκολα.',
				'items'       => [
					['icon' => 'PhoneOff', 'title' => 'Χαμένες κρατήσεις από μηνύματα και τηλεφωνήματα'],
					['icon' => 'CalendarX', 'title' => 'Δυσκολία στη διαχείριση διαθέσιμων θέσεων'],
					['icon' => 'Wallet', 'title' => 'Πληρωμές και συμμετοχές χωρίς οργάνωση'],
					['icon' => 'Search', 'title' => 'Πελάτες που δεν βρίσκουν εύκολα διαθέσιμα μαθήματα'],
				],
			]),
			self::section_row('solution', [
				'eyebrow'          => 'Η λύση',
				'title'            => 'Το ThesiBook οργανώνει τις κρατήσεις σου σε',
				'highlighted_text' => 'ένα μέρος',
				'description'      => 'Όλη η δραστηριότητα της επιχείρησής σου — εκπαιδευτικά events, διαθέσιμες θέσεις, πελάτες, πληρωμές — σε μία απλή, σύγχρονη πλατφόρμα.',
				'bullets'          => [
					'Δημιουργείς εκπαιδευτικά events και σεμινάρια',
					'Ορίζεις διαθέσιμες θέσεις και τιμές',
					'Διαχειρίζεσαι κρατήσεις σε ένα μέρος',
					'Δέχεσαι αιτήματα από νέους πελάτες',
					'Προωθείς τα μαθήματά σου online',
				],
				'weekdays'         => ['ΔΕΥ', 'ΤΡΙ', 'ΤΕΤ', 'ΠΕΜ', 'ΠΑΡ', 'ΣΑΒ', 'ΚΥΡ'],
				'calendar'         => [
					'total_cells'    => 35,
					'start_offset'   => 2,
					'month_days'     => 31,
					'active_day'     => 22,
					'available_days' => [5, 9, 14, 17, 22, 26, 29],
				],
				'events'           => [
					['title' => 'Thesis Writing Workshop', 'schedule' => '10:00 — 12:00', 'occupancy' => '24/40'],
					['title' => 'Research Methodology', 'schedule' => '13:00 — 15:00', 'occupancy' => '18/30'],
					['title' => 'Statistical Analysis', 'schedule' => '16:00 — 18:00', 'occupancy' => '20/25'],
				],
			]),
			self::section_row('icon_grid', [
				'variant' => 'features',
				'eyebrow' => 'Λειτουργίες',
				'title'   => 'Όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου.',
				'items'   => [
					['icon' => 'CalendarCheck', 'title' => 'Online κρατήσεις', 'description' => 'Οι πελάτες κρατούν θέση 24/7 χωρίς τηλεφωνήματα.'],
					['icon' => 'Layers', 'title' => 'Διαχείριση διαθέσιμων θέσεων', 'description' => 'Όρισε χωρητικότητα, λίστες αναμονής και τιμές.'],
					['icon' => 'CalendarDays', 'title' => 'Ημερολόγιο σεμιναρίων', 'description' => 'Όλα τα μαθήματα και workshops σε ένα view.'],
					['icon' => 'Building2', 'title' => 'Προφίλ επιχείρησης', 'description' => 'Επαγγελματική παρουσία με branding και πληροφορίες.'],
					['icon' => 'FileText', 'title' => 'Σελίδα για κάθε σεμινάριο', 'description' => 'Περιγραφή, εισηγητής, φωτογραφίες και CTA.'],
					['icon' => 'Bell', 'title' => 'Notifications', 'description' => 'Αυτόματες υπενθυμίσεις και επιβεβαιώσεις.'],
					['icon' => 'Smartphone', 'title' => 'Mobile-friendly', 'description' => 'Άψογη εμπειρία σε κινητό και tablet.'],
					['icon' => 'Search', 'title' => 'Αναζήτηση χρηστών', 'description' => 'Φιλτράρισμα ανά περιοχή, κατηγορία και ημερομηνία.'],
				],
			]),
			self::section_row('for_businesses', [
				'eyebrow'        => 'Για επιχειρήσεις',
				'title'          => 'Για εκπαιδευτικές επιχειρήσεις, coaches και διοργανωτές σεμιναρίων.',
				'description'    => 'Το ThesiBook έχει σχεδιαστεί για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.',
				'business_types' => [
					'Σεμινάρια',
					'Φροντιστήρια',
					'Ακαδημίες',
					'Workshops',
					'Yoga / Pilates studios',
					'Personal trainers',
					'Επαγγελματική κατάρτιση',
					'Ιδιωτικά μαθήματα',
					'Online courses',
				],
				'cta'            => self::link('Θέλω να μπω στην πλατφόρμα', '#early-access'),
			]),
			self::section_row('steps', [
				'eyebrow' => 'Πώς λειτουργεί',
				'title'   => 'Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 βήματα.',
				'steps'   => [
					[
						'number'      => '01',
						'title'       => 'Δημιουργείς το προφίλ σου',
						'description' => 'Στήσε την επιχείρησή σου σε λίγα λεπτά με logo, περιγραφή και στοιχεία επικοινωνίας.',
					],
					[
						'number'      => '02',
						'title'       => 'Προσθέτεις μαθήματα και θέσεις',
						'description' => 'Όρισε ημερομηνίες, χωρητικότητα, τιμή και πληροφορίες για κάθε σεμινάριο.',
					],
					[
						'number'      => '03',
						'title'       => 'Οι πελάτες κάνουν κράτηση online',
						'description' => 'Δέχεσαι κρατήσεις 24/7, αυτόματες επιβεβαιώσεις και υπενθυμίσεις.',
					],
				],
			]),
			self::section_row('app_preview', [
				'eyebrow'     => 'App preview',
				'title'       => 'Μια εμπειρία σχεδιασμένη για κινητό.',
				'description' => 'Από την ανακάλυψη του σεμιναρίου μέχρι την επιλογή θέσης — όλα σε λίγα tap.',
				'discover'    => [
					'brand'             => 'ThesiBook',
					'searchPlaceholder' => 'Αναζήτηση σεμιναρίων',
					'categories'        => ['Όλα', 'Business', 'Yoga', 'Design'],
					'cards'             => [
						['title' => 'Digital Marketing', 'location' => 'Αθήνα', 'seats' => '12 θέσεις'],
						['title' => 'Leadership Workshop', 'location' => 'Θεσσαλονίκη', 'seats' => '8 θέσεις'],
					],
				],
				'details'     => [
					'topBarLabel'  => 'Λεπτομέρειες',
					'title'        => 'Digital Marketing Seminar',
					'subtitle'     => 'Αθήνα · 24 Μαΐου · 10:00 — 14:00',
					'description'  => 'Μάθε τις βασικές στρατηγικές του ψηφιακού μάρκετινγκ.',
					'speakerLabel' => 'Εισηγητής',
					'speakerValue' => 'Γιάννης Παπαδόπουλος',
					'ctaLabel'     => 'Επιλογή θέσης · €49',
				],
				'seat_picker' => [
					'topBarLabel'   => 'Επιλογή θέσης',
					'totalSeats'    => 30,
					'takenIndexes'  => [2, 9, 13, 18, 22],
					'selectedIndex' => 14,
					'availableLabel' => 'Διαθ.',
					'takenLabel'    => 'Κατ.',
					'selectedLabel' => 'Επιλ.',
					'selectedSeat'  => 'A5',
					'priceLabel'    => 'Τιμή',
					'price'         => '€49',
					'ctaLabel'      => 'Συνέχεια',
				],
			]),
			self::section_row('icon_grid', [
				'variant' => 'benefits',
				'eyebrow' => 'Οφέλη',
				'title'   => 'Γιατί να χρησιμοποιήσεις το ThesiBook;',
				'items'   => [
					['icon' => 'PhoneOff', 'title' => 'Λιγότερα τηλεφωνήματα', 'description' => 'Οι κρατήσεις γίνονται online, αυτόματα.'],
					['icon' => 'Sparkles', 'title' => 'Καλύτερη οργάνωση', 'description' => 'Κάθε event, κράτηση και πελάτης σε ένα μέρος.'],
					['icon' => 'TrendingUp', 'title' => 'Περισσότερες κρατήσεις', 'description' => 'Διαθεσιμότητα 24/7 σημαίνει περισσότερη ζήτηση.'],
					['icon' => 'Globe', 'title' => 'Επαγγελματική online παρουσία', 'description' => 'Σύγχρονη σελίδα για κάθε σεμινάριο.'],
					['icon' => 'Megaphone', 'title' => 'Εύκολη προβολή σε νέους πελάτες', 'description' => 'Αναζήτηση από χιλιάδες χρήστες στην Ελλάδα.'],
					['icon' => 'Heart', 'title' => 'Ιδανικό για μικρές και μεσαίες επιχειρήσεις', 'description' => 'Σχεδιασμένο για την ελληνική αγορά.'],
				],
			]),
			self::early_access_section(),
			self::faq_section(),
		];
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function business_components(): array
	{
		return [
			self::section_row('page_hero', [
				'title'       => 'Για επιχειρήσεις',
				'description' => 'Μια πλατφόρμα φτιαγμένη για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.',
			]),
			self::section_row('for_businesses', [
				'eyebrow'        => 'Για επιχειρήσεις',
				'title'          => 'Για εκπαιδευτικές επιχειρήσεις, coaches και διοργανωτές σεμιναρίων.',
				'description'    => 'Το ThesiBook έχει σχεδιαστεί για κάθε business που πουλάει θέσεις σε εκπαιδευτικά events.',
				'business_types' => [
					'Σεμινάρια',
					'Φροντιστήρια',
					'Ακαδημίες',
					'Workshops',
					'Yoga / Pilates studios',
					'Personal trainers',
					'Επαγγελματική κατάρτιση',
					'Ιδιωτικά μαθήματα',
					'Online courses',
				],
				'cta'            => self::link('Θέλω να μπω στην πλατφόρμα', self::frontend_url('/contact')),
			]),
			self::section_row('icon_grid', [
				'variant' => 'benefits',
				'eyebrow' => 'Οφέλη',
				'title'   => 'Γιατί να χρησιμοποιήσεις το ThesiBook;',
				'items'   => [
					['icon' => 'PhoneOff', 'title' => 'Λιγότερα τηλεφωνήματα', 'description' => 'Οι κρατήσεις γίνονται online, αυτόματα.'],
					['icon' => 'Sparkles', 'title' => 'Καλύτερη οργάνωση', 'description' => 'Κάθε event, κράτηση και πελάτης σε ένα μέρος.'],
					['icon' => 'TrendingUp', 'title' => 'Περισσότερες κρατήσεις', 'description' => 'Διαθεσιμότητα 24/7 σημαίνει περισσότερη ζήτηση.'],
					['icon' => 'Globe', 'title' => 'Επαγγελματική online παρουσία', 'description' => 'Σύγχρονη σελίδα για κάθε σεμινάριο.'],
					['icon' => 'Megaphone', 'title' => 'Εύκολη προβολή σε νέους πελάτες', 'description' => 'Αναζήτηση από χιλιάδες χρήστες στην Ελλάδα.'],
					['icon' => 'Heart', 'title' => 'Ιδανικό για μικρές και μεσαίες επιχειρήσεις', 'description' => 'Σχεδιασμένο για την ελληνική αγορά.'],
				],
			]),
			self::early_access_section(),
		];
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function how_it_works_components(): array
	{
		return [
			self::section_row('page_hero', [
				'title'       => 'Πώς λειτουργεί',
				'description' => 'Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 απλά βήματα.',
			]),
			self::section_row('steps', [
				'eyebrow' => 'Πώς λειτουργεί',
				'title'   => 'Από το στήσιμο μέχρι την πρώτη κράτηση, σε 3 βήματα.',
				'steps'   => [
					[
						'number'      => '01',
						'title'       => 'Δημιουργείς το προφίλ σου',
						'description' => 'Στήσε την επιχείρησή σου σε λίγα λεπτά με logo, περιγραφή και στοιχεία επικοινωνίας.',
					],
					[
						'number'      => '02',
						'title'       => 'Προσθέτεις μαθήματα και θέσεις',
						'description' => 'Όρισε ημερομηνίες, χωρητικότητα, τιμή και πληροφορίες για κάθε σεμινάριο.',
					],
					[
						'number'      => '03',
						'title'       => 'Οι πελάτες κάνουν κράτηση online',
						'description' => 'Δέχεσαι κρατήσεις 24/7, αυτόματες επιβεβαιώσεις και υπενθυμίσεις.',
					],
				],
			]),
			self::section_row('app_preview', [
				'eyebrow'     => 'App preview',
				'title'       => 'Μια εμπειρία σχεδιασμένη για κινητό.',
				'description' => 'Από την ανακάλυψη του σεμιναρίου μέχρι την επιλογή θέσης — όλα σε λίγα tap.',
				'discover'    => [
					'brand'             => 'ThesiBook',
					'searchPlaceholder' => 'Αναζήτηση σεμιναρίων',
					'categories'        => ['Όλα', 'Business', 'Yoga', 'Design'],
					'cards'             => [
						['title' => 'Digital Marketing', 'location' => 'Αθήνα', 'seats' => '12 θέσεις'],
						['title' => 'Leadership Workshop', 'location' => 'Θεσσαλονίκη', 'seats' => '8 θέσεις'],
					],
				],
				'details'     => [
					'topBarLabel'  => 'Λεπτομέρειες',
					'title'        => 'Digital Marketing Seminar',
					'subtitle'     => 'Αθήνα · 24 Μαΐου · 10:00 — 14:00',
					'description'  => 'Μάθε τις βασικές στρατηγικές του ψηφιακού μάρκετινγκ.',
					'speakerLabel' => 'Εισηγητής',
					'speakerValue' => 'Γιάννης Παπαδόπουλος',
					'ctaLabel'     => 'Επιλογή θέσης · €49',
				],
				'seat_picker' => [
					'topBarLabel'    => 'Επιλογή θέσης',
					'totalSeats'     => 30,
					'takenIndexes'   => [2, 9, 13, 18, 22],
					'selectedIndex'  => 14,
					'availableLabel' => 'Διαθ.',
					'takenLabel'     => 'Κατ.',
					'selectedLabel'  => 'Επιλ.',
					'selectedSeat'   => 'A5',
					'priceLabel'     => 'Τιμή',
					'price'          => '€49',
					'ctaLabel'       => 'Συνέχεια',
				],
			]),
			self::early_access_section(),
		];
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function features_components(): array
	{
		return [
			self::section_row('page_hero', [
				'title'       => 'Λειτουργίες',
				'description' => 'Όλα όσα χρειάζεσαι για να οργανώσεις και να γεμίσεις τα σεμινάριά σου.',
			]),
			self::section_row('icon_grid', [
				'variant' => 'features',
				'eyebrow' => 'Λειτουργίες',
				'title'   => 'Όλα όσα χρειάζεσαι για να γεμίσεις τις θέσεις σου.',
				'items'   => [
					['icon' => 'CalendarCheck', 'title' => 'Online κρατήσεις', 'description' => 'Οι πελάτες κρατούν θέση 24/7 χωρίς τηλεφωνήματα.'],
					['icon' => 'Layers', 'title' => 'Διαχείριση διαθέσιμων θέσεων', 'description' => 'Όρισε χωρητικότητα, λίστες αναμονής και τιμές.'],
					['icon' => 'CalendarDays', 'title' => 'Ημερολόγιο σεμιναρίων', 'description' => 'Όλα τα μαθήματα και workshops σε ένα view.'],
					['icon' => 'Building2', 'title' => 'Προφίλ επιχείρησης', 'description' => 'Επαγγελματική παρουσία με branding και πληροφορίες.'],
					['icon' => 'FileText', 'title' => 'Σελίδα για κάθε σεμινάριο', 'description' => 'Περιγραφή, εισηγητής, φωτογραφίες και CTA.'],
					['icon' => 'Bell', 'title' => 'Notifications', 'description' => 'Αυτόματες υπενθυμίσεις και επιβεβαιώσεις.'],
					['icon' => 'Smartphone', 'title' => 'Mobile-friendly', 'description' => 'Άψογη εμπειρία σε κινητό και tablet.'],
					['icon' => 'Search', 'title' => 'Αναζήτηση χρηστών', 'description' => 'Φιλτράρισμα ανά περιοχή, κατηγορία και ημερομηνία.'],
				],
			]),
			self::section_row('solution', [
				'eyebrow'          => 'Η λύση',
				'title'            => 'Το ThesiBook οργανώνει τις κρατήσεις σου σε',
				'highlighted_text' => 'ένα μέρος',
				'description'      => 'Όλη η δραστηριότητα της επιχείρησής σου — εκπαιδευτικά events, διαθέσιμες θέσεις, πελάτες, πληρωμές — σε μία απλή, σύγχρονη πλατφόρμα.',
				'bullets'          => [
					'Δημιουργείς εκπαιδευτικά events και σεμινάρια',
					'Ορίζεις διαθέσιμες θέσεις και τιμές',
					'Διαχειρίζεσαι κρατήσεις σε ένα μέρος',
					'Δέχεσαι αιτήματα από νέους πελάτες',
					'Προωθείς τα μαθήματά σου online',
				],
				'weekdays'         => ['ΔΕΥ', 'ΤΡΙ', 'ΤΕΤ', 'ΠΕΜ', 'ΠΑΡ', 'ΣΑΒ', 'ΚΥΡ'],
				'calendar'         => [
					'total_cells'    => 35,
					'start_offset'   => 2,
					'month_days'     => 31,
					'active_day'     => 22,
					'available_days' => [5, 9, 14, 17, 22, 26, 29],
				],
				'events'           => [
					['title' => 'Thesis Writing Workshop', 'schedule' => '10:00 — 12:00', 'occupancy' => '24/40'],
					['title' => 'Research Methodology', 'schedule' => '13:00 — 15:00', 'occupancy' => '18/30'],
					['title' => 'Statistical Analysis', 'schedule' => '16:00 — 18:00', 'occupancy' => '20/25'],
				],
			]),
			self::faq_section(),
		];
	}

	/**
	 * @return list<array<string, mixed>>
	 */
	private static function contact_components(): array
	{
		return [
			self::section_row('page_hero', [
				'title'       => 'Επικοινωνία',
				'description' => 'Πες μας περισσότερα για την επιχείρησή σου και θα σου απαντήσουμε σύντομα.',
			]),
			self::section_row('contact_cards', [
				'cards' => [
					[
						'icon'  => 'Mail',
						'title' => 'Email',
						'value' => 'hello@thesibook.gr',
						'href'  => 'mailto:hello@thesibook.gr',
					],
					[
						'icon'  => 'MessageCircle',
						'title' => 'Support',
						'value' => 'Συνήθως απαντάμε σε 24 ώρες',
						'href'  => '#',
					],
					[
						'icon'  => 'MapPin',
						'title' => 'Έδρα',
						'value' => 'Αθήνα, Ελλάδα',
						'href'  => '#',
					],
				],
			]),
			self::early_access_section(),
		];
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function early_access_section(): array
	{
		return self::section_row('early_access', [
			'eyebrow'        => 'Early access',
			'title'          => 'Θέλεις να είσαι από τους πρώτους στο ThesiBook;',
			'description'    => 'Συμπλήρωσε τα στοιχεία σου και θα επικοινωνήσουμε μαζί σου για early access στην πλατφόρμα.',
			'benefits'       => [
				'Προτεραιότητα στο launch',
				'Δωρεάν onboarding',
				'Ειδικές τιμές για early adopters',
			],
			'business_types' => [
				'Σεμινάρια',
				'Φροντιστήριο',
				'Ακαδημία',
				'Workshop',
				'Yoga / Pilates',
				'Personal trainer',
				'Επαγγελματική κατάρτιση',
				'Ιδιωτικά μαθήματα',
				'Online courses',
				'Άλλο',
			],
			'form'           => [
				'nameLabel'               => 'Ονοματεπώνυμο',
				'namePlaceholder'         => 'Μαρία Παπαδοπούλου',
				'emailLabel'              => 'Email',
				'emailPlaceholder'        => 'you@email.gr',
				'phoneLabel'              => 'Τηλέφωνο',
				'phonePlaceholder'        => '69x xxx xxxx',
				'companyLabel'            => 'Όνομα επιχείρησης',
				'companyPlaceholder'      => 'π.χ. Athena Academy',
				'businessTypeLabel'       => 'Τύπος επιχείρησης',
				'businessTypePlaceholder' => 'Επίλεξε...',
				'messageLabel'            => 'Μήνυμα',
				'messagePlaceholder'      => 'Πες μας λίγα λόγια για την επιχείρησή σου...',
			],
			'submit_label'         => 'Ζήτησε πρόσβαση',
			'success_title'        => 'Ευχαριστούμε!',
			'success_description'  => 'Λάβαμε το αίτημά σου. Θα σε ενημερώσουμε σύντομα στο email σου.',
			'error_description'    => 'Προέκυψε πρόβλημα κατά την αποστολή. Δοκίμασε ξανά.',
		]);
	}

	/**
	 * @return array<string, mixed>
	 */
	private static function faq_section(): array
	{
		return self::section_row('faq', [
			'eyebrow' => 'FAQ',
			'title'   => 'Συχνές ερωτήσεις',
			'items'   => [
				[
					'question' => 'Τι είναι το ThesiBook;',
					'answer'   => 'Το ThesiBook είναι μια ελληνική πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις, σεμινάρια, workshops, ακαδημίες και coaches. Βοηθά τις επιχειρήσεις να δέχονται online κρατήσεις και να οργανώνουν διαθέσιμες θέσεις.',
				],
				[
					'question' => 'Για ποιες επιχειρήσεις είναι κατάλληλο;',
					'answer'   => 'Για κάθε business που οργανώνει εκπαιδευτικά events: φροντιστήρια, ακαδημίες, διοργανωτές σεμιναρίων, coaches, yoga/pilates studios, personal trainers, επαγγελματική κατάρτιση, ιδιωτικά μαθήματα και online courses.',
				],
				[
					'question' => 'Μπορώ να διαχειρίζομαι διαθέσιμες θέσεις;',
					'answer'   => 'Ναι. Ορίζεις χωρητικότητα ανά event, βλέπεις σε real-time πόσες θέσεις έχουν κρατηθεί και διαχειρίζεσαι λίστες αναμονής.',
				],
				[
					'question' => 'Θα υπάρχει σελίδα για την επιχείρησή μου;',
					'answer'   => 'Ναι. Κάθε επιχείρηση έχει το δικό της προφίλ, καθώς και ξεχωριστή σελίδα για κάθε σεμινάριο ή μάθημα με όλες τις πληροφορίες.',
				],
				[
					'question' => 'Είναι κατάλληλο για σεμινάρια και workshops;',
					'answer'   => 'Απολύτως. Το ThesiBook έχει σχεδιαστεί ειδικά για εκπαιδευτικά events όπως σεμινάρια, workshops και μαθήματα.',
				],
				[
					'question' => 'Πότε θα είναι διαθέσιμη η πλατφόρμα;',
					'answer'   => 'Είμαστε σε φάση early access. Συμπλήρωσε τη φόρμα για να ενημερωθείς πρώτος και να εξασφαλίσεις προνομιακή πρόσβαση.',
				],
			],
		]);
	}

	private static function ensure_page(string $slug, string $title): int
	{
		$post = get_page_by_path($slug, OBJECT, 'page');
		if ($post instanceof WP_Post) {
			wp_update_post(
				[
					'ID'         => $post->ID,
					'post_title' => $title,
					'post_status' => 'publish',
				]
			);
			update_post_meta($post->ID, '_wp_page_template', 'templates/builder.php');

			return (int) $post->ID;
		}

		$id = wp_insert_post(
			[
				'post_type'   => 'page',
				'post_status' => 'publish',
				'post_title'  => $title,
				'post_name'   => $slug,
			],
			true
		);

		if (is_wp_error($id) || ! $id) {
			return 0;
		}

		update_post_meta((int) $id, '_wp_page_template', 'templates/builder.php');

		return (int) $id;
	}

	private static function remove_legacy_pages(): void
	{
		foreach (self::LEGACY_SLUGS as $slug) {
			$post = get_page_by_path($slug, OBJECT, 'page');
			if (! $post instanceof WP_Post) {
				continue;
			}

			wp_trash_post($post->ID);
		}
	}

	private static function seed_main_menu(): void
	{
		$menu_name = 'Main Menu';
		$menu      = wp_get_nav_menu_object($menu_name);
		$menu_id   = $menu instanceof WP_Term ? (int) $menu->term_id : 0;

		if ($menu_id <= 0) {
			$created = wp_create_nav_menu($menu_name);
			if (is_wp_error($created)) {
				return;
			}
			$menu_id = (int) $created;
		}

		$existing = wp_get_nav_menu_items($menu_id);
		if (is_array($existing)) {
			foreach ($existing as $item) {
				if ($item instanceof WP_Post) {
					wp_delete_post($item->ID, true);
				}
			}
		}

		$links = [
			['slug' => 'home', 'title' => 'Αρχική'],
			['slug' => 'business', 'title' => 'Για επιχειρήσεις'],
			['slug' => 'how-it-works', 'title' => 'Πώς λειτουργεί'],
			['slug' => 'features', 'title' => 'Λειτουργίες'],
			['slug' => 'contact', 'title' => 'Επικοινωνία'],
		];

		foreach ($links as $link) {
			$page = get_page_by_path($link['slug'], OBJECT, 'page');
			if (! $page instanceof WP_Post) {
				continue;
			}

			wp_update_nav_menu_item(
				$menu_id,
				0,
				[
					'menu-item-title'     => $link['title'],
					'menu-item-object'    => 'page',
					'menu-item-object-id' => $page->ID,
					'menu-item-type'      => 'post_type',
					'menu-item-status'    => 'publish',
				]
			);
		}

		$locations               = get_theme_mod('nav_menu_locations', []);
		$locations['menu-main']  = $menu_id;
		set_theme_mod('nav_menu_locations', $locations);
	}

	public static function seed_options_defaults(): void
	{
		self::seed_branding_options();
	}

	private static function seed_branding_options(): void
	{
		if (! function_exists('update_field')) {
			return;
		}

		$branding = [
			'email'             => 'hello@thesibook.gr',
			'telephone'         => '',
			'address'           => 'Αθήνα, Ελλάδα',
			'working_hours'     => 'Δευτέρα — Παρασκευή · 09:00 — 18:00',
			'footer_text'       => '<p>© ThesiBook — Με επιφύλαξη παντός δικαιώματος</p>',
			'footer_text2'      => '<p>Κλείσε τη θέση σου <strong>εύκολα</strong></p>',
			'hide_social_icons' => 1,
		];

		foreach ($branding as $key => $value) {
			update_field($key, $value, 'option');
		}

		update_option('blogname', 'ThesiBook');
		update_option(
			'blogdescription',
			'Η νέα πλατφόρμα κρατήσεων για εκπαιδευτικές επιχειρήσεις στην Ελλάδα.'
		);
	}
}

if (defined('WP_CLI') && WP_CLI) {
	WP_CLI::add_command(
		'webcode seed',
		static function (): void {
			$results = Webcode_Content_Seeder::run();
			foreach ($results as $slug => $status) {
				WP_CLI::log(sprintf('%s: %s', $slug, $status));
			}
			WP_CLI::success('ThesiBook page builder seed complete.');
		}
	);

	WP_CLI::add_command(
		'webcode seed-options',
		static function (): void {
			Webcode_Content_Seeder::seed_options_defaults();
			WP_CLI::success('ThesiBook ACF options applied.');
		}
	);
}
