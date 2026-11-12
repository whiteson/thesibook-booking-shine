<?php defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Create_studio_events_table extends EA_Migration
{
    public function up(): void
    {
        if ($this->db->table_exists('weekly_lessons') && !$this->db->field_exists('capacity', 'weekly_lessons')) {
            $this->dbforge->add_column('weekly_lessons', [
                'capacity' => [
                    'type' => 'INT',
                    'constraint' => 11,
                    'null' => true,
                    'after' => 'start_time',
                ],
            ]);
        }

        if ($this->db->table_exists('studio_events')) {
            return;
        }

        $this->dbforge->add_field([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'auto_increment' => true,
            ],
            'title' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
                'null' => false,
            ],
            'description' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'id_services' => [
                'type' => 'INT',
                'constraint' => 11,
                'null' => false,
            ],
            'id_users_provider' => [
                'type' => 'INT',
                'constraint' => 11,
                'null' => false,
            ],
            'start_datetime' => [
                'type' => 'DATETIME',
                'null' => false,
            ],
            'capacity' => [
                'type' => 'INT',
                'constraint' => 11,
                'null' => false,
                'default' => 1,
            ],
            'is_active' => [
                'type' => 'TINYINT',
                'constraint' => 1,
                'default' => 1,
            ],
            'create_datetime' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'update_datetime' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->dbforge->add_key('id', true);
        $this->dbforge->add_key('start_datetime');
        $this->dbforge->add_key('id_services');
        $this->dbforge->add_key('id_users_provider');

        $this->dbforge->create_table('studio_events', true, ['engine' => 'InnoDB']);

        $prefix = $this->db->dbprefix('studio_events');

        $this->db->query(
            '
            ALTER TABLE `' . $prefix . '`
                ADD CONSTRAINT `studio_events_services`
                    FOREIGN KEY (`id_services`) REFERENCES `' . $this->db->dbprefix('services') . '` (`id`)
                    ON DELETE CASCADE ON UPDATE CASCADE,
                ADD CONSTRAINT `studio_events_users_provider`
                    FOREIGN KEY (`id_users_provider`) REFERENCES `' . $this->db->dbprefix('users') . '` (`id`)
                    ON DELETE CASCADE ON UPDATE CASCADE
            ',
        );
    }

    public function down(): void
    {
        if ($this->db->table_exists('studio_events')) {
            $this->dbforge->drop_table('studio_events');
        }

        if ($this->db->table_exists('weekly_lessons') && $this->db->field_exists('capacity', 'weekly_lessons')) {
            $this->dbforge->drop_column('weekly_lessons', 'capacity');
        }
    }
}
