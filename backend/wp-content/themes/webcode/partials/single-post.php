<?php
$services_page = get_page_by_path('services');
$services_url = $services_page ? get_permalink($services_page) : home_url('/services/');
?>
<article class="single-post">
    <?php if (has_post_thumbnail()) : ?>
        <div class="single-post__hero object-fit-cover">
            <?php the_post_thumbnail('full', [
                'class' => 'single-post__hero-image',
                'loading' => 'eager',
                'alt' => get_the_title(),
            ]); ?>
        </div>
    <?php endif; ?>

    <div class="container">
        <div class="row justify-content-center">
            <div class="col-lg-10 col-xl-8">
                <div class="single-post__header">
                    <a href="<?php echo esc_url($services_url); ?>" class="single-post__back">
                        <?php echo esc_html__('Back to Services', 'webcode'); ?>
                    </a>

                    <h1 class="single-post__title"><?php the_title(); ?></h1>
                </div>

                <div class="single-post__content">
                    <?php the_content(); ?>
                </div>
            </div>
        </div>
    </div>
</article>
