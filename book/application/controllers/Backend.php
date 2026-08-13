<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Legacy /backend URL — EA v1.5+ uses /calendar for admin.
 * Redirect so dashboard links and old docs keep working.
 */
class Backend extends EA_Controller
{
    public function index(): void
    {
        if (session('user_id')) {
            redirect('calendar');
            return;
        }

        redirect('login');
    }
}
