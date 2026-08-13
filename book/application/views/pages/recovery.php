<?php extend('layouts/account_layout'); ?>

<?php section('content'); ?>

<div class="text-center mb-4">
    <h4 class="text-primary fw-semibold mb-1">
        <?= lang('forgot_your_password') ?>
    </h4>
    
    <p class="small mb-0">
        <?= lang('type_email_for_reset_link') ?>
    </p>
</div>

<div class="alert d-none"></div>

<?php if (!empty(vars('recovery_email_debug'))): ?>
    <div id="recovery-email-debug" class="alert alert-warning small mb-4">
        <div class="fw-semibold mb-2">
            <i class="fas fa-bug me-1"></i>
            Email debug (DEBUG_MODE)
        </div>
        <pre class="mb-0 recovery-debug-pre small bg-dark text-light p-2 rounded"><?= e(
            json_encode(vars('recovery_email_debug'), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES),
        ) ?></pre>
        <div id="recovery-email-debug-result" class="mt-3" style="display:none;">
            <div class="fw-semibold mb-1">Last submit result</div>
            <pre class="mb-0 recovery-debug-pre"></pre>
        </div>
    </div>
<?php endif; ?>

<form>
    <div class="mb-4">
        <label for="email" class="form-label fw-medium">
            <?= lang('email') ?>
        </label>
        <div class="input-group">
            <span class="input-group-text bg-light border-end-0">
                <i class="fas fa-envelope"></i>
            </span>
            <input type="email" id="email" required
                   placeholder="<?= lang('enter_email_here') ?>" class="form-control border-start-0 ps-2"/>
        </div>
    </div>

    <?php if (vars('require_captcha')): ?>
        <?php if (vars('altcha_enabled') === '1'): ?>
            <div class="mb-4">
                <div id="altcha-widget" class="altcha-widget"></div>
                <input type="hidden" id="altcha-payload" value="">
                <span id="altcha-hint" class="help-block text-danger small" style="opacity:0">&nbsp;</span>
            </div>
        <?php else: ?>
            <div class="mb-4">
                <label class="captcha-title form-label fw-medium" for="captcha-text">
                    CAPTCHA
                    <button type="button" class="btn btn-link text-dark text-decoration-none py-0 px-1">
                        <i class="fas fa-sync-alt"></i>
                    </button>
                </label>
                <img class="captcha-image d-block mb-2 rounded" src="<?= site_url('captcha') ?>" alt="CAPTCHA">
                <input id="captcha-text" class="captcha-text form-control" type="text" placeholder="<?= lang('enter_captcha_here') ?>"/>
                <span id="captcha-hint" class="help-block text-danger small" style="opacity:0">&nbsp;</span>
            </div>
        <?php endif; ?>
    <?php endif; ?>
    
    <div class="d-grid gap-2 mb-3">
        <button type="submit" id="get-new-password" class="btn btn-primary">
            <i class="fas fa-paper-plane me-2"></i>
            <?= lang('send_reset_link') ?>
        </button>
    </div>
    
    <div class="text-center">
        <a href="<?= site_url('login') . thesibook_tenant_query() ?>" class="text-decoration-none small">
            <i class="fas fa-arrow-left me-1"></i>
            <?= lang('go_to_login') ?>
        </a>
    </div>
</form>

<?php end_section('content'); ?>

<?php section('scripts'); ?>

<script src="<?= asset_url('assets/js/http/recovery_http_client.js') ?>"></script>
<script src="<?= asset_url('assets/js/pages/recovery.js') ?>"></script>

<?php end_section('scripts'); ?>
