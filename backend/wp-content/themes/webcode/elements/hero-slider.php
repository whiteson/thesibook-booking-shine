<?php
$key = ($args['key']);
$data = ($args['data']);
$sliders = $data[$key . '_slider'];
$slider_link_title = $data[$key . '_slider_search_title'];
$slider_description = $data[$key . '_slider_search_description'];
$placeholder = $data[$key . '_slider_search_placeholder'];
?>

<section class="hero-slider">
    <!-- Slider main container -->
    <div class=" main-swiper swiper">
        <div class="swiper-wrapper">
            <?php foreach ($sliders  as $slide) : ?>
                <?php if (isset($slide['slider_image']['ID'])): ?>
                    <div class="hero-slider__swiper__wrapper__slide swiper-slide">
                        <div class="hero-slider__swiper__wrapper__slide__image  object-fit-cover">
                            <?php echo wp_get_attachment_image($slide['slider_image']['ID'], 'full', false, array('loading' => 'lazy', 'alt' => '', 'title' => '')); ?>
                        </div>

                        <div class="hero-slider__swiper__wrapper__slide__content ">
                            <div class="container-fluid hero-slider__swiper__wrapper__slide__content__helper">
                                <?php if (!empty($slide['slider_title']) || !empty($slide['slider_subtitle'])): ?>
                                <div class="col-lg-9 col-12 hero-slider__swiper__wrapper__slide__content__title ">
                                    <?php if (!empty($slide['slider_title'])): ?>
                                    <span><?php echo $slide['slider_title']; ?></span><br>
                                    <?php endif; ?>
                                    <?php if (!empty($slide['slider_subtitle'])): ?>
                                    <?php echo $slide['slider_subtitle']; ?>
                                    <?php endif; ?>
                                </div>
                                <?php endif; ?>
                 
                                <?php if (!empty($slide['slider_button'])): ?>
                                <div class="hero-slider__swiper__wrapper__slide__content__button">
                                    <?php get_template_part('elements/button', '', array('link' => $slide['slider_button'])); ?>
                                </div>
                                <?php endif; ?>
                            </div>

                        </div>
                    </div>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
        <!-- If we need navigation buttons -->
        <?php if (count($sliders) > 1): ?>
        <div class="hero-slider__swiper__navigation">
            <div class="hero-slider__swiper__navigation__prev swiper-button-prev"><?php svg('Button-Left-Home'); ?></div>
            <div class="hero-slider__swiper__navigation__next swiper-button-next"><?php svg('Button-Right-Home'); ?></div>
        </div>
        <div class="hero-slider__swiper__pagination swiper-pagination"></div>
        <?php endif; ?>
        <!-- <div class="swiper-scrollbar"></div> -->
    </div>


    <?php if (!empty($slider_link_title)) : ?>
        <p class="hero-slider__meta"><?php echo esc_html($slider_link_title); ?></p>
    <?php endif; ?>
    <?php if (!empty($slider_description)) : ?>
        <p class="hero-slider__description"><?php echo esc_html($slider_description); ?></p>
    <?php endif; ?>



</section>