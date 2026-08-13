<?php defined('BASEPATH') or exit('No direct script access allowed');

class Migration_Add_class_oriented_booking_setting extends EA_Migration
{
    public function up(): void
    {
        if (!$this->db->get_where('settings', ['name' => 'class_oriented_booking'])->num_rows()) {
            $this->db->insert('settings', [
                'name' => 'class_oriented_booking',
                'value' => '0',
            ]);
        }
    }

    public function down(): void
    {
        if ($this->db->get_where('settings', ['name' => 'class_oriented_booking'])->num_rows()) {
            $this->db->delete('settings', ['name' => 'class_oriented_booking']);
        }
    }
}
