<?php
$page_builder = get_field('components');

if ($page_builder) :
    foreach ($page_builder as $layout) : ?>

 
        <?php if ($layout['acf_fc_layout'] == 'hero_slider') : ?>
            <?php get_template_part('elements/hero-slider', '', array('key' => 'hero_slider', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'delivery_links') : ?>
            <?php get_template_part('elements/delivery-links', '', array('key' => 'delivery_links', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'main_content') : ?>
            <?php get_template_part('elements/main-content', '', array('key' => 'main_content', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'zigzag') : ?>
            <?php get_template_part('elements/zigzag', '', array('key' => 'zigzag', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'simple_text_element') : ?>
            <?php get_template_part('elements/simple-text', '', array('key' => 'simple_text_element', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'banner_element') : ?>
            <?php //var_dump($layout); 
            ?>
            <?php get_template_part('elements/banner-element', '', array('key' => 'banner_element', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'carousel') : ?>
             <?php get_template_part('elements/carousel', '', array('key' => 'carousel', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'two_images') : ?>
            <?php get_template_part('elements/two-images', '', array('key' => 'two_images', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'gallery') : ?>
            <?php get_template_part('elements/gallery', '', array('key' => 'gallery', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'line_separator') : ?>
            <?php get_template_part('elements/line-separator', '', array('key' => 'line_separator', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'wines_and_varieties') : ?>
            <?php get_template_part('elements/wines-and-varieties', '', array('key' => 'wines_and_varieties', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'wine_map') : ?>
            <?php get_template_part('elements/wine-map', '', array('key' => 'wine_map', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'map_container') : ?>
            <?php get_template_part('elements/map-container', '', array('key' => 'map_container', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'menu_pdf') : ?>
            <?php get_template_part('elements/menu-pdf', '', array('key' => 'menu_pdf', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'contact_form') : ?>
            <?php get_template_part('elements/contact-form', '', array('key' => 'contact_form', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'video_background') : ?>
            <?php get_template_part('elements/video-background', '', array('key' => 'video_background', 'data' => $layout)); ?>
        <?php endif; ?>

        <?php if ($layout['acf_fc_layout'] == 'services_grid') : ?>
            <?php get_template_part('elements/services-grid', '', array('key' => 'services_grid', 'data' => $layout)); ?>
        <?php endif; ?>
 
    <?php endforeach; ?>
<?php endif; ?>
<?php
