<?php get_header(); ?>

<?php while (have_posts()) : the_post(); ?>
    <?php
    $components = get_post_meta(get_the_ID(), 'components', true);
    if (!empty($components)) :
        include get_template_directory() . '/templates/page_builder_part.php';
    else :
        get_template_part('partials/single', 'post');
    endif;
    ?>
<?php endwhile; ?>

<?php get_footer(); ?>
