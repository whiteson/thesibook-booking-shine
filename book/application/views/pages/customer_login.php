<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<div class="text-center mb-4">
    <h4 class="text-primary fw-semibold mb-1"><?= lang('customer_login') ?></h4>
    <p class="small mb-0"><?= lang('customer_login_hint') ?></p>
</div>

<div class="alert d-none"></div>

<form id="customer-login-form">
    <div class="mb-3">
        <label for="username" class="form-label"><?= lang('email') ?></label>
        <input type="email" id="username" class="form-control" required>
    </div>
    <div class="mb-4">
        <label for="password" class="form-label"><?= lang('password') ?></label>
        <input type="password" id="password" class="form-control" required>
    </div>
    <div class="d-grid gap-2 mb-3">
        <button type="submit" class="btn btn-primary">
            <i class="fas fa-sign-in-alt me-2"></i><?= lang('login') ?>
        </button>
    </div>
    <div class="text-center">
        <a href="<?= site_url('customer_register') . thesibook_tenant_query() ?>" class="small text-decoration-none">
            <?= lang('create_account') ?>
        </a>
        <span class="mx-2">|</span>
        <a href="<?= site_url('booking') . thesibook_tenant_query() ?>" class="small text-decoration-none">
            <?= lang('booking') ?>
        </a>
    </div>
</form>

<?php end_section('content'); ?>

<?php section('scripts'); ?>
<script src="<?= asset_url('assets/js/pages/customer_login.js') ?>"></script>
<?php end_section('scripts'); ?>
