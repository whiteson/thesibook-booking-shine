<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Public customer registration and login (class booking).
 */
class Customer_register extends EA_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->model('customers_model');
        $this->load->model('roles_model');
        $this->load->library('accounts');
    }

    public function index(): void
    {
        method('get');

        if ($this->is_customer_logged_in()) {
            redirect('booking');

            return;
        }

        html_vars([
            'page_title' => lang('customer_register'),
            'company_name' => setting('company_name'),
        ]);

        $this->load->view('pages/customer_register');
    }

    public function login(): void
    {
        method('get');

        if ($this->is_customer_logged_in()) {
            redirect('booking');

            return;
        }

        html_vars([
            'page_title' => lang('customer_login'),
            'company_name' => setting('company_name'),
        ]);

        $this->load->view('pages/customer_login');
    }

    public function register(): void
    {
        try {
            method('post');

            check('first_name', 'string');
            check('last_name', 'string');
            check('email', 'string');
            check('password', 'string');
            check('phone_number', 'string|null');

            $email = strtolower(trim(request('email')));

            if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
                throw new InvalidArgumentException(lang('invalid_email'));
            }

            $password = request('password');

            if (strlen($password) < 8) {
                throw new InvalidArgumentException(lang('customer_password_min_length'));
            }

            if ($this->customers_model->exists(['email' => $email])) {
                throw new InvalidArgumentException(lang('customer_email_taken'));
            }

            $customer_id = $this->customers_model->save([
                'first_name' => trim(request('first_name')),
                'last_name' => trim(request('last_name')),
                'email' => $email,
                'phone_number' => trim((string) request('phone_number')),
                'timezone' => 'Europe/Athens',
                'language' => session('language') ?? config('language'),
            ]);

            $salt = generate_salt();
            $hash = hash_password($salt, $password);

            $this->db->insert('user_settings', [
                'id_users' => $customer_id,
                'username' => $email,
                'password' => $hash,
                'salt' => $salt,
                'notifications' => 1,
                'calendar_view' => CALENDAR_VIEW_DEFAULT,
            ]);

            $user_data = $this->accounts->check_login($email, $password);

            if ($user_data) {
                $this->session->sess_regenerate(true);
                session($user_data);
            }

            json_response(['success' => true]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    public function validate(): void
    {
        try {
            method('post');

            check('username', 'string');
            check('password', 'string');

            $username = trim(request('username'));
            $password = request('password');
            $user_data = $this->accounts->check_login($username, $password);

            if (empty($user_data) || ($user_data['role_slug'] ?? '') !== DB_SLUG_CUSTOMER) {
                usleep(random_int(100000, 300000));

                json_response([
                    'success' => false,
                    'message' => lang('invalid_credentials_provided'),
                ]);

                return;
            }

            $this->session->sess_regenerate(true);
            session($user_data);

            json_response(['success' => true]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    public function logout(): void
    {
        method('get');

        if (($this->session->userdata('role_slug') ?? '') === DB_SLUG_CUSTOMER) {
            $this->session->sess_destroy();
        }

        redirect('booking');
    }

    protected function is_customer_logged_in(): bool
    {
        return session('user_id') && session('role_slug') === DB_SLUG_CUSTOMER;
    }
}
