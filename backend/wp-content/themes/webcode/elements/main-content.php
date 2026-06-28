<?php
$key = ($args['key']);
$data = ($args['data']);

$key = '';
$image = $data[$key . '_image'];
$title = $data[$key . '_title'];
$content = $data[$key . '_content'];
$link = $data[$key . '_link'];
$link2 = $data[$key . '_link2'];


?>
<div class="main-content">
  <div class="container-fluid">
    <div class="row align-items-center flex-column-reverse flex-lg-row">
      <div class="col-12  col-md-12 col-lg-6 col-xl-5   offset-xl-1  ">
        <div class="main-content__wrapper pr-2" data-isvisible>
          <div class="main-content__wrapper__title title">
            <?php echo $title; ?>
          </div>

          <div class="main-content__wrapper__content  mt-4  ">
            <?php echo $content; ?>
          </div>

          <div class="main-content__wrapper__link mt-5 my-lg-1">
            <?php if ($link) : ?>
              <?php get_template_part('elements/button', '', array('link' => $link, 'class' => 'primary')); ?>
            <?php endif; ?>
            <?php if ($link2) : ?>
              <?php get_template_part('elements/button', '', array('link' => $link2, 'class' => 'secondary')); ?>
            <?php endif; ?>
          </div>

        </div>
      </div>

      <div class="col-12  col-md-12 col-lg-6 col-xl-5">
        <?php if (isset($image['ID'])) : ?>
          <div class="main-content__wrapper__image  my-2 text-center contest-svg object-fit-cover">
            <?php echo wp_get_attachment_image($image['ID'], 'full', false, array('loading' => 'lazy', 'alt' => '', 'title' => '')); ?>
          </div>
        <?php endif; ?>
      </div>
    </div>
  </div>
</div>