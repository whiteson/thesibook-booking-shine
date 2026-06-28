<?php
$key = $args['key'] ?? 'services_grid';
$data = $args['data'] ?? [];

$eyebrow = $data[$key . '_eyebrow'] ?? __('Our Services', 'webcode');
$title = $data[$key . '_title'] ?? '';
$intro = $data[$key . '_intro'] ?? '';
$category_slug = $data[$key . '_category'] ?? 'services';
$number_of_items = (int) ($data[$key . '_number_of_items'] ?? -1);

$query_args = [
    'post_type' => 'post',
    'post_status' => 'publish',
    'posts_per_page' => $number_of_items > 0 ? $number_of_items : -1,
    'orderby' => 'date',
    'order' => 'ASC',
    'ignore_sticky_posts' => true,
    'category_name' => sanitize_title($category_slug),
];

$services_query = new WP_Query($query_args);

if (!$services_query->have_posts()) {
    return;
}

$total_posts = $services_query->post_count;
?>

<section class="services-grid">
    <div class="container">
        <?php if ($eyebrow || $title || $intro) : ?>
            <div class="row justify-content-center mb-5">
                <div class="col-lg-8 text-center">
                    <?php if ($eyebrow) : ?>
                        <div class="services-grid__eyebrow mb-2"><?php echo esc_html($eyebrow); ?></div>
                    <?php endif; ?>

                    <?php if ($title) : ?>
                        <h2 class="services-grid__title display-5 mb-3"><?php echo esc_html($title); ?></h2>
                    <?php endif; ?>

                    <?php if ($intro) : ?>
                        <p class="services-grid__intro lead mb-0"><?php echo esc_html($intro); ?></p>
                    <?php endif; ?>
                </div>
            </div>
        <?php endif; ?>

        <div class="row g-4">
            <?php
            $index = 0;
            while ($services_query->have_posts()) :
                $services_query->the_post();
                $index++;

                $is_last_odd = ($index === $total_posts && ($total_posts % 2 !== 0));
                $column_class = $is_last_odd ? 'col-lg-8 mx-auto' : 'col-lg-6';

                $content = get_the_content();
                $summary = '';
                $list_items = [];

                if (preg_match('/<p[^>]*>(.*?)<\/p>/is', $content, $matches)) {
                    $summary = wp_strip_all_tags($matches[1]);
                }

                if (preg_match('/<ul[^>]*>(.*?)<\/ul>/is', $content, $list_match)) {
                    if (preg_match_all('/<li[^>]*>(.*?)<\/li>/is', $list_match[1], $items)) {
                        foreach ($items[1] as $item) {
                            $text = trim(wp_strip_all_tags($item));
                            if ($text !== '') {
                                $list_items[] = $text;
                            }
                        }
                    }
                }

                if ($summary === '') {
                    $summary = get_the_excerpt();
                }
                ?>
                <div class="<?php echo esc_attr($column_class); ?>">
                    <article class="services-grid__card">
                        <?php if (has_post_thumbnail()) : ?>
                            <a href="<?php the_permalink(); ?>" class="services-grid__image-link" aria-hidden="true" tabindex="-1">
                                <?php the_post_thumbnail('large', [
                                    'class' => 'services-grid__image',
                                    'loading' => 'lazy',
                                    'alt' => get_the_title(),
                                ]); ?>
                            </a>
                        <?php endif; ?>

                        <div class="services-grid__body">
                            <h3 class="services-grid__card-title h4">
                                <a href="<?php the_permalink(); ?>"><?php the_title(); ?></a>
                            </h3>

                            <?php if ($summary) : ?>
                                <p class="services-grid__text"><?php echo esc_html($summary); ?></p>
                            <?php endif; ?>

                            <?php if (!empty($list_items)) : ?>
                                <ul class="services-grid__list">
                                    <?php foreach ($list_items as $item) : ?>
                                        <li><?php echo esc_html($item); ?></li>
                                    <?php endforeach; ?>
                                </ul>
                            <?php endif; ?>

                            <a href="<?php the_permalink(); ?>" class="services-grid__link">
                                <?php echo esc_html__('Learn more', 'webcode'); ?>
                            </a>
                        </div>
                    </article>
                </div>
            <?php endwhile; ?>
        </div>
    </div>
</section>

<?php wp_reset_postdata(); ?>
