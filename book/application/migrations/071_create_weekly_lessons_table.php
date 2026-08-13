<?php defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Create_weekly_lessons_table extends EA_Migration
{
    public function up(): void
    {
        if ($this->db->table_exists('weekly_lessons')) {
            return;
        }

        $this->dbforge->add_field([
            'id' => [
                'type' => 'INT',
                'constraint' => 11,
                'auto_increment' => true,
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
            'weekday' => [
                'type' => 'TINYINT',
                'constraint' => 1,
                'null' => false,
                'comment' => '0=Sunday … 6=Saturday',
            ],
            'start_time' => [
                'type' => 'TIME',
                'null' => false,
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
        $this->dbforge->add_key('weekday');
        $this->dbforge->add_key('id_services');
        $this->dbforge->add_key('id_users_provider');

        $this->dbforge->create_table('weekly_lessons', true, ['engine' => 'InnoDB']);

        $prefix = $this->db->dbprefix('weekly_lessons');

        $this->db->query(
            '
            ALTER TABLE `' . $prefix . '`
                ADD CONSTRAINT `weekly_lessons_services`
                    FOREIGN KEY (`id_services`) REFERENCES `' . $this->db->dbprefix('services') . '` (`id`)
                    ON DELETE CASCADE ON UPDATE CASCADE,
                ADD CONSTRAINT `weekly_lessons_users_provider`
                    FOREIGN KEY (`id_users_provider`) REFERENCES `' . $this->db->dbprefix('users') . '` (`id`)
                    ON DELETE CASCADE ON UPDATE CASCADE
            ',
        );
    }

    public function down(): void
    {
        if ($this->db->table_exists('weekly_lessons')) {
            $this->dbforge->drop_table('weekly_lessons');
        }
    }
}
