/* ----------------------------------------------------------------------------
 * thesibook.gr — Weekly class calendar booking page.
 * ---------------------------------------------------------------------------- */

App.Pages.ClassBooking = (function () {
    const $page = $('#class-booking-page');
    const $calendarEl = $('#class-week-calendar');
    const $loading = $('#class-schedule-loading');
    const $empty = $('#class-schedule-empty');
    const $pageError = $('#class-schedule-error');
    const $modal = $('#class-booking-modal');
    const $summary = $('#class-booking-summary');
    const $error = $('#class-booking-error');
    const $submit = $('#class-booking-submit');

    const moment = window.moment;
    let calendar;
    let bookingModal;
    let activeWeekStart = null;

    /**
     * Initialize the weekly class calendar.
     */
    function initialize() {
        if (!$page.length || !$calendarEl.length || typeof FullCalendar === 'undefined') {
            return;
        }

        bookingModal = new bootstrap.Modal($modal[0]);

        const firstDay = App.Utils.Date.getWeekdayId(vars('first_weekday'));
        const timeFormat =
            vars('time_format') === 'military'
                ? { hour: '2-digit', minute: '2-digit', hour12: false }
                : { hour: 'numeric', minute: '2-digit', meridiem: 'short' };
        const initialView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';

        calendar = new FullCalendar.Calendar($calendarEl[0], {
            initialView,
            locale: vars('language_code') || 'en',
            firstDay,
            height: 'auto',
            contentHeight: 620,
            nowIndicator: true,
            allDaySlot: false,
            slotDuration: '00:30:00',
            slotLabelInterval: '01:00',
            scrollTime: '08:00:00',
            eventTimeFormat: timeFormat,
            slotLabelFormat: timeFormat,
            headerToolbar: {
                left: 'prev,next today',
                center: 'title',
                right: window.innerWidth < 768 ? 'timeGridDay' : 'timeGridDay,timeGridWeek',
            },
            buttonText: {
                today: lang('today'),
                day: lang('day'),
                week: lang('week'),
            },
            themeSystem: 'bootstrap5',
            eventDisplay: 'block',
            events: [],
            eventContent: renderEventContent,
            eventClick: onEventClick,
            datesSet: onDatesSet,
            windowResize: onWindowResize,
        });

        calendar.render();

        loadWeekClasses(getWeekStart(calendar.view.currentStart));

        $submit.on('click', submitBooking);
        $modal.on('hidden.bs.modal', resetModal);
    }

    /**
     * Keep a sensible view on small screens.
     */
    function onWindowResize() {
        if (!calendar) {
            return;
        }

        const targetView = window.innerWidth < 768 ? 'timeGridDay' : 'timeGridWeek';

        if (calendar.view.type !== targetView) {
            calendar.changeView(targetView);
        }
    }

    /**
     * Normalize a date to the configured first day of the week.
     *
     * @param {String|Date|Object} date
     *
     * @returns {String}
     */
    function getWeekStart(date) {
        const firstDay = App.Utils.Date.getWeekdayId(vars('first_weekday'));
        const current = moment(date).startOf('day');
        const offset = (current.day() - firstDay + 7) % 7;

        return current.subtract(offset, 'days').format('YYYY-MM-DD');
    }

    /**
     * Load classes whenever the visible week changes.
     *
     * @param {Object} info
     */
    function onDatesSet(info) {
        const weekStart = getWeekStart(info.view.currentStart);

        if (weekStart === activeWeekStart) {
            return;
        }

        activeWeekStart = weekStart;
        loadWeekClasses(weekStart);
    }

    /**
     * Fetch classes for a calendar week.
     *
     * @param {String} weekStart Y-m-d
     */
    function loadWeekClasses(weekStart) {
        $empty.hide();
        $pageError.hide().addClass('d-none').text('');
        $loading.show();

        $.post(App.Utils.Url.siteUrl('booking/get_classes'), {
            csrf_token: vars('csrf_token'),
            week_start: weekStart,
        })
            .done((response) => {
                const classes = Array.isArray(response) ? response : response.classes || [];
                calendar.removeAllEvents();
                calendar.addEventSource(classes.map(toCalendarEvent));
                $empty.toggle(classes.length === 0);
            })
            .fail((xhr) => {
                calendar.removeAllEvents();
                $empty.hide();
                $pageError.removeClass('d-none').text(xhr.responseJSON?.message || lang('unexpected_issues'));
            })
            .always(() => {
                $loading.hide();
            });
    }

    /**
     * Map API class data to a FullCalendar event.
     *
     * @param {Object} classItem
     *
     * @returns {Object}
     */
    function toCalendarEvent(classItem) {
        const isFull = Boolean(Number(classItem.is_full));

        return {
            id:
                classItem.service_id +
                '-' +
                classItem.provider_id +
                '-' +
                classItem.start_datetime,
            title: classItem.name,
            start: classItem.start_datetime,
            end: classItem.end_datetime,
            backgroundColor: isFull ? '#adb5bd' : classItem.color || '#2563eb',
            borderColor: isFull ? '#868e96' : classItem.color || '#2563eb',
            textColor: '#ffffff',
            classNames: isFull ? ['class-event-full'] : ['class-event-open'],
            extendedProps: classItem,
        };
    }

    /**
     * Custom event rendering: lesson, teacher, spots.
     *
     * @param {Object} arg
     *
     * @returns {Object}
     */
    function renderEventContent(arg) {
        const classItem = arg.event.extendedProps;
        const timeLabel = formatTimeRange(classItem.start_time, classItem.end_time);
        const teacher = App.Utils.String.escapeHtml(classItem.teacher_name || '');
        const name = App.Utils.String.escapeHtml(classItem.name || arg.event.title);
        const spots = `${classItem.booked}/${classItem.capacity} ${lang('class_spots')}`;
        const fullLabel = Number(classItem.is_full) ? ` · ${lang('class_full')}` : '';

        return {
            html: `
                <div class="class-event-inner">
                    <div class="class-event-time">${timeLabel}</div>
                    <div class="class-event-title">${name}</div>
                    ${teacher ? `<div class="class-event-teacher"><i class="fas fa-user"></i>${teacher}</div>` : ''}
                    <div class="class-event-spots">${spots}${fullLabel}</div>
                </div>
            `,
        };
    }

    /**
     * Open booking modal when an available class is clicked.
     *
     * @param {Object} info
     */
    function onEventClick(info) {
        info.jsEvent.preventDefault();

        const classItem = info.event.extendedProps;

        if (Number(classItem.is_full)) {
            return;
        }

        openBookingModal(classItem);
    }

    /**
     * Format a time range for display.
     *
     * @param {String} startTime
     * @param {String} endTime
     *
     * @returns {String}
     */
    function formatTimeRange(startTime, endTime) {
        const timeFormat = vars('time_format') === 'military' ? 'HH:mm' : 'h:mm A';

        return `${moment(startTime, 'HH:mm').format(timeFormat)} - ${moment(endTime, 'HH:mm').format(timeFormat)}`;
    }

    /**
     * Open the booking modal for a class.
     *
     * @param {Object} classItem
     */
    function openBookingModal(classItem) {
        $error.hide().text('');
        $('#class-selected-service-id').val(classItem.service_id);
        $('#class-selected-provider-id').val(classItem.provider_id);
        $('#class-selected-start-datetime').val(classItem.start_datetime);
        $('#class-selected-end-datetime').val(classItem.end_datetime);

        const name = App.Utils.String.escapeHtml(classItem.name);
        const teacher = App.Utils.String.escapeHtml(classItem.teacher_name || '');
        const timeLabel = formatTimeRange(classItem.start_time, classItem.end_time);
        const dateLabel = moment(classItem.date || classItem.start_datetime).format('LL');
        const spotsLabel = `${classItem.booked}/${classItem.capacity} ${lang('class_spots')}`;

        $summary.html(`
            <div class="fw-bold fs-5 mb-2">${name}</div>
            <div class="text-muted"><i class="fas fa-calendar-day me-2"></i>${dateLabel}</div>
            <div class="text-muted"><i class="fas fa-clock me-2"></i>${timeLabel}</div>
            ${teacher ? `<div class="text-muted"><i class="fas fa-user me-2"></i>${teacher}</div>` : ''}
            <div class="text-muted"><i class="fas fa-users me-2"></i>${spotsLabel}</div>
        `);

        prefillCustomerFields();

        bookingModal.show();
    }

    /**
     * Prefill booking form when a customer is logged in.
     */
    function prefillCustomerFields() {
        const customer = vars('customer_data');

        if (!customer) {
            return;
        }

        if ($('#class-first-name').length) {
            $('#class-first-name').val(customer.first_name || '');
        }

        if ($('#class-last-name').length) {
            $('#class-last-name').val(customer.last_name || '');
        }

        if ($('#class-email').length) {
            $('#class-email').val(customer.email || '');
        }

        if ($('#class-phone-number').length) {
            $('#class-phone-number').val(customer.phone_number || '');
        }
    }

    /**
     * Submit the class booking.
     */
    function submitBooking() {
        $error.hide().text('');

        let hasMissing = false;

        $('#class-booking-form .required').each((_index, field) => {
            const $field = $(field);

            if (!$field.val()) {
                $field.addClass('is-invalid');
                hasMissing = true;
            } else {
                $field.removeClass('is-invalid');
            }
        });

        if (hasMissing) {
            $error.text(lang('fields_are_required')).show();
            return;
        }

        const postData = {
            customer: {
                first_name: $('#class-first-name').val() || '',
                last_name: $('#class-last-name').val() || '',
                email: $('#class-email').val() || '',
                phone_number: $('#class-phone-number').val() || '',
                address: '',
                city: '',
                zip_code: '',
                notes: $('#class-notes').val() || '',
            },
            appointment: {
                start_datetime: $('#class-selected-start-datetime').val(),
                end_datetime: $('#class-selected-end-datetime').val(),
                notes: $('#class-notes').val() || '',
                is_unavailability: false,
                id_users_provider: $('#class-selected-provider-id').val(),
                id_services: $('#class-selected-service-id').val(),
            },
            manage_mode: false,
        };

        $submit.prop('disabled', true);

        $.ajax({
            url: App.Utils.Url.siteUrl('booking/register'),
            method: 'post',
            data: {
                csrf_token: vars('csrf_token'),
                post_data: postData,
            },
            dataType: 'json',
        })
            .done((response) => {
                window.location.href = App.Utils.Url.siteUrl(
                    'booking_confirmation/of/' + response.appointment_hash,
                );
            })
            .fail((xhr) => {
                let message = lang('unexpected_issues');

                if (xhr.responseJSON && xhr.responseJSON.message) {
                    message = xhr.responseJSON.message;
                }

                $error.text(message).show();
            })
            .always(() => {
                $submit.prop('disabled', false);
            });
    }

    /**
     * Reset modal state.
     */
    function resetModal() {
        $('#class-booking-form')[0].reset();
        $('#class-booking-form .is-invalid').removeClass('is-invalid');
        $error.hide().text('');
    }

    return {
        initialize,
    };
})();

$(function () {
    App.Pages.ClassBooking.initialize();
});
