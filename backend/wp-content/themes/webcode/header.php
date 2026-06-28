<!DOCTYPE html>
<html <?php language_attributes(); ?>>

<head>
	<meta charset="<?php bloginfo('charset'); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta http-equiv="X-UA-Compatible" content="IE=edge">

	<!-- Security Headers -->
	<!-- <meta http-equiv="X-Content-Type-Options" content="nosniff"> -->
	<!-- <meta http-equiv="X-Frame-Options" content="SAMEORIGIN"> -->
	<!-- <meta http-equiv="X-XSS-Protection" content="1; mode=block"> -->

	<!-- Performance Optimizations -->
	<!-- Add any external domains you use here for DNS prefetch -->

	<!-- Favicon -->
	<link rel="icon" type="image/x-icon" href="<?php echo get_template_directory_uri(); ?>/favicon.ico">
	<link rel="apple-touch-icon" href="<?php echo get_template_directory_uri(); ?>/apple-touch-icon.png">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
	<div id="page" class="site">
		<div class="container-fluid">
			<div class="row">
				<div class="col p-0">
					<header id="masthead" class="site-header" data-isvisibleeeee>
						<div class="site-header__wrapper">
							<div class="site-header__wrapper__logo">
								<a href="<?php echo get_home_url(); ?>">
									<?php 
									$header_logo = get_field('header_logo', 'options');
									if ($header_logo && isset($header_logo['url'])) : ?>
										<img src="<?php echo esc_url($header_logo['url']); ?>" 
											 alt="<?php echo esc_attr($header_logo['alt'] ?: get_bloginfo('name')); ?>" 
											 class="site-header__logo-img">
									<?php else : ?>
										<?php get_svg('logo'); ?>
									<?php endif; ?>
								</a>
							</div>

							<div class="site-header__wrapper__line-diagonal">
								<?php get_svg('line-diagonal'); ?>
							</div>

							<div class="site-header__wrapper__menu-btn">
								<div class="site-header__wrapper__menu-btn--open">
									<?php get_svg('menu-btn'); ?>
								</div>

								<div class="site-header__wrapper__menu-btn--close">
									<?php get_svg('menu-btn-close2'); ?>
								</div>
							</div>
						</div>

						<div class="site-header__navigation">
							<nav id="site-navigation" class="site-header__navigation__nav">
								<?php wp_nav_menu(array(
									'menu_class' => 'navbar-nav',
									'container_class' => 'navbar-nav__container',
									'theme_location' => 'menu-main',
									'menu_id' => 'menu-main',
									'walker' => new BEM_Walker_Nav_Menu
								)); ?>
							</nav>


							<div class="site-header__navigation--right">
								 

								<nav id="site-navigation-top-right" class="site-header__navigation__nav">
									<?php wp_nav_menu(array(
										'menu_class' => 'navbar-nav',
										'container_class' => 'navbar-nav__container',
										'theme_location' => 'menu-top-right',
										'menu_id' => 'menu-top-right',
										'walker' => new BEM_Walker_Nav_Menu
									)); ?>
								</nav>
								<div class="languages-switcher">
									<div class="languages-switcher__separator"></div>
									<?php
									$languages = apply_filters('wpml_active_languages', NULL, array('skip_missing' => 0, 'orderby' => 'code'));
									if (!empty($languages)) {
										foreach ($languages as $lang) {
											if (!$lang['active']) {
												// Show only the inactive language as a switch link
												echo '<a class="wpml-switch" href="' . esc_url($lang['url']) . '">';
												echo esc_html(strtoupper($lang['code']));
												echo '</a>';
											}
										}
									}
									?>
								</div>
							</div>
						</div>
					</header>
				</div>
			</div>


		</div>

		<div id="content" class="site-content">