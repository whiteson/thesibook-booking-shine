<?php defined('BASEPATH') or exit('No direct script access allowed');
/* ----------------------------------------------------------------------------
 * Easy!Appointments - Online Appointment Scheduler
 *
 * @package     EasyAppointments
 * @author      A.Tselegidis <alextselegidis@gmail.com>
 * @copyright   Copyright (c) Alex Tselegidis
 * @license     https://opensource.org/licenses/GPL-3.0 - GPLv3
 * @link        https://easyappointments.org
 * @since       v1.0.0
 * ---------------------------------------------------------------------------- */

/**
 * Recovery controller.
 *
 * Handles the recovery page functionality.
 *
 * @package Controllers
 */
class Recovery extends EA_Controller
{
    /**
     * Recovery constructor.
     */
    public function __construct()
    {
        parent::__construct();

        $this->load->library('accounts');
        $this->load->library('email_messages');
    }

    /**
     * Display the password recovery page.
     */
    public function index(): void
    {
        method('get');

        $company_name = setting('company_name');

        html_vars([
            'page_title' => lang('forgot_your_password'),
            'dest_url' => session('dest_url', site_url('backend')),
            'company_name' => $company_name,
            'require_captcha' => setting('require_captcha'),
            'altcha_enabled' => setting('altcha_enabled'),
            'recovery_email_debug' => $this->recovery_email_debug_snapshot(),
        ]);

        $this->load->view('pages/recovery');
    }

