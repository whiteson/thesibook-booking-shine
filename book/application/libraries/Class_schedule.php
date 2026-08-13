<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Builds a daily class schedule for class-oriented booking mode.
 *
 * Each service is linked to one or more slot providers in the backend; customers
 * only see class name, time, and occupancy — never the provider.
 */
class Class_schedule
{
    protected EA_Controller|CI_Controller $CI;

    public function __construct()
    {
        $this->CI = &get_instance();

        $this->CI->load->model('appointments_model');
        $this->CI->load->model('providers_model');
        $this->CI->load->model('services_model');
        $this->CI->load->library('availability');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function get_weekly_classes(string $week_start_date): array
    {
        $this->CI->load->model('weekly_lessons_model');

        if ($this->CI->weekly_lessons_model->has_active_lessons()) {
            return $this->get_weekly_classes_from_lessons($week_start_date);
        }

        $classes = [];
        $week_start = DateTime::createFromFormat('Y-m-d', $week_start_date);

        if (!$week_start) {
            return [];
        }

        for ($day = 0; $day < 7; $day++) {
            $date = (clone $week_start)->modify('+' . $day . ' days')->format('Y-m-d');
            $classes = array_merge($classes, $this->get_daily_classes($date));
        }

        usort($classes, static function (array $a, array $b): int {
            return strcmp($a['start_datetime'], $b['start_datetime']);
        });

        return $classes;
    }

    /**
     * Build calendar events from fixed weekly lesson slots.
     *
     * @return array<int, array<string, mixed>>
     */
    protected function get_weekly_classes_from_lessons(string $week_start_date): array
    {
        $classes = [];
        $week_start = DateTime::createFromFormat('Y-m-d', $week_start_date);

        if (!$week_start) {
            return [];
        }

        $lessons = $this->CI->weekly_lessons_model->get_active();

        for ($day = 0; $day < 7; $day++) {
            $current = (clone $week_start)->modify('+' . $day . ' days');
            $date = $current->format('Y-m-d');
            $weekday = (int) $current->format('w');

            foreach ($lessons as $lesson) {
                if ((int) $lesson['weekday'] !== $weekday) {
                    continue;
                }

                $hour = substr((string) $lesson['start_time'], 0, 5);
                $service = [
                    'id' => (int) $lesson['id_services'],
                    'name' => $lesson['service_name'],
                    'description' => $lesson['description'] ?? '',
                    'color' => $lesson['color'] ?? '#2563eb',
                    'duration' => max((int) $lesson['duration'], EVENT_MINIMUM_DURATION),
                ];
                $provider = [
                    'id' => (int) $lesson['id_users_provider'],
                    'first_name' => $lesson['first_name'] ?? '',
                    'last_name' => $lesson['last_name'] ?? '',
                ];
                $capacity = max(1, (int) $lesson['attendants_number']);

                $classes[] = $this->build_class_entry($date, $service, $provider, $hour, $capacity);
            }
        }

        usort($classes, static fn(array $a, array $b): int => strcmp($a['start_datetime'], $b['start_datetime']));

        return $classes;
    }

    /**
     * Normalize any date to the first day of its calendar week.
     */
    public function get_week_start(string $date, int $first_weekday = 0): string
    {
        $current = DateTime::createFromFormat('Y-m-d', $date);

        if (!$current) {
            return $date;
        }

        $day_of_week = (int) $current->format('w');
        $offset = ($day_of_week - $first_weekday + 7) % 7;

        if ($offset > 0) {
            $current->modify('-' . $offset . ' days');
        }

        return $current->format('Y-m-d');
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function get_daily_classes(string $date): array
    {
        $classes = [];
        $seen = [];

        $services = $this->CI->services_model->get_available_services(true);

        foreach ($services as $service) {
            $provider_ids = $this->CI->services_model->get_provider_ids((int) $service['id']);

            foreach ($provider_ids as $provider_id) {
                $provider = $this->CI->providers_model->find($provider_id);

                if (!$provider) {
                    continue;
                }

                try {
                    $available_hours = $this->CI->availability->get_available_hours($date, $service, $provider);
                } catch (Exception) {
                    $available_hours = [];
                }

                $capacity = max(1, (int) $service['attendants_number']);

                foreach ($available_hours as $hour) {
                    $key = $this->slot_key((int) $service['id'], $provider_id, $hour);
                    $seen[$key] = true;
                    $classes[] = $this->build_class_entry($date, $service, $provider, $hour, $capacity);
                }

                $appointments = $this->CI->appointments_model
                    ->query()
                    ->select('start_datetime')
                    ->where('id_services', (int) $service['id'])
                    ->where('id_users_provider', $provider_id)
                    ->where('is_unavailability', false)
                    ->where('DATE(start_datetime)', $date)
                    ->get()
                    ->result_array();

                $grouped = [];

                foreach ($appointments as $appointment) {
                    $hour = date('H:i', strtotime($appointment['start_datetime']));
                    $grouped[$hour] = ($grouped[$hour] ?? 0) + 1;
                }

                foreach ($grouped as $hour => $booked) {
                    $key = $this->slot_key((int) $service['id'], $provider_id, $hour);

                    if (isset($seen[$key])) {
                        continue;
                    }

                    if ($booked >= $capacity) {
                        $classes[] = $this->build_class_entry(
                            $date,
                            $service,
                            $provider,
                            $hour,
                            $capacity,
                            true,
                        );
                        $seen[$key] = true;
                    }
                }
            }
        }

        usort($classes, static fn(array $a, array $b): int => strcmp($a['start_time'], $b['start_time']));

        return $classes;
    }

    /**
     * @param array<string, mixed> $service
     *
     * @return array<string, mixed>
     */
    protected function build_class_entry(
        string $date,
        array $service,
        array $provider,
        string $hour,
        int $capacity,
        bool $force_full = false,
    ): array {
        $provider_id = (int) $provider['id'];
        $duration = max((int) $service['duration'], EVENT_MINIMUM_DURATION);
        $start = DateTime::createFromFormat('Y-m-d H:i', $date . ' ' . $hour);
        $end = clone $start;
        $end->modify('+' . $duration . ' minutes');

        $booked = $this->CI->appointments_model->get_attendants_number_for_period(
            $start,
            $end,
            (int) $service['id'],
            $provider_id,
        );

        $is_full = $force_full || $booked >= $capacity;
        $teacher_name = trim(($provider['first_name'] ?? '') . ' ' . ($provider['last_name'] ?? ''));

        return [
            'service_id' => (int) $service['id'],
            'provider_id' => $provider_id,
            'name' => $service['name'],
            'description' => $service['description'] ?? '',
            'color' => $service['color'] ?? '#2563eb',
            'duration' => $duration,
            'date' => $date,
            'teacher_name' => $teacher_name,
            'start_time' => $hour,
            'end_time' => $end->format('H:i'),
            'start_datetime' => $start->format('Y-m-d H:i:s'),
            'end_datetime' => $end->format('Y-m-d H:i:s'),
            'booked' => $booked,
            'capacity' => $capacity,
            'is_full' => $is_full,
            'is_available' => !$is_full,
        ];
    }

    protected function slot_key(int $service_id, int $provider_id, string $hour): string
    {
        return $service_id . '-' . $provider_id . '-' . $hour;
    }
}
