<?php extend('layouts/booking_layout'); ?>

<?php section('content'); ?>

<?php if (empty(vars('available_services'))): ?>

<?php component('booking_no_services_message'); ?>

<?php else: ?>

<div id="class-booking-page" class="class-booking-page p-3 p-md-4">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <p class="small text-muted mb-0">
            <i class="fas fa-info-circle me-1"></i><?= lang('class_guest_hint') ?>
        </p>
        <div class="d-flex flex-wrap gap-2 align-items-center">
            <?php if (vars('logged_in_customer')): ?>
                <span class="badge bg-light text-dark border align-self-center px-3 py-2">
                    <i class="fas fa-user me-1"></i><?= e(vars('logged_in_customer_name') ?: session('user_email')) ?>
                </span>
                <a href="<?= site_url('customer_register/logout') . thesibook_tenant_query() ?>"
                   class="btn btn-sm btn-outline-secondary">
                    <?= lang('log_out') ?>
                </a>
            <?php else: ?>
                <span class="small text-muted d-none d-md-inline"><?= lang('class_optional_account') ?></span>
                <a href="<?= site_url('customer_register/login') . thesibook_tenant_query() ?>"
                   class="btn btn-sm btn-link text-decoration-none">
                    <?= lang('customer_login') ?>
                </a>
                <a href="<?= site_url('customer_register') . thesibook_tenant_query() ?>"
                   class="btn btn-sm btn-outline-secondary">
                    <?= lang('register') ?>
                </a>
            <?php endif; ?>
        </div>
    </div>

    <div class="text-center mb-3">
        <h2 class="fw-light text-muted mb-2"><?= lang('class_schedule_title') ?></h2>
        <p class="small text-muted mb-0"><?= lang('class_weekly_hint') ?></p>
    </div>

    <div id="class-schedule-loading" class="text-center text-muted py-5" style="display:none;">
        <i class="fas fa-spinner fa-spin fa-2x"></i>
    </div>

    <div id="class-schedule-error" class="alert alert-danger d-none" role="alert"></div>

    <div id="class-week-calendar" class="class-week-calendar"></div>

    <p id="class-schedule-empty" class="text-center text-muted small mt-3 mb-0" style="display:none;">
        <i class="fas fa-calendar-week me-1"></i>
        <?= lang('class_no_classes_week') ?>
    </p>
</div>

<div class="modal fade" id="class-booking-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><?= lang('class_booking_modal_title') ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"
                        aria-label="<?= lang('close') ?>"></button>
            </div>
            <div class="modal-body">
                <div id="class-booking-summary" class="mb-4 p-3 rounded bg-light"></div>
                <p class="small text-muted mb-3"><?= lang('class_guest_booking_hint') ?></p>

                <form id="class-booking-form">
                    <?php if (vars('display_first_name')): ?>
                        <div class="mb-3">
                            <label for="class-first-name" class="form-label">
                                <?= lang('first_name') ?>
                                <?php if (vars('require_first_name')): ?>
                                    <span class="text-danger">*</span>
                                <?php endif; ?>
                            </label>
                            <input type="text" id="class-first-name"
                                   class="<?= vars('require_first_name') ? 'required' : '' ?> form-control"
                                   maxlength="100"/>
                        </div>
                    <?php endif; ?>

                    <?php if (vars('display_last_name')): ?>
                        <div class="mb-3">
                            <label for="class-last-name" class="form-label">
                                <?= lang('last_name') ?>
                                <?php if (vars('require_last_name')): ?>
                                    <span class="text-danger">*</span>
                                <?php endif; ?>
                            </label>
                            <input type="text" id="class-last-name"
                                   class="<?= vars('require_last_name') ? 'required' : '' ?> form-control"
                                   maxlength="120"/>
                        </div>
                    <?php endif; ?>

                    <?php if (vars('display_email')): ?>
                        <div class="mb-3">
                            <label for="class-email" class="form-label">
                                <?= lang('email') ?>
                                <?php if (vars('require_email')): ?>
                                    <span class="text-danger">*</span>
                                <?php endif; ?>
                            </label>
                            <input type="email" id="class-email"
                                   class="<?= vars('require_email') ? 'required' : '' ?> form-control"
                                   maxlength="120"/>
                        </div>
                    <?php endif; ?>

                    <?php if (vars('display_phone_number')): ?>
                        <div class="mb-3">
                            <label for="class-phone-number" class="form-label">
                                <?= lang('phone_number') ?>
                                <?php if (vars('require_phone_number')): ?>
                                    <span class="text-danger">*</span>
                                <?php endif; ?>
                            </label>
                            <input type="text" id="class-phone-number"
                                   class="<?= vars('require_phone_number') ? 'required' : '' ?> form-control"
                                   maxlength="60"/>
                        </div>
                    <?php endif; ?>

                    <?php if (vars('display_notes')): ?>
                        <div class="mb-3">
                            <label for="class-notes" class="form-label">
                                <?= lang('notes') ?>
                                <?php if (vars('require_notes')): ?>
                                    <span class="text-danger">*</span>
                                <?php endif; ?>
                            </label>
                            <textarea id="class-notes" rows="3"
                                      class="<?= vars('require_notes') ? 'required' : '' ?> form-control"></textarea>
                        </div>
                    <?php endif; ?>

                    <input type="hidden" id="class-selected-service-id" value="">
                    <input type="hidden" id="class-selected-provider-id" value="">
                    <input type="hidden" id="class-selected-start-datetime" value="">
                    <input type="hidden" id="class-selected-end-datetime" value="">
                </form>

                <div id="class-booking-error" class="alert alert-danger mt-3" style="display:none;"></div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                    <?= lang('cancel') ?>
                </button>
                <button type="button" id="class-booking-submit" class="btn btn-primary">
                    <i class="fas fa-check me-2"></i>
                    <?= lang('confirm') ?>
                </button>
            </div>
        </div>
    </div>
</div>

<?php endif; ?>

<?php end_section('content'); ?>

<?php section('styles'); ?>
<link rel="stylesheet" type="text/css" href="<?= asset_url('assets/css/class_booking.css') ?>">
<?php end_section('styles'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/vendor/fullcalendar/index.global.min.js') ?>"></script>
<script src="<?= asset_url('assets/vendor/fullcalendar-moment/index.global.min.js') ?>"></script>
<script src="<?= asset_url('assets/js/utils/lang.js') ?>"></script>
<script src="<?= asset_url('assets/js/utils/ui.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/class_booking.js') ?>"></script>

<?php end_section('scripts'); ?>
