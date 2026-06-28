<?php
// Contact Form Element
// Can be used in page builder or standalone

$key = isset($args['key']) ? $args['key'] : '';
$data = isset($args['data']) ? $args['data'] : array();

// Get Contact Form 7 form from ACF
$contact_form = !empty($data[$key . '_contact_form']) ? $data[$key . '_contact_form'] : get_field($key . '_contact_form');

// Get optional title and description from ACF
$title = !empty($data[$key . '_title']) ? $data[$key . '_title'] : '';
$description = !empty($data[$key . '_description']) ? $data[$key . '_description'] : '';
$form_style = !empty($data[$key . '_form_style']) ? $data[$key . '_form_style'] : 'default';
$form_template = !empty($data[$key . '_form_template']) ? $data[$key . '_form_template'] : 'contact';
?>

<section class="contact-form-element contact-form-element--<?php echo esc_attr($form_style); ?>">
    <div class="container">
        <div class="row justify-content-center">
            <div class="col-12">
                <?php if ($title): ?>
                    <h2 class="contact-form-element__title"><?php echo ($title); ?></h2>
                <?php endif; ?>
                
                <?php if ($description): ?>
                    <p class="contact-form-element__description"><?php echo ($description); ?></p>
                <?php endif; ?>
                
                <div class="contact-form-element__form">
                    <?php 
                    if ($contact_form && function_exists('contact_form_renderer')) {
                        // Use the custom renderer function
                        // var_dump($contact_form);
                        // var_dump($form_template);
                        contact_form_renderer($contact_form, $form_template);
                    } elseif ($contact_form) {
                        // Fallback: use Contact Form 7's built-in function
                        if (function_exists('wpcf7_contact_form')) {
                            $form_object = wpcf7_contact_form($contact_form);
                            if ($form_object) {
                                echo $form_object->form_html();
                            }
                        }
                    } else {
                        echo '<p>Please select a contact form.</p>';
                    }
                    ?>
                </div>
            </div>
        </div>
    </div>
</section>

