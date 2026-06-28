<?php

// CPT TAXONOMY

include('configure/cpt-taxonomy.php');

// Utilities

include('configure/utilities.php');

// CONFIG

include('configure/configure.php');

// MENU

include('configure/menu.php');

// JAVASCRIPT & CSS

include('configure/js-css.php');

// SHORTCODES

include('configure/shortcodes.php');

// ACF

include('configure/acf.php');

// HOOKS ADMIN

if (is_admin()) {
	include('configure/admin.php');
}

function remove_admin_bar()
{
	return false;
}

// add_filter('show_admin_bar', 'remove_admin_bar', PHP_INT_MAX);

function acf_load_icon_field_choices($field)
{
	// reset choices
	$field['choices'] = array();
	$field['choices'][0] = '';
	$directory    = get_template_directory() . '/assets/src/svg';
	$svgs = array_diff(scandir($directory), array('..', '.'));
	$svgsfilename = '';
	if (is_array($svgs)) {
		foreach ($svgs as $svgsfilename) {
			$svgsfilename = substr($svgsfilename, 0, -4);
			$field['choices'][$svgsfilename] = $svgsfilename;
		}
	} else {
		$field['choices'][$svgsfilename] = $directory;
	}
	return $field;
}
add_filter('acf/load_field/name=svg', 'acf_load_icon_field_choices');
add_filter('acf/load_field/name=icon', 'acf_load_icon_field_choices');




add_action('wpcf7_editor_panels', 'add_settings_in_content_form', 99999, 1);
add_action('wpcf7_admin_load', 'save_template_option');
function add_settings_in_content_form($panels)
{
	$panels_template = array('template-panel' =>
	array(
		'callback' => 'wpcf7_editor_panel_template_panel',
		'custom-template-file' => 'this is a custom panel, thank you .',
		'title' => 'Template-File'
	));
	// $panels =  $panels_template + $panels;//or
	$panels = array_merge($panels_template, $panels);
	return $panels;
}

function wpcf7_editor_panel_template_panel($post)
{ ?>
	<h2><?php echo esc_html(__('Template File', 'contact-form-7')); ?></h2>
	<?php generate_dynamic_select_element(); ?>
<?php
}

function generate_dynamic_select_element()
{
	$template_folder = get_stylesheet_directory() . '/forms/';
	$template_files = scandir($template_folder);

	$options = '<option value="">Select File</option>';

	$selected_file_template = get_post_meta(intval($_GET['post']), 'template_file', true);
	foreach ($template_files as $file) {
		if ($file == '.' || $file == '..') {
			continue;
		}
		if ($selected_file_template == $file) {
			$options .= '<option value="' . $file . '" selected>' . $file . '</option>';
		} else {
			$options .= '<option value="' . $file . '">' . $file . '</option>';
		}
	}
	echo '<select name="wpcf7-template_file">' . $options . '</select>';
}

function save_template_option()
{
	global $plugin_page;
	$action = wpcf7_current_action();
	if ('save' == $action) {
		$args = $_REQUEST;
		$id = isset($_POST['post_ID']) ? $_POST['post_ID'] : '-1';
		$args['id'] = $id;
		$args['template_file'] = isset($_POST['wpcf7-template_file'])
			? $_POST['wpcf7-template_file'] : '';
		update_post_meta($args['post'], 'template_file', $_POST['wpcf7-template_file']);
	}
}


add_filter('wpcf7_autop_or_not', '__return_false');
// define( 'WPCF7_LOAD_CSS', false );

/**
 * Allow SVG tags in WordPress editor and content
 */
function allow_svg_in_editor($init) {
    // Add SVG to allowed tags
    $init['extended_valid_elements'] = 'svg[*],path[*],g[*],circle[*],rect[*],line[*],polyline[*],polygon[*],ellipse[*]';
    return $init;
}
add_filter('tiny_mce_before_init', 'allow_svg_in_editor');

// Allow SVG in wp_kses_post
function allow_svg_kses($tags, $context) {
    if ($context === 'post') {
        $tags['svg'] = array(
            'width' => true,
            'height' => true,
            'viewbox' => true,
            'viewBox' => true,
            'fill' => true,
            'xmlns' => true,
            'class' => true,
            'style' => true,
            'id' => true
        );
        $tags['path'] = array(
            'd' => true,
            'fill' => true,
            'stroke' => true,
            'stroke-width' => true,
            'class' => true,
            'style' => true
        );
        $tags['i'] = array('class' => true);
        $tags['span'] = array(
            'class' => true,
            'style' => true
        );
    }
    return $tags;
}
add_filter('wp_kses_allowed_html', 'allow_svg_kses', 10, 2);


function add_not_front_page_body_class($classes)
{
	// Check if we're NOT on the front page
	if (!is_front_page()) {
		$classes[] = 'not-front-page';
	}
	return $classes;
}
add_filter('body_class', 'add_not_front_page_body_class');

/**
 * Contact Form Renderer
 * Renders Contact Form 7 forms using custom templates
 * 
 * @param object|int $contact_form Contact Form 7 form object or ID
 * @param string $template Template name (default: 'contact')
 * @param array $args Additional arguments to pass to template
 * @return void|false
 */
function contact_form_renderer($contact_form, $template = 'contact', $args = [])
{
	// global $contact_args = $args;
	// var_dump($args);
	if (is_object($contact_form)) {
		$form_id = $contact_form->ID;
	} else {
		if (is_int($contact_form)) {
			$form_id = $contact_form;
		} else {
			return false;
		}
	}
	if (true) {

		// $template_file = get_post_meta($form_id, 'template_file', true);
		// $template_folder = get_stylesheet_directory() . '/forms/';

		$contact_object = wpcf7_contact_form($form_id);
		$contact_form_properties = ($contact_object->get_properties());

		ob_start();
		get_template_part('forms/' . $template, '', $args);
		$form = ob_get_contents();
		ob_end_clean();

		$contact_form_properties['form'] = $form;
		$contact_object->set_properties($contact_form_properties);

		if (is_object($contact_object)) :
			echo $contact_object->form_html();
		endif;
	} else {
		return false;
	}
}
