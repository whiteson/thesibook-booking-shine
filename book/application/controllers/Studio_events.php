<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Admin CRUD for one-off events, separate from weekly lessons.
 */
class Studio_events extends EA_Controller
{
    public function __construct()
    {
        parent::__construct();

        $this->load->model('studio_events_model');
        $this->load->model('services_model');
        $this->load->model('providers_model');
        $this->load->library('accounts');
    }

    public function index(): void
    {
        method('get');

        session(['dest_url' => thesibook_append_tenant(site_url('studio_events'))]);

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
            'events' => $this->studio_events_model->get_all(),
        ]);

        html_vars([
            'page_title' => lang('studio_events'),
            'active_menu' => PRIV_SERVICES,
            'user_display_name' => $this->accounts->get_user_display_name($user_id),
        ]);

        $this->load->view('pages/studio_events');
    }

    public function save(): void
    {
        try {
            method('post');

            if (cannot('edit', PRIV_SERVICES)) {
                abort(403, 'Forbidden');
            }

            check('event', 'array');

            $id = $this->studio_events_model->save(request('event'));

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

            check('event_id', 'numeric');

            $this->studio_events_model->delete((int) request('event_id'));

            json_response();
        } catch (Throwable $e) {
            json_exception($e);
        }
    }
}
