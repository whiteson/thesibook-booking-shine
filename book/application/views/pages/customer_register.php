<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<div class="text-center mb-4">
    <h4 class="text-primary fw-semibold mb-1"><?= lang('customer_register') ?></h4>
    <p class="small mb-0"><?= lang('customer_register_hint') ?></p>
</div>

<div class="alert d-none"></div>

<form id="customer-register-form">
    <div class="mb-3">
        <label for="first-name" class="form-label"><?= lang('first_name') ?> *</label>
        <input type="text" id="first-name" class="form-control required" maxlength="100" required>
    </div>
    <div class="mb-3">
        <label for="last-name" class="form-label"><?= lang('last_name') ?> *</label>
        <input type="text" id="last-name" class="form-control required" maxlength="120" required>
    </div>
    <div class="mb-3">
        <label for="email" class="form-label"><?= lang('email') ?> *</label>
        <input type="email" id="email" class="form-control required" maxlength="120" required>
    </div>
    <div class="mb-3">
        <label for="phone-number" class="form-label"><?= lang('phone_number') ?></label>
        <input type="text" id="phone-number" class="form-control" maxlength="60">
    </div>
    <div class="mb-4">
        <label for="password" class="form-label"><?= lang('password') ?> *</label>
        <input type="password" id="password" class="form-control required" minlength="8" required>
        <div class="form-text"><?= lang('customer_password_min_length') ?></div>
    </div>
    <div class="d-grid gap-2 mb-3">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-user-plus me-2"></i><?= lang('register') ?>
        </button>
    </div>
    <div class="text-center">
        <a href="<?= site_url('customer_register/login') . thesibook_tenant_query() ?>" class="small text-decoration-none">
            <?= lang('already_have_account') ?>
        </a>
        <span class="mx-2">|</span>
        <a href="<?= site_url('booking') . thesibook_tenant_query() ?>" class="small text-decoration-none">
            <?= lang('booking') ?>
        </a>
    </div>
</form>

<?php end_section('content'); ?>

<?php section('scripts'); ?>
<script src="<?= asset_url('assets/js/pages/customer_register.js') ?>"></script>
<?php end_section('scripts'); ?>
