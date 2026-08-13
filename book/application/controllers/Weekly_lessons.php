<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Admin CRUD for recurring weekly lesson slots.
 */
class Weekly_lessons extends EA_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->model('weekly_lessons_model');
        $this->load->model('services_model');
        $this->load->model('providers_model');
        $this->load->library('accounts');
    }

    public function index(): void
    {
        method('get');

        session(['dest_url' => site_url('weekly_lessons')]);

        $user_id = session('user_id');

        if (cannot('view', PRIV_SERVICES)) {
            if ($user_id) {
                abort(403, 'Forbidden');
            }

            redirect('login');

            return;
        }

        script_vars([
            'services' => $this->services_model->get(),
            'providers' => $this->providers_model->get(),
            'lessons' => $this->weekly_lessons_model->get_all(),
        ]);

        html_vars([
            'page_title' => lang('weekly_lessons'),
            'active_menu' => PRIV_SERVICES,
            'user_display_name' => $this->accounts->get_user_display_name($user_id),
        ]);

        $this->load->view('pages/weekly_lessons');
    }

    public function save(): void
    {
        try {
            method('post');

            if (cannot('edit', PRIV_SERVICES)) {
                abort(403, 'Forbidden');
            }

            check('lesson', 'array');

            $lesson = request('lesson');
            $lesson['start_time'] = substr((string) ($lesson['start_time'] ?? ''), 0, 5) . ':00';
            $lesson['is_active'] = !empty($lesson['is_active']) ? 1 : 0;

            $id = $this->weekly_lessons_model->save($lesson);

            json_response(['id' => $id]);
        } catch (Throwable $e) {
            json_exception($e);
        }
    }

    public function destroy(): void
    {
        try {
            method('post');

            if (cannot('delete', PRIV_SERVICES)) {
                abort(403, 'Forbidden');
            }

            check('lesson_id', 'numeric');

            $this->weekly_lessons_model->delete((int) request('lesson_id'));

            json_response();
        } catch (Throwable $e) {
            json_exception($e);
        }
    }
}