    /**
     * Request a password reset link and send it via email.
     */
    public function perform(): void
    {
        try {
            method('post');

            check('username', 'string|null');
            check('email', 'email');
            check('captcha', 'string|null');

            $require_captcha = (bool) setting('require_captcha');

            // Validate CAPTCHA or ALTCHA
            if ($require_captcha) {
                $altcha_enabled = setting('altcha_enabled') === '1';

                if ($altcha_enabled) {
                    check('altcha_payload', 'string|null');
                    $altcha_payload = request('altcha_payload');

                    $this->load->library('altcha_client');

                    if (!$this->altcha_client->verify($altcha_payload)) {
                        json_response([
                            'success' => false,
                            'altcha_verification' => false,
                        ]);
                        return;
                    }
                } else {
                    $captcha = request('captcha');
                    $captcha_phrase = session('captcha_phrase');

                    if (strtoupper($captcha_phrase) !== strtoupper($captcha)) {
                        json_response([
                            'success' => false,
                            'captcha_verification' => false,
                        ]);
                        return;
                    }
                }
            }

            $username = request('username');
            $email = request('email');

            if (empty($username) && !empty($email)) {
                $username = $email;
            }

            if (empty($username)) {
                throw new InvalidArgumentException('No username value provided.');
            }

            if (!preg_match('/^[a-zA-Z0-9_@.\-]+$/', $username) || strlen($username) > 255) {
                throw new InvalidArgumentException('Invalid username format.');
            }

            if (empty($email)) {
                throw new InvalidArgumentException('No email value provided.');
            }

            // Validate email format
            if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 255) {
                throw new InvalidArgumentException('Invalid email format.');
            }

            $debug = $this->recovery_email_debug_enabled() ? ['steps' => []] : null;

            if ($debug !== null) {
                $debug['steps'][] = 'Request received for ' . $email;
                $debug['tenant'] = (string) ($_SESSION['thesibook_tenant'] ?? '');
            }

            // Always respond with success to prevent user enumeration
            // Even if the user doesn't exist, we don't reveal that information
            try {
                $reset_data = $this->accounts->generate_reset_token($username, $email);
                $company_color = setting('company_color');

                if ($debug !== null) {
                    $debug['steps'][] = 'User found; reset token generated';
                    $debug['user_found'] = true;
                }

                if ($reset_data) {
                    $reset_link = thesibook_password_reset_link($reset_data['token']);
                    $settings = [
                        'company_name' => setting('company_name'),
                        'company_link' => setting('company_link'),
                        'company_email' => config('from_address') ?: 'info@thesibook.gr',
                        'company_color' =>
                            !empty($company_color) && $company_color != DEFAULT_COMPANY_COLOR ? $company_color : null,
                    ];

                    if ($debug !== null) {
                        $debug['reset_link'] = $reset_link;
                        $debug['recipient'] = $reset_data['email'];
                        $debug['mail'] = $this->recovery_email_debug_snapshot();
                    }

                    try {
                        $this->email_messages->send_password_reset_link($reset_link, $reset_data['email'], $settings);

                        if ($debug !== null) {
                            $debug['mail_sent'] = true;
                            $debug['steps'][] = 'PHPMailer send() returned success';
                        }
                    } catch (Throwable $mail_error) {
                        log_message(
                            'error',
                            'Password reset email failed for ' .
                                $reset_data['email'] .
                                ': ' .
                                $mail_error->getMessage(),
                        );

                        if ($debug !== null) {
                            $debug['mail_sent'] = false;
                            $debug['mail_error'] = $mail_error->getMessage();
                            $debug['steps'][] = 'Mail failed: ' . $mail_error->getMessage();
                        }
                    }
                }
            } catch (RuntimeException $e) {
                // Log the actual error but don't reveal it to the user
                log_message(
                    'info',
                    'Password recovery attempted for non-existent user: ' .
                        $username .
                        ' / ' .
                        $email .
                        ' from IP: ' .
                        $this->input->ip_address(),
                );

                if ($debug !== null) {
                    $debug['user_found'] = false;
                    $debug['mail_sent'] = false;
                    $debug['lookup_error'] = $e->getMessage();
                    $debug['steps'][] = 'No matching user for email/username';
                }
            }

            // Add a small delay to prevent timing attacks
            usleep(random_int(100000, 500000)); // 100-500ms delay

            $response = ['success' => true];

            if ($debug !== null) {
                $response['debug'] = $debug;
            }

            json_response($response);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    /**
     * Whether recovery email debug output is enabled (tenant DEBUG_MODE only).
     */
    protected function recovery_email_debug_enabled(): bool
    {
        return class_exists('Config', false) && Config::DEBUG_MODE;
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function recovery_email_debug_snapshot(): ?array
    {
        if (!$this->recovery_email_debug_enabled()) {
            return null;
        }

        return array_merge([
            'enabled' => true,
            'tenant' => (string) ($_SESSION['thesibook_tenant'] ?? ''),
            'environment' => defined('ENVIRONMENT') ? ENVIRONMENT : 'unknown',
            'protocol' => (string) config('protocol'),
            'from_address' => (string) (config('from_address') ?: 'info@thesibook.gr'),
            'from_name' => (string) (config('from_name') ?: setting('company_name')),
            'smtp_host' => (string) (config('smtp_host') ?: ''),
            'smtp_port' => (string) (config('smtp_port') ?: ''),
            'smtp_user' => (string) (config('smtp_user') ?: ''),
            'smtp_crypto' => (string) (config('smtp_crypto') ?: ''),
            'smtp_auth' => (bool) config('smtp_auth'),
            'smtp_password_set' => (string) config('smtp_pass') !== '',
            'delivery_mode' => (string) (config('delivery_mode') ?: config('protocol')),
        ], function_exists('thesibook_email_debug_status') ? thesibook_email_debug_status() : [
            'email_config_file' => is_readable(FCPATH . 'thesibook-email-config.php') ? 'loaded' : 'missing',
        ]);
    }

    /**
     * Display the password reset form.
     */
    public function reset(): void
    {
        method('get');

        $token = $this->input->get('token');

        if (empty($token)) {
            redirect('recovery');
            return;
        }

        // Validate token format (should be 64 hex characters)
        if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
            html_vars([
                'page_title' => lang('reset_password'),
                'token_valid' => false,
                'error_message' => lang('invalid_reset_token'),
            ]);

            $this->load->view('pages/password_reset');

            return;
        }

        // Validate the token
        $user = $this->accounts->validate_reset_token($token);

        if (!$user) {
            html_vars([
                'page_title' => lang('reset_password'),
                'token_valid' => false,
                'error_message' => lang('invalid_or_expired_token'),
            ]);
            $this->load->view('pages/password_reset');
            return;
        }

        html_vars([
            'page_title' => lang('reset_password'),
            'token_valid' => true,
            'token' => $token,
            'company_name' => setting('company_name'),
            'require_captcha' => setting('require_captcha'),
            'altcha_enabled' => setting('altcha_enabled'),
        ]);

        $this->load->view('pages/password_reset');
    }

    /**
     * Complete the password reset process.
     */
    public function complete(): void
    {
        try {
            method('post');

            check('captcha', 'string|null');

            $require_captcha = (bool) setting('require_captcha');

            // Validate CAPTCHA or ALTCHA
            if ($require_captcha) {
                $altcha_enabled = setting('altcha_enabled') === '1';

                if ($altcha_enabled) {
                    check('altcha_payload', 'string|null');
                    $altcha_payload = request('altcha_payload');

                    $this->load->library('altcha_client');

                    if (!$this->altcha_client->verify($altcha_payload)) {
                        json_response([
                            'success' => false,
                            'altcha_verification' => false,
                        ]);
                        return;
                    }
                } else {
                    $captcha = request('captcha');
                    $captcha_phrase = session('captcha_phrase');

                    if (strtoupper($captcha_phrase) !== strtoupper($captcha)) {
                        json_response([
                            'success' => false,
                            'captcha_verification' => false,
                        ]);
                        return;
                    }
                }
            }

            $token = request('token');
            $password = request('password');
            $password_confirm = request('password_confirm');

            if (empty($token)) {
                throw new InvalidArgumentException('No token provided.');
            }

            // Validate token format
            if (!preg_match('/^[a-f0-9]{64}$/', $token)) {
                throw new InvalidArgumentException('Invalid token format.');
            }

            if (empty($password)) {
                throw new InvalidArgumentException('No password provided.');
            }

            if (strlen($password) < MIN_PASSWORD_LENGTH) {
                throw new InvalidArgumentException(
                    str_replace('$number', MIN_PASSWORD_LENGTH, lang('password_length_notice')),
                );
            }

            if ($password !== $password_confirm) {
                throw new InvalidArgumentException(lang('passwords_mismatch'));
            }

            $this->accounts->reset_password_with_token($token, $password);

            json_response([
                'success' => true,
            ]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }
}
