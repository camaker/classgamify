CREATE TRIGGER `attempt_assignment_submission_status_guard`
BEFORE INSERT ON `attempt`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `assignment`
  WHERE `id` = NEW.`assignment_id`
    AND `status` <> 'published'
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_submission_status_blocked');
END;--> statement-breakpoint
CREATE TRIGGER `attempt_assignment_submission_expiry_guard`
BEFORE INSERT ON `attempt`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `assignment`
  WHERE `id` = NEW.`assignment_id`
    AND `status` = 'published'
    AND `expires_at` IS NOT NULL
    AND `expires_at` <= cast(unixepoch('subsecond') * 1000 as integer)
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_submission_expired');
END;
