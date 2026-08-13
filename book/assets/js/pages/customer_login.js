App.Pages.CustomerLogin = (function () {
    function initialize() {
        $('#customer-login-form').on('submit', function (event) {
            event.preventDefault();

            const $alert = $('.alert').addClass('d-none');

            $.post(App.Utils.Url.siteUrl('customer_register/validate'), {
                csrf_token: vars('csrf_token'),
                username: $('#username').val(),
                password: $('#password').val(),
            })
                .done((response) => {
                    if (response.success) {
                        window.location.href = App.Utils.Url.siteUrl('booking');
                        return;
                    }

                    $alert
                        .removeClass('d-none alert-success')
                        .addClass('alert-danger')
                        .text(response.message || lang('invalid_credentials_provided'));
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
    App.Pages.CustomerLogin.initialize();
});
