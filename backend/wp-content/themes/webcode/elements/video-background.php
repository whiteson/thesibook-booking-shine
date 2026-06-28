<?php
$key = $args['key'];
$data = $args['data'];

// Get all field values
$video = $data[$key . '_video'];
$poster_image = $data[$key . '_poster_image'];
$title = $data[$key . '_title'];
$subtitle = $data[$key . '_subtitle'];
$content = $data[$key . '_content'];
$button = $data[$key . '_button'];
$overlay = $data[$key . '_overlay'] ?? true;
$overlay_opacity = $data[$key . '_overlay_opacity'] ?? 50;
$autoplay = $data[$key . '_autoplay'] ?? true;
$loop = $data[$key . '_loop'] ?? true;
$muted = $data[$key . '_muted'] ?? true;
$hide_controls = $data[$key . '_hide_controls'] ?? true;
$content_position = $data[$key . '_content_position'] ?? 'center';
$height = $data[$key . '_height'] ?? 'large';
$include_contact_form = $data[$key . '_include_contact_form'] ?? false;
$contact_form = $include_contact_form ? ($data[$key . '_contact_form'] ?? null) : null;
$contact_form_title = $include_contact_form ? ($data[$key . '_contact_form_title'] ?? '') : '';
$contact_form_description = $include_contact_form ? ($data[$key . '_contact_form_description'] ?? '') : '';

// Generate unique ID for this video instance
$video_id = 'video-bg-' . uniqid();

// Height classes mapping
$height_classes = [
    'fullscreen' => 'video-background--fullscreen',
    'large' => 'video-background--large',
    'medium' => 'video-background--medium',
    'small' => 'video-background--small',
    'auto' => 'video-background--auto'
];

// Content position classes
$position_classes = [
    'center' => 'justify-content-center align-items-center',
    'top' => 'justify-content-center align-items-start',
    'bottom' => 'justify-content-center align-items-end',
    'left' => 'justify-content-start align-items-center',
    'right' => 'justify-content-end align-items-center'
];

$height_class = $height_classes[$height] ?? $height_classes['large'];
$position_class = $position_classes[$content_position] ?? $position_classes['center'];

// Overlay opacity style
$overlay_style = $overlay ? 'style="background-color: rgba(0, 0, 0, ' . ($overlay_opacity / 100) . ');"' : '';
?>

<div class="video-background <?php echo esc_attr($height_class); ?><?php echo $hide_controls ? ' video-background--hide-controls' : ''; ?>" 
     data-video-id="<?php echo esc_attr($video_id); ?>"
     data-autoplay="<?php echo $autoplay ? 'true' : 'false'; ?>"
     data-loop="<?php echo $loop ? 'true' : 'false'; ?>"
     data-muted="<?php echo $muted ? 'true' : 'false'; ?>"
     data-hide-controls="<?php echo $hide_controls ? 'true' : 'false'; ?>">
    <?php if ($video && isset($video['url'])) : ?>
        <div class="video-background__wrapper">
            <video 
                id="<?php echo esc_attr($video_id); ?>" 
                class="video-background__video" 
                <?php if ($poster_image && isset($poster_image['url'])) : ?>
                    poster="<?php echo esc_url($poster_image['url']); ?>"
                <?php endif; ?>
                <?php echo $autoplay ? 'autoplay' : ''; ?>
                <?php echo $loop ? 'loop' : ''; ?>
                <?php echo $muted ? 'muted' : ''; ?>
                playsinline
                style="opacity: 0;"
            >
                <source src="<?php echo esc_url($video['url']); ?>" type="video/mp4">
                Your browser does not support the video tag.
            </video>
            
            <?php if ($overlay) : ?>
                <div class="video-background__overlay" <?php echo $overlay_style; ?>></div>
            <?php endif; ?>
            
            <div class="video-background__content d-flex flex-column <?php echo esc_attr($position_class); ?>">
                <div class="container">
                    <div class="row align-items-start">
                        <!-- Left Column: Content -->
                        <div class="col-12 <?php echo $include_contact_form && $contact_form ? 'col-lg-6' : 'col-lg-12'; ?>">
                            <div class="video-background__content-wrapper">
                                <?php if ($title) : ?>
                                    <h2 class="video-background__title title--h2">
                                        <?php echo esc_html($title); ?>
                                    </h2>
                                <?php endif; ?>
                                
                                <?php if ($subtitle) : ?>
                                    <h3 class="video-background__subtitle subtitle">
                                        <?php echo esc_html($subtitle); ?>
                                    </h3>
                                <?php endif; ?>
                                
                                <?php if ($content) : ?>
                                    <div class="video-background__text">
                                        <?php 
                                        // Allow SVG and other HTML tags in content
                                        $allowed_html = wp_kses_allowed_html('post');
                                        $allowed_html['svg'] = array(
                                            'width' => true,
                                            'height' => true,
                                            'viewbox' => true,
                                            'viewBox' => true,
                                            'fill' => true,
                                            'xmlns' => true,
                                            'class' => true,
                                            'style' => true
                                        );
                                        $allowed_html['path'] = array(
                                            'd' => true,
                                            'fill' => true,
                                            'stroke' => true,
                                            'stroke-width' => true,
                                            'class' => true
                                        );
                                        $allowed_html['i'] = array();
                                        $allowed_html['span'] = array(
                                            'class' => true,
                                            'style' => true
                                        );
                                        echo wp_kses($content, $allowed_html); 
                                        ?>
                                    </div>
                                <?php endif; ?>
                                
                                <?php if ($button && isset($button['url'])) : ?>
                                    <div class="video-background__button mt-4">
                                        <?php get_template_part('elements/button', '', array('link' => $button, 'class' => 'primary')); ?>
                                    </div>
                                <?php endif; ?>
                            </div>
                        </div>
                        
                        <!-- Right Column: Contact Form -->
                        <?php if ($include_contact_form && $contact_form) : ?>
                            <div class="col-12 col-lg-6">
                                <div class="video-background__contact-form">
                                    <?php
                                    // Prepare data for contact form template
                                    $form_id = is_object($contact_form) ? $contact_form->ID : (is_array($contact_form) ? ($contact_form['ID'] ?? $contact_form) : $contact_form);
                                    
                                    // Use get_template_part to include the contact form element
                                    // Pass data in the format expected by contact-form.php
                                    get_template_part('elements/contact-form', '', array(
                                        'key' => $key,
                                        'data' => array(
                                            $key . '_contact_form' => $form_id,
                                            $key . '_title' => $contact_form_title,
                                            $key . '_description' => $contact_form_description,
                                            $key . '_form_style' => 'default',
                                            $key . '_form_template' => 'contact'
                                        )
                                    ));
                                    ?>
                                </div>
                            </div>
                        <?php endif; ?>
                    </div>
                </div>
            </div>
        </div>
    <?php endif; ?>
</div>

