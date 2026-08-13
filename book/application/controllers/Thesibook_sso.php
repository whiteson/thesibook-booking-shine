<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Single sign-on from the ThesiBook dashboard into EA admin (no second password).
 */
class Thesibook_sso extends EA_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->library('accounts');
        $this->load->library('thesibook_sso_token');
        $this->load->model('users_model');
        $this->load->model('roles_model');
        $this->load->library('timezones');
    }

    /**
     * Accept a signed token from www.thesibook.gr and start an EA admin session.
     */
    public function consume(): void
    {
        method('get');

        if (session('user_id')) {
            redirect('calendar' . thesibook_tenant_query());

            return;
        }

        $token = (string) request('token', '');

        if ($token === '') {
            show_error('Missing sign-in token.', 400);

            return;
        }

        $claims = $this->thesibook_sso_token->verify_token($token);

        if ($claims === null) {
            show_error('Invalid or expired sign-in link. Open booking admin from your ThesiBook dashboard again.', 403);

            return;
        }

        $session_tenant = (string) ($_SESSION['thesibook_tenant'] ?? '');

        if ($session_tenant !== '' && $session_tenant !== $claims['slug']) {
            show_error('Workspace mismatch.', 403);

            return;
        }

        $user = $this->find_admin_by_email($claims['email']);

        if ($user === null) {
            show_error('No booking admin account found for this user.', 403);

            return;
        }

        $role = $this->roles_model->find($user['id_roles']);
        $default_timezone = $this->timezones->get_default_timezone();
        $username = $this->admin_username($user['id']) ?? $user['email'];

        $this->session->sess_regenerate(true);

        session([
            'user_id' => $user['id'],
            'user_email' => $user['email'],
            'username' => $username,
            'timezone' => !empty($user['timezone']) ? $user['timezone'] : $default_timezone,
            'language' => !empty($user['language']) ? $user['language'] : Config::LANGUAGE,
            'role_slug' => $role['slug'],
        ]);

        log_message(
            'info',
            'ThesiBook SSO login for ' . $user['email'] . ' tenant ' . $claims['slug'],
        );

        redirect('calendar' . thesibook_tenant_query());
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function find_admin_by_email(string $email): ?array
    {
        $result = $this->db
            ->select('users.*')
            ->from('users')
            ->join('roles', 'roles.id = users.id_roles', 'inner')
            ->where('users.email', $email)
            ->where('roles.slug', DB_SLUG_ADMIN)
            ->limit(1)
            ->get()
            ->row_array();

        return $result ?: null;
    }

    protected function admin_username(int $user_id): ?string
    {
        $row = $this->db
            ->select('username')
            ->from('user_settings')
            ->where('id_users', $user_id)
            ->limit(1)
            ->get()
            ->row_array();

        return $row['username'] ?? null;
    }
}
