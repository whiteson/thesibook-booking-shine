<?php

$acceptance = get_field('acceptance', 'options');

?>

<div class="container-fluid">
  <div class="row">
    <div class="col-md-12">
      <div class="contact-form__item">
        <label class="contact-form__item__label" for="firstname"><?php echo __('Name*', 'webcode'); ?></label>
        [text* firstname placeholder "<?php echo __('Nikos', 'webcode'); ?>"]
      </div>
      <div class="contact-form__item">
        <label class="contact-form__item__label" for="lastname"><?php echo __('Surname*', 'webcode'); ?></label>
        [text* surname placeholder "<?php echo __('Anastasopoulos', 'webcode'); ?>"]
      </div>
      <div class="contact-form__item">
        <label class="contact-form__item__label" for="email"><?php echo __('Email*', 'webcode'); ?></label>
        [email* email placeholder "<?php echo __('nikos.anastasopoulos@workemail.com', 'webcode'); ?>"]
      </div>

    </div>
    <div class="col-md-12">
      <div class="contact-form__item">
        <label class="contact-form__item__label" for="message"><?php echo __('Job Title*', 'webcode'); ?></label>
        [text* jobtitle placeholder "Journalist"]
      </div>

      <div class="contact-form__item">
        <label class="contact-form__item__label" for="message"><?php echo __('Company*', 'webcode'); ?></label>
        [text* company placeholder "Your Company"]
      </div>


      <?php if (isset($acceptance)) : ?>
        <div class="contact-form__disclaimer" data-fadeup="9">
          [acceptance image-consent]<?php echo $acceptance; ?>[/acceptance]
        </div>
      <?php endif; ?>
      [hidden enrolllink default:enrolllink "<?php echo the_title();?>"]


      <div class="contact-form__item contact-form__disclaimer">
        <label class="contact-form__item__label" for=" image-consent"><?php // echo __('Keep me informed on upcoming events and services', 'webcode'); 
                                                                      ?></label>
        [acceptance image-consent]By submitting this form, you agree to the IQ Media Hub Privacy Policy and Terms of Use.[/acceptance]
      </div>

      <div class="contact-form__item contact-form__disclaimer">
        <label class="contact-form__item__label" for="marketingacceptance"><?php // echo __('Keep me informed on upcoming events and services', 'webcode'); 
                                                                            ?></label>
        [acceptance marketingacceptance]Keep me informed on upcoming events and services [/acceptance]
      </div>

      <div class="contact-form__item relative">
        <div class="button contact-form__button-fix" href="#">
          <span class="button__icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="24" viewBox="0 0 28 24">
              <g>
                <g>
                  <g>
                    <path fill="none" stroke="#000" stroke-miterlimit="20" stroke-width="3" d="M15.06 1.887v0l10.113 10.114v0L15.06 22.111v0"></path>
                  </g>
                  <g>
                    <path fill="none" stroke="#000" stroke-miterlimit="20" stroke-width="3" d="M15.06 12H.827"></path>
                  </g>
                </g>
              </g>
            </svg> </span>
          <span class="button__link">

            <?php echo __('Join our lab', 'webcode'); ?></span>
          <div class="contact-form__submit">
            [submit "Register now"]
          </div>
        </div>
      </div>
    </div>
  </div>
</div>