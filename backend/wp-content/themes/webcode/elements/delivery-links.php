<?php
// Delivery Links Element
// Can be used in page builder or standalone

$key = isset($args['key']) ? $args['key'] : 'delivery_links';
$data = isset($args['data']) ? $args['data'] : array();

// Get ACF fields
$title = !empty($data[$key . '_title']) ? $data[$key . '_title'] : get_field($key . '_title');
$description = !empty($data[$key . '_description']) ? $data[$key . '_description'] : get_field($key . '_description');
$bg_image = !empty($data[$key . '_background_image']) ? $data[$key . '_background_image'] : get_field($key . '_background_image');
$efood_logo = !empty($data[$key . '_efood_logo']) ? $data[$key . '_efood_logo'] : get_field($key . '_efood_logo');
$efood_url = !empty($data[$key . '_efood_url']) ? $data[$key . '_efood_url'] : get_field($key . '_efood_url');
$efood_text = !empty($data[$key . '_efood_text']) ? $data[$key . '_efood_text'] : get_field($key . '_efood_text');
$wolt_logo = !empty($data[$key . '_wolt_logo']) ? $data[$key . '_wolt_logo'] : get_field($key . '_wolt_logo');
$wolt_url = !empty($data[$key . '_wolt_url']) ? $data[$key . '_wolt_url'] : get_field($key . '_wolt_url');
$wolt_text = !empty($data[$key . '_wolt_text']) ? $data[$key . '_wolt_text'] : get_field($key . '_wolt_text');

// Set defaults if empty
if (empty($title)) $title = __('Order Online', 'webcode');
if (empty($description)) $description = __('Order your favorite dishes from our restaurant through your preferred delivery platform', 'webcode');
if (empty($efood_url)) $efood_url = 'https://www.e-food.gr';
if (empty($wolt_url)) $wolt_url = 'https://wolt.com';
if (empty($efood_text)) $efood_text = __('Order from eFood', 'webcode');
if (empty($wolt_text)) $wolt_text = __('Order from Wolt', 'webcode');

// Get background image ID
$bg_image_id = null;
if (!empty($bg_image)) {
    if (is_array($bg_image)) {
        $bg_image_id = $bg_image['ID'];
    } elseif (is_numeric($bg_image)) {
        $bg_image_id = $bg_image;
    }
}

// Fallback to random image if no background image is set
if (empty($bg_image_id)) {
    function get_random_upload_image() {
        $args = array(
            'post_type' => 'attachment',
            'post_mime_type' => 'image',
            'post_status' => 'inherit',
            'posts_per_page' => -1,
            'orderby' => 'rand'
        );
        
        $images = get_posts($args);
        
        if (!empty($images)) {
            $random_image = $images[array_rand($images)];
            return $random_image->ID;
        }
        
        return null;
    }
    
    $bg_image_id = get_random_upload_image();
}

// Get logo IDs
$efood_logo_id = null;
if (!empty($efood_logo)) {
    if (is_array($efood_logo)) {
        $efood_logo_id = $efood_logo['ID'];
    } elseif (is_numeric($efood_logo)) {
        $efood_logo_id = $efood_logo;
    }
}

$wolt_logo_id = null;
if (!empty($wolt_logo)) {
    if (is_array($wolt_logo)) {
        $wolt_logo_id = $wolt_logo['ID'];
    } elseif (is_numeric($wolt_logo)) {
        $wolt_logo_id = $wolt_logo;
    }
}

// Fallback logo paths
$efood_logo_fallback = get_template_directory_uri() . '/assets/dist/img/efood-logo.png';
$wolt_logo_fallback = get_template_directory_uri() . '/assets/dist/img/wolt-logo.png';
?>

<section class="delivery-links delivery-links--parallax">
    <?php if ($bg_image_id): ?>
        <?php echo wp_get_attachment_image($bg_image_id, 'large', false, [
            'class' => 'delivery-links__background',
            'alt' => get_post_meta($bg_image_id, '_wp_attachment_image_alt', true) ?: 'Background image',
            'aria-hidden' => 'true'
        ]); ?>
    <?php else: ?>
        <img src="<?php echo esc_url(content_url() . '/uploads/2025/11/la-piccola-salumeria-1-1.jpg.webp'); ?>" 
             alt="Background image" 
             class="delivery-links__background">
    <?php endif; ?>
    <div class="delivery-links__overlay"></div>
    
    <div class="container">
        <div class="row">
            <div class="col-12">
                <div class="delivery-links__content">
                    <?php if ($title): ?>
                        <h3 class="delivery-links__title"><?php echo esc_html($title); ?></h3>
                    <?php endif; ?>
                    
                    <?php if ($description): ?>
                        <p class="delivery-links__description"><?php echo esc_html($description); ?></p>
                    <?php endif; ?>
                    
                    <div class="delivery-links__container">
                        <?php if ($efood_url): ?>
                            <a href="<?php echo esc_url($efood_url); ?>" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="delivery-links__item delivery-links__item--efood">
                                <?php if ($efood_logo_id): ?>
                                    <?php echo wp_get_attachment_image(
                                        $efood_logo_id,
                                        'full',
                                        false,
                                        [
                                            'class' => 'delivery-links__logo',
                                            'alt' => esc_attr($efood_text)
                                        ]
                                    ); ?>
                                <?php else: ?>
                                    <img src="<?php echo esc_url($efood_logo_fallback); ?>" 
                                         alt="<?php echo esc_attr($efood_text); ?>" 
                                         class="delivery-links__logo">
                                <?php endif; ?>
                                <?php if ($efood_text): ?>
                                    <span class="delivery-links__text"><?php echo esc_html($efood_text); ?></span>
                                <?php endif; ?>
                            </a>
                        <?php endif; ?>
                        
                        <?php if ($wolt_url): ?>
                            <a href="<?php echo esc_url($wolt_url); ?>" 
                               target="_blank" 
                               rel="noopener noreferrer" 
                               class="delivery-links__item delivery-links__item--wolt">
                                <?php if ($wolt_logo_id): ?>
                                    <?php echo wp_get_attachment_image(
                                        $wolt_logo_id,
                                        'full',
                                        false,
                                        [
                                            'class' => 'delivery-links__logo',
                                            'alt' => esc_attr($wolt_text)
                                        ]
                                    ); ?>
                                <?php else: ?>
                                    <img src="<?php echo esc_url($wolt_logo_fallback); ?>" 
                                         alt="<?php echo esc_attr($wolt_text); ?>" 
                                         class="delivery-links__logo">
                                <?php endif; ?>
                                <?php if ($wolt_text): ?>
                                    <span class="delivery-links__text"><?php echo esc_html($wolt_text); ?></span>
                                <?php endif; ?>
                            </a>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

