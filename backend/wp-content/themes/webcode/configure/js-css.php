<?php
if (!function_exists('theme_scripts_localize')) {
	function theme_scripts_localize()
	{
		$ajax_url_params = array();

		wp_localize_script('theme', 'urls', [
			'home'   => home_url(),
			'ajax'   => add_query_arg($ajax_url_params, admin_url('admin-ajax.php')),
		]);
	}
}

function _add_javascript()
{
	wp_enqueue_script('theme', get_template_directory_uri() . '/assets/dist/js/main.js', array(), time(), true);
}
add_action('wp_enqueue_scripts', '_add_javascript', 100);
add_action('wp_enqueue_scripts', 'theme_scripts_localize', 120);


function _add_stylesheets()
{
	wp_enqueue_style('theme', get_template_directory_uri() . '/assets/dist/css/main.css', array(), time(), 'all');
}
add_action('wp_enqueue_scripts', '_add_stylesheets');
