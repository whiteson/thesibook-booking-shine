<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * One-off studio events (workshops, seminars). Not the weekly class grid.
 */
class Studio_events_model extends EA_Model
{
    protected array $casts = [
        'id' => 'integer',
        'id_services' => 'integer',
        'id_users_provider' => 'integer',
        'capacity' => 'integer',
        'is_active' => 'boolean',
    ];

    /**
     * @return array<int, array<string, mixed>>
     */
    public function get_all(): array
    {
        $rows = $this->db
            ->select('studio_events.*, services.name AS service_name, users.first_name, users.last_name')
            ->from('studio_events')
            ->join('services', 'services.id = studio_events.id_services', 'inner')
            ->join('users', 'users.id = studio_events.id_users_provider', 'inner')
            ->order_by('studio_events.start_datetime', 'ASC')
            ->get()
            ->result_array();

        foreach ($rows as &$row) {
            $this->cast($row);
        }

        return $rows;
    }

    public function save(array $event): int
    {
        $event = $this->normalize($event);
        $this->validate($event);

        if (empty($event['id'])) {
            unset($event['id']);

            return $this->insert($event);
        }

        return $this->update($event);
    }

    /**
     * @param array<string, mixed> $event
     *
     * @return array<string, mixed>
     */
    protected function normalize(array $event): array
    {
        $allowed = [
            'id',
            'title',
            'description',
            'id_services',
            'id_users_provider',
            'start_datetime',
            'capacity',
            'is_active',
        ];

        $event = array_intersect_key($event, array_flip($allowed));
        $event['title'] = trim(strip_tags((string) ($event['title'] ?? '')));
        $event['description'] = trim(strip_tags((string) ($event['description'] ?? '')));
        $event['id_services'] = (int) ($event['id_services'] ?? 0);
        $event['id_users_provider'] = (int) ($event['id_users_provider'] ?? 0);
        $event['capacity'] = max(1, (int) ($event['capacity'] ?? 1));
        $event['is_active'] = !empty($event['is_active']) ? 1 : 0;

        $raw = str_replace('T', ' ', trim((string) ($event['start_datetime'] ?? '')));

        if (preg_match('/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/', $raw)) {
            $raw .= ':00';
        }

        $event['start_datetime'] = $raw;

        if (empty($event['id'])) {
            unset($event['id']);
        } else {
            $event['id'] = (int) $event['id'];
        }

        return $event;
    }

    public function validate(array $event): void
    {
        if ($event['title'] === '' || mb_strlen($event['title']) > 255) {
            throw new InvalidArgumentException('Invalid event title.');
        }

        if (mb_strlen((string) $event['description']) > 2000) {
            throw new InvalidArgumentException('Invalid event description.');
        }

        $start = DateTime::createFromFormat('Y-m-d H:i:s', (string) $event['start_datetime']);

        if (!$start || $start->format('Y-m-d H:i:s') !== $event['start_datetime']) {
            throw new InvalidArgumentException('Invalid event date.');
        }

        if ($event['capacity'] < 1 || $event['capacity'] > 5000) {
            throw new InvalidArgumentException('Invalid event capacity.');
        }

        if (!$this->db->get_where('services', ['id' => $event['id_services']])->num_rows()) {
            throw new InvalidArgumentException('Invalid event service.');
        }

        $provider = $this->db
            ->select('users.id')
            ->from('users')
            ->join('roles', 'roles.id = users.id_roles', 'inner')
            ->where('users.id', $event['id_users_provider'])
            ->where('roles.slug', DB_SLUG_PROVIDER)
            ->get()
            ->num_rows();

        if (!$provider) {
            throw new InvalidArgumentException('Invalid event provider.');
        }
    }

    protected function insert(array $event): int
    {
        $event['create_datetime'] = date('Y-m-d H:i:s');
        $event['update_datetime'] = date('Y-m-d H:i:s');

        if (!$this->db->insert('studio_events', $event)) {
            throw new RuntimeException('Could not insert studio event.');
        }

        return (int) $this->db->insert_id();
    }

    protected function update(array $event): int
    {
        $event['update_datetime'] = date('Y-m-d H:i:s');

        if (!$this->db->update('studio_events', $event, ['id' => $event['id']])) {
            throw new RuntimeException('Could not update studio event.');
        }

        return (int) $event['id'];
    }

    public function delete(int $id): void
    {
        if (!$this->db->delete('studio_events', ['id' => $id])) {
            throw new RuntimeException('Could not delete studio event.');
        }
    }
}
