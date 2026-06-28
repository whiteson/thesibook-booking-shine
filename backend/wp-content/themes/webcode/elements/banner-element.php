<?php
$key = $args['key'];
$data = $args['data'];
$title = $data[$key . '_title'];
$subtitle = $data[$key . '_subtitle'];
$link = $data[$key . '_button'];
$image_logo = $data[$key . '_image_logo'];
$image_bg = $data[$key . '_background_image'];
?>

<div class="banner-container is-active ">
  <div class="  banner-inside">
    <a href="<?php echo $link['url']; ?>">
      <div class="d-flex flex-column justify-content-center banner-container-image" style="background-image: url('<?php echo $image_bg['url']; ?>');">
        <div class="d-flex flex-column align-items-center">
          <div class="col-9 content-wrapper d-flex justify-content-between  ">
            <div class="banner-container__group">
              <h2 class="banner-container__group__title title--h2 secondary  mb-2 mb-lg-2 text-left">
                <?php echo $title; ?>

              </h2>

              <div class="subtitle secondary  ">
                <?php echo $subtitle; ?>
              </div>
              <div class="plus-icon black-icon">
                <?php svg('Plus-Button'); ?>
              </div>
            </div>

            <div class="logo-container">
              <?php svg('Logo-Cycle') ?>
              <!-- <img src="<?php // echo $image_logo['url']; 
                              ?>" alt="Logo" class="logo-image"> -->
            </div>
          </div>
        </div>
      </div>
    </a>
  </div>
</div>


<script>
  document.querySelectorAll('.banner-container').forEach(function(el) {
    el.addEventListener('touchstart', function() {
      // Remove .is-active from all banners
      document.querySelectorAll('.banner-container.is-active').forEach(function(activeEl) {
        if (activeEl !== el) activeEl.classList.remove('is-active');
      });
      // Toggle .is-active on this banner
      el.classList.toggle('is-active');
    });
  });
</script>