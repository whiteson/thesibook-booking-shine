-- Small plan is unlimited attendants (€84/year)
USE thesibook_control;

UPDATE cp_plans SET max_attendants = NULL, name_el = 'Μικρή' WHERE id = 'small';

UPDATE cp_workspaces
SET attendant_limit = 4294967295
WHERE plan IN ('small', 'unlimited');
