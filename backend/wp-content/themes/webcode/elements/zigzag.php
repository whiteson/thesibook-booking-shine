<?php
$key = $args['key'] ?? 'zigzag';
$data = $args['data'] ?? [];

$rows = $data[$key . '_rows'] ?? [];

if (empty($rows) || !is_array($rows)) {
    return;
}
?>

<section class="zigzag">
    <?php foreach ($rows as $index => $row) :
        $title = $row['title'] ?? '';
        $subtitle = $row['subtitle'] ?? '';
        $content = $row['content'] ?? '';
        $image = $row['image'] ?? null;
        $reverse_class = ($index % 2 === 1) ? ' zigzag__row--reverse' : '';
    ?>
        <div class="zigzag__row<?php echo esc_attr($reverse_class); ?>">
            <div class="zigzag__col zigzag__col--content">
                <div class="zigzag__content" data-isvisible>
                    <?php if ($title) : ?>
                        <h2 class="zigzag__title title"><?php echo wp_kses_post($title); ?></h2>
                    <?php endif; ?>

                    <?php if ($subtitle) : ?>
                        <div class="zigzag__subtitle"><?php echo wp_kses_post($subtitle); ?></div>
                    <?php endif; ?>

                    <?php if ($content) : ?>
                        <div class="zigzag__body"><?php echo wp_kses_post($content); ?></div>
                    <?php endif; ?>
                </div>
            </div>

            <?php if (!empty($image['ID'])) : ?>
                <div class="zigzag__col zigzag__col--media">
                    <div class="zigzag__image object-fit-cover">
                        <?php echo wp_get_attachment_image($image['ID'], 'full', false, [
                            'loading' => 'lazy',
                            'alt' => $image['alt'] ?? '',
                        ]); ?>
                    </div>
                </div>
            <?php endif; ?>
        </div>
    <?php endforeach; ?>
</section>
