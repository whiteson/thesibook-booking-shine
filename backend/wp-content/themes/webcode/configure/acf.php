<?php

// ACF functions here

/**
 * Simple Text content fields store structured plain text for headless sections
 * (pipe-delimited footer CTA, line-based metrics, marquee items, etc.).
 * Skip ACF WYSIWYG formatting so wpautop does not wrap values in <p> tags.
 *
 * @param mixed                      $check
 * @param mixed                      $value   Raw value from the database.
 * @param int|string                 $post_id
 * @param array<string, mixed>       $field
 * @param bool                       $escape_html
 * @return mixed
 */
function webcode_is_simple_text_content_field( array $field ): bool {
	$name = $field['name'] ?? '';

	return in_array( $name, [ 'content_1', 'content_2', 'simple_text_element_content_1', 'simple_text_element_content_2' ], true );
}

function webcode_simple_text_skip_wysiwyg_formatting( $check, $value, $post_id, $field, $escape_html ) {
	if ( ! is_array( $field ) || ! webcode_is_simple_text_content_field( $field ) ) {
		return $check;
	}

	if ( ! is_string( $value ) || $value === '' ) {
		return $value;
	}

	if ( $escape_html ) {
		return esc_html( $value );
	}

	// Match the wysiwyg field CDATA guard without running acf_the_content filters.
	return str_replace( ']]>', ']]&gt;', $value );
}
add_filter( 'acf/pre_format_value', 'webcode_simple_text_skip_wysiwyg_formatting', 10, 5 );

// add_filter('acf/settings/save_json', 'my_acf_json_save_point');
function my_acf_json_save_point( $path ) {
    // update path
    $path = get_stylesheet_directory() . '/acf-json';
    // return
    return $path;
    
}
 


if( function_exists('acf_add_options_page') ) {
	
	acf_add_options_page();
	
}

