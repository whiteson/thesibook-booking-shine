<?php
// Universal Simple Text Element using $args['key'] and $args['data'] (builder compatible)
$key = $args['key'] ?? '';
$data = $args['data'] ?? [];

$title = $data[$key . '_title'] ?? '';
$subtitle = $data[$key . '_subtitle'] ?? '';
$content_1 = $data[$key . '_content_1'] ?? '';
$content_2 = $data[$key . '_content_2'] ?? '';
$style = $data[$key . '_style'] ?? 'white'; // white, primary
$line_height = $data[$key . '_line_height'] ?? 'normal'; // normal, large
$extra_option = $data[$key . '_extra_option'] ?? false; // boolean
$is_flipbook = $data[$key . '_is_flipbook'] ?? false; // boolean
$download = $data[$key . '_download'] ?? false; // boolean
// var_dump($download);
// var_dump($link);
// BEM modifiers
$block = 'simple-text';
$style_class = $block . '--' . esc_attr($style);
$lh_class = $block . '--lh-' . esc_attr($line_height);
$extra_class = $extra_option ? $block . '--extra' : '';
$link_class = $download ? $block . '--link' : '';
?>
<section class="<?php echo $block; ?> <?php echo $style_class; ?> <?php echo $lh_class; ?> <?php echo $extra_class; ?> <?php echo $is_flipbook ? $block . '--flipbook' : ''; ?> <?php echo $link_class; ?>">
  <div class="container p-0">
    <?php if ($title): ?>
      <h2 class="<?php echo $block; ?>__title text-center mb-3"><?php echo ($title); ?></h2>
    <?php endif; ?>
    <?php if ($subtitle): ?>
      <div class="<?php echo $block; ?>__subtitle text-center mb-4"><?php echo ($subtitle); ?></div>
    <?php endif; ?>
    <?php if ($content_1): ?>
      <div class="<?php echo $block; ?>__content mb-3 mx-auto"><?php echo $content_1; ?></div>
    <?php endif; ?>
    <?php if ($content_2): ?>
      <div class="<?php echo $block; ?>__content2-wrapper d-block d-md-none mb-3">
        <button class="btn btn-link <?php echo $block; ?>__readmore-btn" type="button" onclick="this.nextElementSibling.classList.toggle('is-open');this.style.display='none';">Περισσότερα > </span></button>
        <div class="<?php echo $block; ?>__content2" style="display:none;">
          <?php echo $content_2; ?>
        </div>
      </div>
      <div class="<?php echo $block; ?>__content2 d-none d-md-block mb-3">
        <?php echo $content_2; ?>
      </div>
    <?php endif; ?>
    <?php if ($download): ?>
      <div class="<?php echo $block; ?>__link">
        <p  style="text-align:center;"><?php echo __('Κατεβάστε τον οδηγό σε μορφή pdf.','wineroads');?></p>
        <?php echo get_template_part('elements/button', '', ['class'=> 'download','link' => $download, 'target' => '_blank','icon'=>'download']); ?>
      </div>
    <?php endif; ?>
  </div>
</section>
<script>
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.simple-text__readmore-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        var content = btn.nextElementSibling;
        if (content) {
          content.style.display = 'block';
        }
      });
    });
  });
</script>