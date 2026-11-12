/* One-off studio events admin page */

App.Pages.StudioEvents = (function () {
    const services = vars('services') || [];
    const providers = vars('providers') || [];
    let events = vars('events') || [];
    let modal;

    function initialize() {
        modal = new bootstrap.Modal($('#studio-event-modal')[0]);
        populateSelects();
        renderTable();
        $('#add-studio-event').on('click', openCreate);
        $('#save-studio-event').on('click', saveEvent);
        $('#studio-events-table').on('click', '.edit-event', onEdit);
        $('#studio-events-table').on('click', '.delete-event', onDelete);
    }

    function populateSelects() {
        const $service = $('#event-service').empty();
        const $provider = $('#event-provider').empty();

        services.forEach((service) => {
            $service.append(`<option value="${service.id}">${App.Utils.String.escapeHtml(service.name)}</option>`);
        });

        providers.forEach((provider) => {
            const name = `${provider.first_name || ''} ${provider.last_name || ''}`.trim();
            $provider.append(`<option value="${provider.id}">${App.Utils.String.escapeHtml(name)}</option>`);
        });
    }

    function renderTable() {
        const $tbody = $('#studio-events-table').empty();

        if (!events.length) {
            $tbody.append(`<tr><td colspan="7" class="text-center text-muted py-4">${lang('studio_events_empty')}</td></tr>`);
            return;
        }

        events
            .slice()
            .sort((a, b) => String(a.start_datetime).localeCompare(String(b.start_datetime)))
            .forEach((item) => {
                const providerName = `${item.first_name || ''} ${item.last_name || ''}`.trim();
                const status = Number(item.is_active) ? lang('active') : lang('inactive');
                const when = (item.start_datetime || '').replace('T', ' ').substring(0, 16);

                $tbody.append(`
                    <tr data-id="${item.id}">
                        <td>${App.Utils.String.escapeHtml(item.title || '')}</td>
                        <td>${App.Utils.String.escapeHtml(item.service_name || '')}</td>
                        <td>${App.Utils.String.escapeHtml(providerName)}</td>
                        <td>${App.Utils.String.escapeHtml(when)}</td>
                        <td>${item.capacity}</td>
                        <td>${status}</td>
                        <td class="text-end">
                            <button type="button" class="btn btn-sm btn-outline-primary edit-event me-1"><i class="fas fa-edit"></i></button>
                            <button type="button" class="btn btn-sm btn-outline-danger delete-event"><i class="fas fa-trash"></i></button>
                        </td>
                    </tr>
                `);
            });
    }

    function openCreate() {
        $('#event-id').val('');
        $('#event-title').val('');
        $('#event-description').val('');
        $('#event-service').prop('selectedIndex', 0);
        $('#event-provider').prop('selectedIndex', 0);
        $('#event-start').val('');
        $('#event-capacity').val('12');
        $('#event-active').prop('checked', true);
        modal.show();
    }

    function onEdit(event) {
        const id = $(event.currentTarget).closest('tr').data('id');
        const item = events.find((row) => Number(row.id) === Number(id));

        if (!item) {
            return;
        }

        const start = String(item.start_datetime || '').replace(' ', 'T').substring(0, 16);
        $('#event-id').val(item.id);
        $('#event-title').val(item.title || '');
        $('#event-description').val(item.description || '');
        $('#event-service').val(item.id_services);
        $('#event-provider').val(item.id_users_provider);
        $('#event-start').val(start);
        $('#event-capacity').val(item.capacity || 1);
        $('#event-active').prop('checked', Number(item.is_active) === 1);
        modal.show();
    }

    function saveEvent() {
        const payload = {
            event: {
                id: $('#event-id').val() || undefined,
                title: $('#event-title').val(),
                description: $('#event-description').val(),
                id_services: $('#event-service').val(),
                id_users_provider: $('#event-provider').val(),
                start_datetime: $('#event-start').val(),
                capacity: $('#event-capacity').val(),
                is_active: $('#event-active').is(':checked') ? 1 : 0,
            },
            csrf_token: vars('csrf_token'),
        };

        if (!payload.event.title || !payload.event.start_datetime) {
            App.Layouts.Backend.displayNotification(lang('fields_are_required'));
            return;
        }

        $.post(App.Utils.Url.siteUrl('studio_events/save'), payload)
            .done((response) => {
                const saved = payload.event;
                saved.id = response.id || saved.id;
                saved.service_name = $('#event-service option:selected').text();
                const providerOption = $('#event-provider option:selected').text().trim().split(' ');
                saved.first_name = providerOption[0] || '';
                saved.last_name = providerOption.slice(1).join(' ') || '';
                saved.start_datetime = String(saved.start_datetime).replace('T', ' ');
                if (saved.start_datetime.length === 16) {
                    saved.start_datetime += ':00';
                }

                const index = events.findIndex((item) => Number(item.id) === Number(saved.id));
                if (index >= 0) {
                    events[index] = { ...events[index], ...saved };
                } else {
                    events.push(saved);
                }

                renderTable();
                modal.hide();
                App.Layouts.Backend.displayNotification(lang('record_saved'));
            })
            .fail((xhr) => {
                App.Layouts.Backend.displayNotification(xhr.responseJSON?.message || lang('unexpected_issues'));
            });
    }

    function onDelete(event) {
        const id = $(event.currentTarget).closest('tr').data('id');

        if (!window.confirm(lang('delete_record_prompt'))) {
            return;
        }

        $.post(App.Utils.Url.siteUrl('studio_events/destroy'), {
            event_id: id,
            csrf_token: vars('csrf_token'),
        })
            .done(() => {
                events = events.filter((item) => Number(item.id) !== Number(id));
                renderTable();
            })
            .fail((xhr) => {
                App.Layouts.Backend.displayNotification(xhr.responseJSON?.message || lang('unexpected_issues'));
            });
    }

    return { initialize };
})();

$(function () {
    App.Pages.StudioEvents.initialize();
});
