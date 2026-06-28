<?php
$link = ($args['link']);
$label = isset($args['label']) ? $args['label'] : '';
$class = isset($args['class']) ? $args['class'] : '';
$target = isset($args['target']) ? $args['target'] : '';

if (isset($args['nofollow'])) {
    $nofollow = $args['nofollow'];
} else {
    $nofollow = '';
}
if (array_key_exists('icon', $args)) {
    $icon = ($args['icon']);
} else {
    $icon = false;
}

// var_dump($link);
if ($label == '') {
    if (is_array($link)) {
        $label = $link['title'];
    } else {
        $label = $link->title;
    }
}
?>
<?php if (is_object($link)) : ?>
    <a target="<?php echo $target; ?>" class="button <?php echo $class; ?>" href="<?php echo $link->guid; ?>" <?php echo $nofollow; ?>>
        <span class="link">
            <?php echo $label; ?>
        </span>
        <span class="icon">
            <?php
            if (isset($icon)) {
                get_svg($icon);
            } else {
                svg('arrow-diagonal-up');
            } ?>
        </span>

    </a>
<?php elseif (is_array($link)) : ?>
    <a target="<?php echo $target; ?>" class="button <?php echo $class; ?>" href="<?php echo $link['url']; ?>" <?php echo $nofollow; ?>>
        <span class="link">
            <?php echo $label; ?>
        </span>
        <?php if (($icon)): ?>
            <span class="icon">
                <?php
                get_svg($icon);
                ?>
            </span>
        <?php endif; ?>
    </a>
<?php elseif (is_string($link)) : ?>
    <a target="<?php echo $target; ?>" class="button <?php echo $class; ?>" href="<?php echo $link; ?>" <?php echo $nofollow; ?>>
        <span class="button__link">
            <?php echo $label; ?>
        </span>
        <span class="button__icon">
            <?php svg('arrow-diagonal-up'); ?>
        </span>
    </a>


<?php endif; ?>