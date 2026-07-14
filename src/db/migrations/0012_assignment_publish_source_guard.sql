CREATE TRIGGER `assignment_publish_source_owner_guard`
BEFORE INSERT ON `assignment`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `activity`
  WHERE `id` = NEW.`activity_id`
    AND `owner_id` <> NEW.`owner_id`
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_publish_source_owner_mismatch');
END;--> statement-breakpoint
CREATE TRIGGER `assignment_publish_source_archived_guard`
BEFORE INSERT ON `assignment`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `activity`
  WHERE `id` = NEW.`activity_id`
    AND `owner_id` = NEW.`owner_id`
    AND `visibility` = 'archived'
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_publish_source_archived');
END;
