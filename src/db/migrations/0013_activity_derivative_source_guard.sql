ALTER TABLE `activity` ADD `derivation_source_activity_id` text;--> statement-breakpoint
ALTER TABLE `activity` ADD `derivation_source_updated_at` integer;--> statement-breakpoint
CREATE TRIGGER `activity_derivative_source_pair_guard`
BEFORE INSERT ON `activity`
FOR EACH ROW
WHEN (
  NEW.`derivation_source_activity_id` IS NULL
  AND NEW.`derivation_source_updated_at` IS NOT NULL
) OR (
  NEW.`derivation_source_activity_id` IS NOT NULL
  AND NEW.`derivation_source_updated_at` IS NULL
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_derivative_source_pair_invalid');
END;--> statement-breakpoint
CREATE TRIGGER `activity_derivative_source_owner_guard`
BEFORE INSERT ON `activity`
FOR EACH ROW
WHEN NEW.`derivation_source_activity_id` IS NOT NULL
  AND NEW.`derivation_source_updated_at` IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM `activity`
    WHERE `id` = NEW.`derivation_source_activity_id`
      AND `owner_id` = NEW.`owner_id`
  )
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_derivative_source_owner_mismatch');
END;--> statement-breakpoint
CREATE TRIGGER `activity_derivative_source_archived_guard`
BEFORE INSERT ON `activity`
FOR EACH ROW
WHEN NEW.`derivation_source_activity_id` IS NOT NULL
  AND NEW.`derivation_source_updated_at` IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM `activity`
    WHERE `id` = NEW.`derivation_source_activity_id`
      AND `owner_id` = NEW.`owner_id`
      AND `visibility` = 'archived'
  )
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_derivative_source_archived');
END;--> statement-breakpoint
CREATE TRIGGER `activity_derivative_source_revision_guard`
BEFORE INSERT ON `activity`
FOR EACH ROW
WHEN NEW.`derivation_source_activity_id` IS NOT NULL
  AND NEW.`derivation_source_updated_at` IS NOT NULL
  AND EXISTS (
    SELECT 1
    FROM `activity`
    WHERE `id` = NEW.`derivation_source_activity_id`
      AND `owner_id` = NEW.`owner_id`
      AND `visibility` <> 'archived'
      AND `updated_at` <> NEW.`derivation_source_updated_at`
  )
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_derivative_source_revision_mismatch');
END;
