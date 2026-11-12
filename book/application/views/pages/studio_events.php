<?php extend('layouts/backend_layout'); ?>

<?php section('content'); ?>

<div id="studio-events-page" class="container-fluid backend-page py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="mb-1"><?= lang('studio_events') ?></h3>
            <p class="text-muted mb-0"><?= lang('studio_events_hint') ?></p>
        </div>
        <button type="button" id="add-studio-event" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i><?= lang('add') ?>
        </button>
    </div>

    <div class="table-responsive bg-white border rounded">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th><?= lang('event_title') ?></th>
                <th><?= lang('service') ?></th>
                <th><?= lang('provider') ?></th>
                <th><?= lang('event_date') ?></th>
                <th><?= lang('lesson_capacity') ?></th>
                <th><?= lang('status') ?></th>
                <th></th>
            </tr>
            </thead>
            <tbody id="studio-events-table"></tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="studio-event-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><?= lang('studio_event') ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="<?= lang('close') ?>"></button>
            </div>
            <div class="modal-body">
                <form id="studio-event-form">
                    <input type="hidden" id="event-id" value="">
                    <div class="mb-3">
                        <label for="event-title" class="form-label"><?= lang('event_title') ?></label>
                        <input type="text" id="event-title" class="form-control required" maxlength="255">
                    </div>
                    <div class="mb-3">
                        <label for="event-description" class="form-label"><?= lang('description') ?></label>
                        <textarea id="event-description" class="form-control" rows="3" maxlength="2000"></textarea>
                    </div>
                    <div class="mb-3">
                        <label for="event-service" class="form-label"><?= lang('service') ?></label>
                        <select id="event-service" class="form-select required"></select>
                    </div>
                    <div class="mb-3">
                        <label for="event-provider" class="form-label"><?= lang('provider') ?></label>
                        <select id="event-provider" class="form-select required"></select>
                    </div>
                    <div class="mb-3">
                        <label for="event-start" class="form-label"><?= lang('event_date') ?></label>
                        <input type="datetime-local" id="event-start" class="form-control required">
                    </div>
                    <div class="mb-3">
                        <label for="event-capacity" class="form-label"><?= lang('lesson_capacity') ?></label>
                        <input type="number" id="event-capacity" class="form-control required" min="1" max="5000" value="12">
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="event-active" class="form-check-input" checked>
                        <label for="event-active" class="form-check-label"><?= lang('active') ?></label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><?= lang('cancel') ?></button>
                <button type="button" id="save-studio-event" class="btn btn-primary"><?= lang('save') ?></button>
            </div>
        </div>
    </div>
</div>

<?php end_section('content'); ?>

<?php section('scripts'); ?>
<script src="<?= asset_url('assets/js/pages/studio_events.js') ?>"></script>
<?php end_section('scripts'); ?>
