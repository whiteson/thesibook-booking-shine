</div><!-- #content -->
</div><!-- #page -->

<?php
$social_icons = get_field('social_items', 'options');
$address = trim((string) get_field('address', 'options'));
$email = trim((string) get_field('email', 'options'));
$telephone = trim((string) get_field('telephone', 'options'));
$footer_text = get_field('footer_text', 'options');
$footer_text2 = get_field('footer_text2', 'options');
$footer_text_image_left = get_field('footer_text_image_left', 'options');
$footer_text_image_right = get_field('footer_text_image_right', 'options');
$hide_social_icons = get_field('hide_social_icons', 'options');

if ($address === '') {
	$address = '10 Anson Road, #43-15, International Plaza, Singapore, 079903';
}
if ($telephone === '') {
	$telephone = '+65 6227 0838';
}
if ($email === '' || strpos($email, 'agios.com') === false) {
	$email = 'operations@agios.com.sg';
}

$nospacetelephone = preg_replace('/\s+/', '', $telephone);
$copyright_text = trim(wp_strip_all_tags((string) $footer_text));
if ($copyright_text === '') {
	$copyright_text = get_bloginfo('name');
}

$footer_menu_args = array(
	'menu_class' => 'navbar-nav',
	'container' => false,
	'fallback_cb' => false,
	'walker' => new BEM_Walker_Nav_Menu(),
);
?>

