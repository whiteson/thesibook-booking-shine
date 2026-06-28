<?php

/**
 * Map Container Element
 * 
 * Simple element to display wine road maps using shortcodes
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

$key = ($args['key']);
$data = ($args['data']);

$wine_road_ids = $data[$key . '_wine_road_ids'];
$map_height = $data[$key . '_map_height'];
$map_width = $data[$key . '_map_width'];
$show_multiple = $data[$key . '_show_multiple'];

// Check if wine road IDs are provided
if (empty($wine_road_ids)) {
    echo '<div class="map-container-error" style="padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; text-align: center; color: #6c757d;">';
    echo '<p><strong>Map Container</strong></p>';
    echo '<p>Please enter Wine Road ID(s) in the ACF field above.</p>';
    echo '<p><small>Example: 1,3,5 for multiple roads or just 1 for single road</small></p>';
    echo '</div>';
    return;
}

// Build shortcode
if ($show_multiple && !empty($wine_road_ids)) {
    // Multiple wine roads
    $shortcode = '[wine_roads_map ids="' . esc_attr($wine_road_ids) . '" height="' . esc_attr($map_height) . '" width="' . esc_attr($map_width) . '"]';
} else {
    // Single wine road (first ID if multiple provided)
    $first_id = explode(',', $wine_road_ids)[0] ?? '';
    if (!empty($first_id)) {
        $shortcode = '[wine_road_map id="' . esc_attr(trim($first_id)) . '" height="' . esc_attr($map_height) . '" width="' . esc_attr($map_width) . '"]';
    } else {
        echo '<div class="map-container-error" style="padding: 20px; background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 4px; text-align: center; color: #6c757d;">';
        echo '<p><strong>Map Container</strong></p>';
        echo '<p>Please enter a valid Wine Road ID.</p>';
        echo '</div>';
        return;
    }
}
?>

<style>
    .gm-style-moc {
        background: none !important;
        opacity: 0 !important;

    }

    .gm-style .gm-style-iw-d div {
        margin: 0 !important;
        line-height: 1.2 !important;
        color: #555 !important;
        font-family: 'Bague Round Pro';
    }

    .gm-style .gm-style-iw-d img {
        max-width: 100% !important;
        max-height: auto !important
    }

    .gm-style .gm-style-iw-d h3 {
        font-family: 'Bague Round Pro';
        color: var(--basic);
    }
</style>


<div class="map-container-element">
    <?php echo do_shortcode($shortcode); ?>
</div>