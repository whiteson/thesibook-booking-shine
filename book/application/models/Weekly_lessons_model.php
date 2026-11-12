<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Recurring weekly lesson slots (class-oriented booking).
 */
class Weekly_lessons_model extends EA_Model
{
    protected array $casts = [
        'id' => 'integer',
        'id_services' => 'integer',
        'id_users_provider' => 'integer',
        'weekday' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function get_active(): array
    {
        $rows = $this->db
            ->select('weekly_lessons.*, services.name AS service_name, services.duration, services.color, services.attendants_number, services.description, users.first_name, users.last_name')
            ->from('weekly_lessons')
            ->join('services', 'services.id = weekly_lessons.id_services', 'inner')
            ->join('users', 'users.id = weekly_lessons.id_users_provider', 'inner')
            ->where('weekly_lessons.is_active', 1)
            ->order_by('weekly_lessons.weekday', 'ASC')
            ->order_by('weekly_lessons.start_time', 'ASC')
            ->get()
            ->result_array();

        foreach ($rows as &$row) {
            $this->cast($row);
        }

        return $rows;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    public function get_all(): array
    {
        $rows = $this->db
            ->select('weekly_lessons.*, services.name AS service_name, users.first_name, users.last_name')
            ->from('weekly_lessons')
            ->join('services', 'services.id = weekly_lessons.id_services', 'inner')
            ->join('users', 'users.id = weekly_lessons.id_users_provider', 'inner')
            ->order_by('weekly_lessons.weekday', 'ASC')
            ->order_by('weekly_lessons.start_time', 'ASC')
            ->get()
            ->result_array();

        foreach ($rows as &$row) {
            $this->cast($row);
        }

        return $rows;
    }

    public function save(array $lesson): int
    {
        $lesson = $this->normalize($lesson);
        $this->validate($lesson);

        if (empty($lesson['id'])) {
            unset($lesson['id']);

            return $this->insert($lesson);
        }

        return $this->update($lesson);
    }

    /**
     * @param array<string, mixed> $lesson
     *
     * @return array<string, mixed>
     */
    protected function normalize(array $lesson): array
    {
        $allowed = [
            'id',
            'id_services',
            'id_users_provider',
            'weekday',
            'start_time',
            'capacity',
            'is_active',
        ];

        $lesson = array_intersect_key($lesson, array_flip($allowed));
        $lesson['id_services'] = (int) ($lesson['id_services'] ?? 0);
        $lesson['id_users_provider'] = (int) ($lesson['id_users_provider'] ?? 0);
        $lesson['weekday'] = (int) ($lesson['weekday'] ?? -1);
        $lesson['is_active'] = !empty($lesson['is_active']) ? 1 : 0;
        $capacity = $lesson['capacity'] ?? null;
        $lesson['capacity'] = $capacity === null || $capacity === '' || (int) $capacity <= 0 ? null : (int) $capacity;

        if (empty($lesson['id'])) {
            unset($lesson['id']);
        } else {
            $lesson['id'] = (int) $lesson['id'];
        }

        return $lesson;
    }

    public function validate(array $lesson): void
    {
        if (!isset($lesson['id_services'], $lesson['id_users_provider'], $lesson['weekday'], $lesson['start_time'])) {
            throw new InvalidArgumentException('Missing required weekly lesson fields.');
        }

        $weekday = (int) $lesson['weekday'];

        if ($weekday < 0 || $weekday > 6) {
            throw new InvalidArgumentException('Invalid weekday.');
        }

        if (!preg_match('/^\d{2}:\d{2}:\d{2}$/', (string) $lesson['start_time'])) {
            throw new InvalidArgumentException('Invalid start time.');
        }
    }

    protected function insert(array $lesson): int
    {
        $lesson['create_datetime'] = date('Y-m-d H:i:s');
        $lesson['update_datetime'] = date('Y-m-d H:i:s');
        $lesson['is_active'] = $lesson['is_active'] ?? 1;

        if (!$this->db->insert('weekly_lessons', $lesson)) {
            throw new RuntimeException('Could not insert weekly lesson.');
        }

        return (int) $this->db->insert_id();
    }

    protected function update(array $lesson): int
    {
        $lesson['update_datetime'] = date('Y-m-d H:i:s');

        if (!$this->db->update('weekly_lessons', $lesson, ['id' => $lesson['id']])) {
            throw new RuntimeException('Could not update weekly lesson.');
        }

        return (int) $lesson['id'];
    }

    public function delete(int $id): void
    {
        if (!$this->db->delete('weekly_lessons', ['id' => $id])) {
            throw new RuntimeException('Could not delete weekly lesson.');
        }
    }

    public function has_active_lessons(): bool
    {
        return $this->db->where('is_active', 1)->count_all_results('weekly_lessons') > 0;
    }
}
