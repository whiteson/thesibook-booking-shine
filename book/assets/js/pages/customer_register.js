App.Pages.CustomerRegister = (function () {
    function initialize() {
        $('#customer-register-form').on('submit', function (event) {
            event.preventDefault();

            const $alert = $('.alert').addClass('d-none');

            $.post(App.Utils.Url.siteUrl('customer_register/register'), {
                csrf_token: vars('csrf_token'),
                first_name: $('#first-name').val(),
                last_name: $('#last-name').val(),
                email: $('#email').val(),
                phone_number: $('#phone-number').val(),
                password: $('#password').val(),
            })
                .done(() => {
                    window.location.href = App.Utils.Url.siteUrl('booking');
                })
                .fail((xhr) => {
                    $alert
                        .removeClass('d-none alert-success')
                        .addClass('alert-danger')
                        .text(xhr.responseJSON?.message || lang('unexpected_issues'));
                });
        });
    }

    return { initialize };
})();

$(function () {
    App.Pages.CustomerRegister.initialize();
});
