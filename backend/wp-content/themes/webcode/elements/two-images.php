<?php
$key = $args['key'];
$data = $args['data'];


$background_image = $data[$key . '_background_image'] ?? null;
$foreground_image = $data[$key . '_foreground_image'] ?? null;
?>

<section class="two-images-element">
    <div class="two-images-element__background object-fit-cover">
        <?php if (!empty($background_image['ID'])): ?>
            <?php echo wp_get_attachment_image($background_image['ID'], 'full', false, [
                'class' => 'two-images-element__background',
                'alt' => esc_attr($background_image['alt'] ?? ''),
                'aria-hidden' => 'true'
            ]); ?>

        <?php endif; ?>
    </div>
    <div class="two-images-element__overlay" style="">
        <?php if (!empty($foreground_image['ID'])): ?>
            <?php echo wp_get_attachment_image($foreground_image['ID'], 'large', false, [
                'class' => 'two-images-element__foreground',
                'alt' => esc_attr($foreground_image['alt'] ?? '')
            ]); ?>
        <?php endif; ?>
    </div>
</section>