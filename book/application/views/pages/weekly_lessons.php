<?php extend('layouts/backend_layout'); ?>

<?php section('content'); ?>

<div id="weekly-lessons-page" class="container-fluid backend-page py-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="mb-1"><?= lang('weekly_lessons') ?></h3>
            <p class="text-muted mb-0"><?= lang('weekly_lessons_hint') ?></p>
        </div>
        <button type="button" id="add-weekly-lesson" class="btn btn-primary">
            <i class="fas fa-plus me-2"></i><?= lang('add') ?>
        </button>
    </div>

    <div class="table-responsive bg-white border rounded">
        <table class="table table-hover mb-0">
            <thead class="table-light">
            <tr>
                <th><?= lang('service') ?></th>
                <th><?= lang('provider') ?></th>
                <th><?= lang('weekday') ?></th>
                <th><?= lang('start_time') ?></th>
                <th><?= lang('status') ?></th>
                <th></th>
            </tr>
            </thead>
            <tbody id="weekly-lessons-table">
            </tbody>
        </table>
    </div>
</div>

<div class="modal fade" id="weekly-lesson-modal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title"><?= lang('weekly_lesson') ?></h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="<?= lang('close') ?>"></button>
            </div>
            <div class="modal-body">
                <form id="weekly-lesson-form">
                    <input type="hidden" id="lesson-id" value="">
                    <div class="mb-3">
                        <label for="lesson-service" class="form-label"><?= lang('service') ?></label>
                        <select id="lesson-service" class="form-select required"></select>
                    </div>
                    <div class="mb-3">
                        <label for="lesson-provider" class="form-label"><?= lang('provider') ?></label>
                        <select id="lesson-provider" class="form-select required"></select>
                    </div>
                    <div class="mb-3">
                        <label for="lesson-weekday" class="form-label"><?= lang('weekday') ?></label>
                        <select id="lesson-weekday" class="form-select required">
                            <option value="1"><?= lang('monday') ?></option>
                            <option value="2"><?= lang('tuesday') ?></option>
                            <option value="3"><?= lang('wednesday') ?></option>
                            <option value="4"><?= lang('thursday') ?></option>
                            <option value="5"><?= lang('friday') ?></option>
                            <option value="6"><?= lang('saturday') ?></option>
                            <option value="0"><?= lang('sunday') ?></option>
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="lesson-start-time" class="form-label"><?= lang('start_time') ?></label>
                        <input type="time" id="lesson-start-time" class="form-control required">
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="lesson-active" class="form-check-input" checked>
                        <label for="lesson-active" class="form-check-label"><?= lang('active') ?></label>
                    </div>
                </form>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal"><?= lang('cancel') ?></button>
                <button type="button" id="save-weekly-lesson" class="btn btn-primary"><?= lang('save') ?></button>
            </div>
        </div>
    </div>
</div>

<?php end_section('content'); ?>

<?php section('scripts'); ?>
<script src="<?= asset_url('assets/js/pages/weekly_lessons.js') ?>"></script>
<?php end_section('scripts'); ?>
