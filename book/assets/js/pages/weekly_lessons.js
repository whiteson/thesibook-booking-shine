/* Weekly lessons admin page */

App.Pages.WeeklyLessons = (function () {
    const services = vars('services') || [];
    const providers = vars('providers') || [];
    let lessons = vars('lessons') || [];
    let modal;

    const weekdayLabels = {
        0: lang('sunday'),
        1: lang('monday'),
        2: lang('tuesday'),
        3: lang('wednesday'),
        4: lang('thursday'),
        5: lang('friday'),
        6: lang('saturday'),
    };

    function initialize() {
        modal = new bootstrap.Modal($('#weekly-lesson-modal')[0]);
        populateSelects();
        renderTable();
        $('#add-weekly-lesson').on('click', openCreate);
        $('#save-weekly-lesson').on('click', saveLesson);
        $('#weekly-lessons-table').on('click', '.edit-lesson', onEdit);
        $('#weekly-lessons-table').on('click', '.delete-lesson', onDelete);
    }

    function populateSelects() {
        const $service = $('#lesson-service').empty();
        const $provider = $('#lesson-provider').empty();

        services.forEach((service) => {
            $service.append(`<option value="${service.id}">${App.Utils.String.escapeHtml(service.name)}</option>`);
        });

        providers.forEach((provider) => {
            const name = `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
            $provider.append(`<option value="${provider.id}">${App.Utils.String.escapeHtml(name)}</option>`);
        });
    }

    function renderTable() {
        const $tbody = $('#weekly-lessons-table').empty();

        if (!lessons.length) {
            $tbody.append(`<tr><td colspan="6" class="text-center text-muted py-4">${lang('no_records_found')}</td></tr>`);
            return;
        }

        lessons.forEach((lesson) => {
            const providerName = `${lesson.first_name || ''} ${lesson.last_name || ''}`.trim();
            const status = Number(lesson.is_active) ? lang('active') : lang('inactive');
            const time = (lesson.start_time || '').substring(0, 5);

            $tbody.append(`
                <tr data-id="${lesson.id}">
                    <td>${App.Utils.String.escapeHtml(lesson.service_name)}</td>
                    <td>${App.Utils.String.escapeHtml(providerName)}</td>
                    <td>${weekdayLabels[lesson.weekday] || lesson.weekday}</td>
                    <td>${time}</td>
                    <td>${status}</td>
                    <td class="text-end">
                        <button type="button" class="btn btn-sm btn-outline-primary edit-lesson me-1"><i class="fas fa-edit"></i></button>
                        <button type="button" class="btn btn-sm btn-outline-danger delete-lesson"><i class="fas fa-trash"></i></button>
                    </td>
                </tr>
            `);
        });
    }

    function openCreate() {
        $('#lesson-id').val('');
        $('#lesson-service').prop('selectedIndex', 0);
        $('#lesson-provider').prop('selectedIndex', 0);
        $('#lesson-weekday').val('1');
        $('#lesson-start-time').val('10:00');
        $('#lesson-active').prop('checked', true);
        modal.show();
    }

    function onEdit(event) {
        const id = $(event.currentTarget).closest('tr').data('id');
        const lesson = lessons.find((item) => Number(item.id) === Number(id));

        if (!lesson) {
            return;
        }

        $('#lesson-id').val(lesson.id);
        $('#lesson-service').val(lesson.id_services);
        $('#lesson-provider').val(lesson.id_users_provider);
        $('#lesson-weekday').val(lesson.weekday);
        $('#lesson-start-time').val((lesson.start_time || '').substring(0, 5));
        $('#lesson-active').prop('checked', Number(lesson.is_active) === 1);
        modal.show();
    }

    function saveLesson() {
        const payload = {
            lesson: {
                id: $('#lesson-id').val() || undefined,
                id_services: $('#lesson-service').val(),
                id_users_provider: $('#lesson-provider').val(),
                weekday: $('#lesson-weekday').val(),
                start_time: $('#lesson-start-time').val(),
                is_active: $('#lesson-active').is(':checked') ? 1 : 0,
            },
            csrf_token: vars('csrf_token'),
        };

        $.post(App.Utils.Url.siteUrl('weekly_lessons/save'), payload)
            .done((response) => {
                const saved = payload.lesson;
                saved.id = response.id || saved.id;
                saved.service_name = $('#lesson-service option:selected').text();
                const providerOption = $('#lesson-provider option:selected').text().trim().split(' ');
                saved.first_name = providerOption[0] || '';
                saved.last_name = providerOption.slice(1).join(' ') || '';
                saved.start_time = saved.start_time + ':00';

                const index = lessons.findIndex((item) => Number(item.id) === Number(saved.id));
                if (index >= 0) {
                    lessons[index] = { ...lessons[index], ...saved };
                } else {
                    lessons.push(saved);
                }

                renderTable();
                modal.hide();
            })
            .fail((xhr) => {
                App.Utils.UI.displayNotification(xhr.responseJSON?.message || lang('unexpected_issues'));
            });
    }

    function onDelete(event) {
        const id = $(event.currentTarget).closest('tr').data('id');

        if (!window.confirm(lang('delete_record_prompt'))) {
            return;
        }

        $.post(App.Utils.Url.siteUrl('weekly_lessons/destroy'), {
            lesson_id: id,
            csrf_token: vars('csrf_token'),
        })
            .done(() => {
                lessons = lessons.filter((item) => Number(item.id) !== Number(id));
                renderTable();
            })
            .fail((xhr) => {
                App.Utils.UI.displayNotification(xhr.responseJSON?.message || lang('unexpected_issues'));
            });
    }

    return { initialize };
})();

$(function () {
    App.Pages.WeeklyLessons.initialize();
});
