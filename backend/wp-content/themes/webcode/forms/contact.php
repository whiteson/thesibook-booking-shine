<?php

$acceptance = get_field('acceptance', 'options');
// $acceptance = 'Αποδέχομαι τους όρους χρήσης & επικοινωνίας, μέσω ηλ. ταχυδρομίου.';
?>
<style>
    div.wpcf7-validation-errors, .wpcf7-response-output {
    color: white !important;
    }
</style>
<div class="contact-form">
  <div class="container-fluid">
    <div class="row justify-content-center">
      <div class="col-10">
        <div class="contact-form__item">
          <label class="contact-form__item__label" for="firstname"><?php echo __('Name*', 'webcode'); ?></label>
          [text* firstname placeholder "<?php echo __('Name', 'webcode'); ?>"]
        </div>
        <div class="contact-form__item">
          <label class="contact-form__item__label" for="lastname"><?php echo __('Surname*', 'webcode'); ?></label>
          [text* surname placeholder "<?php echo __('LastName', 'webcode'); ?>"]
        </div>
        <div class="contact-form__item">
          <label class="contact-form__item__label" for="email"><?php echo __('Email*', 'webcode'); ?></label>
          [email* email placeholder "<?php echo __('email', 'webcode'); ?>"]
        </div>
        <div class="contact-form__item">
          <label class="contact-form__item__label" for="email"><?php echo __('Message*', 'webcode'); ?></label>
          [textarea* message placeholder "<?php echo __('Your message here', 'webcode'); ?>"]
        </div>

        <?php if (isset($acceptance)) : ?>
          <div class="contact-form__disclaimer" data-fadeup="9">
            [acceptance image-consent]<?php echo $acceptance; ?>[/acceptance]
          </div>
        <?php endif; ?>


        <div class="contact-form__item relative">
          <div class="contact-form__button-fix">
            <div class="contact-form__submit mt-5">
              [submit "Send"]
            </div>
          </div>
        </div>
        
      </div>
    </div>
  </div>
</div>