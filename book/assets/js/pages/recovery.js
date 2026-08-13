/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.5.0
 * ---------------------------------------------------------------------------- */

/**
 * Recovery page.
 *
 * This module implements the functionality of the recovery page.
 */
App.Pages.Recovery = (function () {
    const $form = $('form');
    const $email = $('#email');
    const $getNewPassword = $('#get-new-password');
    const $captchaText = $('.captcha-text');
    const $captchaTitle = $('.captcha-title');
    const $captchaHint = $('#captcha-hint');
    const $altchaPayload = $('#altcha-payload');
    const $altchaHint = $('#altcha-hint');

    /**
     * Refresh the captcha image.
     */
    function refreshCaptcha() {
        $('.captcha-image').attr('src', App.Utils.Url.siteUrl('captcha?' + Date.now()));
    }

    /**
     * Event: Form "Submit"
     *
     * Make an HTTP request to the server to request a password reset link.
     */
    function onFormSubmit(event) {
        event.preventDefault();

        const $alert = $('.alert');

        $alert.addClass('d-none');

        if ($captchaText.length > 0) {
            $captchaText.removeClass('is-invalid');
            if ($captchaText.val() === '') {
                $captchaText.addClass('is-invalid');
                return;
            }
        }
        
        if ($altchaPayload.length > 0 && $altchaPayload.val() === '') {
            $altchaHint.text(lang('altcha_verification_failed')).fadeTo(400, 1);
            
            setTimeout(() => {
                $altchaHint.fadeTo(400, 0);
            }, 3000);
            return;
        }

        $getNewPassword.prop('disabled', true);

        const email = $email.val();
        const username = email;
        const captcha = $captchaText.length > 0 ? $captchaText.val() : null;
        const altchaPayloadValue = $altchaPayload.length > 0 ? $altchaPayload.val() : null;

        App.Http.Recovery.perform(username, email, captcha, altchaPayloadValue)
            .done((response) => {
                $alert.removeClass('d-none alert-danger alert-success');

                if (response.captcha_verification === false) {
                    $captchaHint.text(lang('captcha_is_wrong')).fadeTo(400, 1);

                    setTimeout(() => {
                        $captchaHint.fadeTo(400, 0);
                    }, 3000);

                    refreshCaptcha();

                    $captchaText.addClass('is-invalid');

                    return;
                }
                
                if (response.altcha_verification === false) {
                    $altchaHint.text(lang('altcha_verification_failed')).fadeTo(400, 1);
                    
                    setTimeout(() => {
                        $altchaHint.fadeTo(400, 0);
                    }, 3000);
                    
                    if (App.Utils.Altcha) {
                        App.Utils.Altcha.reset('altcha-widget');
                    }
                    
                    return;
                }

                if (response.success) {
                    $alert.addClass('alert-success');
                    $alert.text(lang('reset_link_sent_with_email'));
                    renderEmailDebug(response.debug);
                } else {
                    $alert.addClass('alert-danger');
                    $alert.text(response.message || lang('reset_link_sent_with_email'));
                    refreshCaptcha();
                }
            })
            .fail((jqXHR) => {
                $alert.removeClass('d-none alert-success').addClass('alert-danger');

                const response = jqXHR.responseJSON;

                if (response && response.message) {
                    $alert.text(response.message);
                } else if (jqXHR.status === 403) {
                    $alert.text('Session expired. Refresh the page and try again.');
                } else {
                    $alert.text('Could not send the reset link. Refresh the page and try again.');
                }

                if (response && response.debug) {
                    renderEmailDebug(response.debug);
                }

                refreshCaptcha();
            })
            .always(() => {
                $getNewPassword.prop('disabled', false);
            });
    }

    /**
     * Show recovery email debug details when DEBUG_MODE is on.
     *
     * @param {Object|null} debug
     */
    function renderEmailDebug(debug) {
        if (!debug) {
            return;
        }

        const $panel = $('#recovery-email-debug-result');

        if (!$panel.length) {
            console.info('[recovery email debug]', debug);
            return;
        }

        $panel.show().find('pre').text(JSON.stringify(debug, null, 2));
    }
    
    /**
     * Initialize ALTCHA widget if present.
     */
    function initializeAltcha() {
        if ($('#altcha-widget').length && App.Utils.Altcha) {
            App.Utils.Altcha.initialize('altcha-widget');
        }
    }

    $form.on('submit', onFormSubmit);

    $captchaTitle.on('click', 'button', refreshCaptcha);
    
    // Initialize ALTCHA
    initializeAltcha();

    return {};
})();