<footer class="site-footer">
	<div class="container-fluid">

		<div class="row site-footer__top align-items-start">
			<div class="col-lg-4 col-md-12">
				<div class="site-footer__logo">
					<?php
					$footer_logo = get_field('footer_logo', 'options');
					$header_logo = get_field('header_logo', 'options');
					$logo = $footer_logo ?: $header_logo;

					if ($logo && isset($logo['url'])) : ?>
						<a href="<?php echo esc_url(home_url('/')); ?>">
							<img src="<?php echo esc_url($logo['url']); ?>"
								 alt="<?php echo esc_attr($logo['alt'] ?: get_bloginfo('name')); ?>"
								 class="site-footer__logo-img">
						</a>
					<?php else : ?>
						<a href="<?php echo esc_url(home_url('/')); ?>">
							<?php svg('logo'); ?>
						</a>
					<?php endif; ?>
				</div>
			</div>

			<div class="col-lg-8 col-md-12">
				<nav class="site-footer__menu" aria-label="<?php esc_attr_e('Footer navigation', 'webcode'); ?>">
					<?php
					if (has_nav_menu('menu-footer')) {
						wp_nav_menu(array_merge($footer_menu_args, array(
							'theme_location' => 'menu-footer',
							'menu_id' => 'menu-footer',
						)));
					} elseif (has_nav_menu('menu-main')) {
						wp_nav_menu(array_merge($footer_menu_args, array(
							'theme_location' => 'menu-main',
							'menu_id' => 'menu-footer',
						)));
					}
					?>
				</nav>
			</div>
		</div>

		<div class="row site-footer__middle align-items-start mt-4 mt-lg-5">
			<?php if (!$hide_social_icons && $social_icons) : ?>
				<div class="col-lg-4 col-md-6 mb-4 mb-md-0">
					<div class="site-footer__social">
						<div class="site-footer__social__label"><?php esc_html_e('Follow us', 'webcode'); ?></div>
						<div class="site-footer__social__icons">
							<?php foreach ($social_icons as $icon) : ?>
								<a href="<?php echo esc_url($icon['link']); ?>" target="_blank" rel="noopener noreferrer" aria-label="<?php echo esc_attr($icon['icon']); ?>">
									<?php echo svg($icon['icon']); ?>
								</a>
							<?php endforeach; ?>
						</div>
					</div>
				</div>
			<?php endif; ?>

			<div class="col-lg-<?php echo (!$hide_social_icons && $social_icons) ? '8' : '12'; ?> col-md-<?php echo (!$hide_social_icons && $social_icons) ? '6' : '12'; ?>">
				<div class="site-footer__contact">
					<div class="site-footer__contact__label"><?php esc_html_e('Contact info', 'webcode'); ?></div>

					<?php if ($address) : ?>
						<div class="site-footer__contact__item">
							<div class="site-footer__contact__item__label"><?php esc_html_e('Address', 'webcode'); ?></div>
							<div class="site-footer__contact__item__value"><?php echo esc_html($address); ?></div>
						</div>
					<?php endif; ?>

					<?php if ($telephone) : ?>
						<div class="site-footer__contact__item">
							<div class="site-footer__contact__item__label"><?php esc_html_e('Phone', 'webcode'); ?></div>
							<div class="site-footer__contact__item__value">
								<a class="site-footer__link" href="tel:<?php echo esc_attr($nospacetelephone); ?>"><?php echo esc_html($telephone); ?></a>
							</div>
						</div>
					<?php endif; ?>

					<?php if ($email) : ?>
						<div class="site-footer__contact__item">
							<div class="site-footer__contact__item__label"><?php esc_html_e('Email', 'webcode'); ?></div>
							<div class="site-footer__contact__item__value">
								<a class="site-footer__link" href="mailto:<?php echo esc_attr($email); ?>"><?php echo esc_html($email); ?></a>
							</div>
						</div>
					<?php endif; ?>
				</div>
			</div>
		</div>

		<?php if ($footer_text2 || !empty($footer_text_image_left['ID']) || !empty($footer_text_image_right['ID'])) : ?>
			<div class="row site-footer__extra align-items-center justify-content-center mt-4">
				<?php if ($footer_text2) : ?>
					<div class="col-md-10 text-center text-md-end text-small2">
						<?php echo $footer_text2; ?>
					</div>
				<?php endif; ?>

				<?php if (!empty($footer_text_image_left['ID']) || !empty($footer_text_image_right['ID'])) : ?>
					<div class="col-md-5 justify-content-center align-items-center">
						<?php if (!empty($footer_text_image_left['ID'])) : ?>
							<div class="site-footer__images">
								<?php echo wp_get_attachment_image($footer_text_image_left['ID'], 'full', false); ?>
							</div>
						<?php endif; ?>
					</div>
					<div class="col-md-5 justify-content-center align-items-center">
						<?php if (!empty($footer_text_image_right['ID'])) : ?>
							<div class="site-footer__images">
								<?php echo wp_get_attachment_image($footer_text_image_right['ID'], 'full', false); ?>
							</div>
						<?php endif; ?>
					</div>
				<?php endif; ?>
			</div>
		<?php endif; ?>

		<div class="row site-footer__bottom mt-4 mt-lg-5">
			<div class="col-12">
				<div class="site-footer__wrapper">
					<div class="site-footer__copyright">
						&copy; <?php echo esc_html(gmdate('Y')); ?> <?php echo esc_html($copyright_text); ?>
					</div>

					<?php if (has_nav_menu('menu-footer-helper')) : ?>
						<nav class="site-footer__menu site-footer__menu--helper" aria-label="<?php esc_attr_e('Footer utility links', 'webcode'); ?>">
							<?php
							wp_nav_menu(array_merge($footer_menu_args, array(
								'theme_location' => 'menu-footer-helper',
								'menu_id' => 'menu-footer-helper',
							)));
							?>
						</nav>
					<?php endif; ?>
				</div>
			</div>
		</div>

	</div>
</footer>

<div class="back-to-top" id="back-to-top">
	<button class="back-to-top__button">
		<?php svg('carouselarrow'); ?>
	</button>
</div>



<?php wp_footer(); ?>

<script>
	var travelerNotebook = {
		ajaxurl: "<?php echo admin_url('admin-ajax.php'); ?>"
	};
</script>



<?php if ($_SERVER['CONTEXT_DOCUMENT_ROOT'] === '/Users/whiteson/www' || (defined('WP_CLI'))): ?>
	<script id="__bs_script__">
		//<![CDATA[
		(function() {
			try {
				var script = document.createElement('script');
				if ('async') {
					script.async = true;
				}
				script.src = 'http://HOST:3004/browser-sync/browser-sync-client.js?v=2.29.3'.replace("HOST", location.hostname);
				if (document.body) {
					document.body.appendChild(script);
				} else if (document.head) {
					document.head.appendChild(script);
				}
			} catch (e) {
				console.error("Browsersync: could not append script tag", e);
			}
		})()
		//]]>
	</script>
<?php endif; ?>
</body>

</html>
