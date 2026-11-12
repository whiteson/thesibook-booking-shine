<?php defined('BASEPATH') or exit('No direct script access allowed');

/**
 * Free-plan attendant cap, read from the ThesiBook control plane.
 *
 * An attendant is a distinct customer with at least one non-unavailability appointment.
 */
class Thesibook_plan
{
    /**
     * Reject when a brand-new attendant would pass the workspace limit.
     */
    public function assert_can_add_new_attendant(): void
    {
        $policy = $this->policy();

        if (!$policy['enforce']) {
            return;
        }

        $count = $this->distinct_attendant_count();

        if ($count >= $policy['limit']) {
            throw new InvalidArgumentException($policy['message']);
        }
    }

    /**
     * @return array{enforce: bool, limit: int, message: string}
     */
    public function policy(): array
    {
        $slug = function_exists('thesibook_tenant_slug') ? thesibook_tenant_slug() : '';

        if ($slug === '') {
            return ['enforce' => false, 'limit' => 0, 'message' => ''];
        }

        $workspace = $this->fetch_workspace($slug);
        $customer_facing = $this->is_customer_facing();

        if ($workspace === null) {
            return [
                'enforce' => true,
                'limit' => 0,
                'message' => $customer_facing
                    ? 'Οι κρατήσεις νέων συμμετεχόντων είναι προσωρινά μη διαθέσιμες. Δοκιμάστε ξανά σε λίγο.'
                    : 'New attendants are temporarily blocked because the workspace plan could not be verified.',
            ];
        }

        $plan = (string) ($workspace['plan'] ?? 'free');
        $expires_raw = $workspace['plan_expires_at'] ?? null;
        $expires_at = $expires_raw ? strtotime((string) $expires_raw) : 0;
        $paid = $plan === 'small' || $plan === 'unlimited';
        $paid_active = $paid && ($expires_at === 0 || $expires_at > time());

        if ($paid_active) {
            return ['enforce' => false, 'limit' => 0, 'message' => ''];
        }

        $limit = 5;

        if ($plan === 'free') {
            $configured = (int) ($workspace['attendant_limit'] ?? 5);
            $limit = $configured > 0 ? $configured : 5;
        }

        return [
            'enforce' => true,
            'limit' => $limit,
            'message' => $customer_facing
                ? 'Το δωρεάν πλάνο δέχεται έως ' . $limit . ' συμμετέχοντες. Για νέο άτομο χρειάζεται αναβάθμιση πλάνου.'
                : 'The free plan attendant limit of ' . $limit . ' has been reached.',
        ];
    }

    protected function is_customer_facing(): bool
    {
        $CI = &get_instance();
        $class = strtolower((string) ($CI->router->class ?? ''));
        $role = (string) session('role_slug');
        $staff = in_array($role, [DB_SLUG_ADMIN, DB_SLUG_PROVIDER, DB_SLUG_SECRETARY], true);

        return $class === 'booking' && !$staff;
    }

    protected function distinct_attendant_count(): int
    {
        $CI = &get_instance();
        $table = $CI->db->dbprefix('appointments');
        $row = $CI->db
            ->query(
                'SELECT COUNT(DISTINCT id_users_customer) AS cnt FROM `' . $table . '` WHERE is_unavailability = 0 AND id_users_customer IS NOT NULL',
            )
            ->row_array();

        return (int) ($row['cnt'] ?? 0);
    }

    /**
     * @return array<string, mixed>|null
     */
    protected function fetch_workspace(string $slug): ?array
    {
        if (!function_exists('thesibook_control_plane_config')) {
            return null;
        }

        $config = thesibook_control_plane_config();

        if ($config === null || !class_exists('mysqli')) {
            return null;
        }

        $mysqli = @new mysqli($config['host'], $config['user'], $config['password'], $config['database']);

        if ($mysqli->connect_errno) {
            log_message('error', 'ThesiBook plan lookup failed for slug ' . $slug);
            return null;
        }

        $mysqli->set_charset('utf8mb4');
        $statement = $mysqli->prepare(
            'SELECT plan, attendant_limit, plan_expires_at FROM cp_workspaces WHERE slug = ? LIMIT 1',
        );

        if (!$statement) {
            $mysqli->close();
            log_message('error', 'ThesiBook plan lookup failed for slug ' . $slug);
            return null;
        }

        $statement->bind_param('s', $slug);
        $statement->execute();
        $result = $statement->get_result();
        $row = $result ? $result->fetch_assoc() : null;
        $statement->close();
        $mysqli->close();

        return is_array($row) ? $row : null;
    }
}
