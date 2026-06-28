<?php
$key = $args['key'] ?? '';
$data = $args['data'] ?? [];
$title = $data[$key . '_title'] ?? '';
$subtitle = $data[$key . '_subtitle'] ?? '';
$post_type = $data[$key . '_post_type'] ?? 'post';
$number_of_items = $data[$key . '_number_of_items'] ?? 6;

// Query posts
$query_args = [
    'post_type' => $post_type,
    'posts_per_page' => $number_of_items
];
$carousel_query = new WP_Query($query_args);

?>
<section class="carousel-element  ">
    <div class="container-fluid px-0">
        <?php if ($title): ?>
            <h2 class="carousel-element__title title--43 mb-2"><?php echo wp_kses_post($title); ?></h2>
        <?php endif; ?>
        <?php if ($subtitle): ?>
            <div class="carousel-element__subtitle mb-4"><?php echo esc_html($subtitle); ?></div>
        <?php endif; ?>
        <div class="swiper carousel-element__swiper">
            <div class="swiper-wrapper">
                <?php if ($carousel_query->have_posts()): while ($carousel_query->have_posts()): $carousel_query->the_post(); ?>
                        <div class="swiper-slide carousel-element__card">
                            <?php if (has_post_thumbnail()): ?>
                                <div class="carousel-element__image object-fit-cover">
                                    <?php the_post_thumbnail('large', ['class' => 'img-fluid']); ?>
                                </div>
                            <?php endif; ?>
                            <?php
                            if ($post_type === 'post') {
                                $terms = get_the_terms(get_the_ID(), 'category');
                                if ($terms && !is_wp_error($terms)) {
                                    $term = array_shift($terms);
                                    echo '<div class="carousel-element__taxonomy">' . esc_html($term->name) . '</div>';
                                }
                            }
                            ?>

                            <?php $carousel_title = get_field('carousel_title', get_the_ID()); ?>
                            <div class="carousel-element__post-title   font-weight-bold"><?php echo $carousel_title ? $carousel_title : the_title(); ?></div>
                            <a href="<?php the_permalink(); ?>" class="carousel-element__link"><?php echo __('Περισσότερα', 'webcode'); ?><span><?php get_svg('carouselarrow'); ?></span></a>
                        </div>
                <?php endwhile;
                    wp_reset_postdata();
                endif; ?>
            </div>
            <div class="carousel-element__navigation">
                <div class="carousel-element__prev swiper-button-prev"><?php svg('Carusel-Arrow Left'); ?></div>
                <div class="carousel-element__next swiper-button-next"><?php svg('Carusel-Arrow Right'); ?></div>
            </div>
            <div class="carousel-element__pagination swiper-pagination"></div>
        </div>
    </div>
</section>