CREATE TRIGGER `activity_source_material_insert_guard`
BEFORE INSERT ON `activity`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM json_each(NEW.`content_json`, '$.sourceMaterials') AS material
  WHERE json_type(material.value, '$.fileId') IS NOT 'text'
    OR NOT EXISTS (
      SELECT 1
      FROM `user_files`
      WHERE `id` = json_extract(material.value, '$.fileId')
        AND `user_id` = NEW.`owner_id`
    )
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_source_material_reference_missing');
END;--> statement-breakpoint
CREATE TRIGGER `activity_source_material_update_guard`
BEFORE UPDATE OF `owner_id`, `content_json` ON `activity`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM json_each(NEW.`content_json`, '$.sourceMaterials') AS material
  WHERE json_type(material.value, '$.fileId') IS NOT 'text'
    OR NOT EXISTS (
      SELECT 1
      FROM `user_files`
      WHERE `id` = json_extract(material.value, '$.fileId')
        AND `user_id` = NEW.`owner_id`
    )
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_activity_source_material_reference_missing');
END;--> statement-breakpoint
CREATE TRIGGER `assignment_snapshot_source_material_insert_guard`
BEFORE INSERT ON `assignment_snapshot`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM json_each(NEW.`content_json`, '$.sourceMaterials') AS material
  WHERE json_type(material.value, '$.fileId') IS NOT 'text'
    OR NOT EXISTS (
      SELECT 1
      FROM `assignment`
      INNER JOIN `user_files`
        ON `user_files`.`user_id` = `assignment`.`owner_id`
      WHERE `assignment`.`id` = NEW.`assignment_id`
        AND `user_files`.`id` = json_extract(material.value, '$.fileId')
    )
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_snapshot_source_material_reference_missing');
END;--> statement-breakpoint
CREATE TRIGGER `assignment_snapshot_source_material_update_guard`
BEFORE UPDATE OF `assignment_id`, `content_json` ON `assignment_snapshot`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM json_each(NEW.`content_json`, '$.sourceMaterials') AS material
  WHERE json_type(material.value, '$.fileId') IS NOT 'text'
    OR NOT EXISTS (
      SELECT 1
      FROM `assignment`
      INNER JOIN `user_files`
        ON `user_files`.`user_id` = `assignment`.`owner_id`
      WHERE `assignment`.`id` = NEW.`assignment_id`
        AND `user_files`.`id` = json_extract(material.value, '$.fileId')
    )
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_assignment_snapshot_source_material_reference_missing');
END;--> statement-breakpoint
CREATE TRIGGER `user_file_activity_reference_delete_guard`
BEFORE DELETE ON `user_files`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `user`
  WHERE `id` = OLD.`user_id`
) AND EXISTS (
  SELECT 1
  FROM `activity`
  INNER JOIN json_each(`activity`.`content_json`, '$.sourceMaterials') AS material
  WHERE `activity`.`owner_id` = OLD.`user_id`
    AND json_extract(material.value, '$.fileId') = OLD.`id`
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_user_file_source_material_in_use');
END;--> statement-breakpoint
CREATE TRIGGER `user_file_snapshot_reference_delete_guard`
BEFORE DELETE ON `user_files`
FOR EACH ROW
WHEN EXISTS (
  SELECT 1
  FROM `user`
  WHERE `id` = OLD.`user_id`
) AND EXISTS (
  SELECT 1
  FROM `assignment_snapshot`
  INNER JOIN `assignment`
    ON `assignment`.`id` = `assignment_snapshot`.`assignment_id`
  INNER JOIN json_each(
    `assignment_snapshot`.`content_json`,
    '$.sourceMaterials'
  ) AS material
  WHERE `assignment`.`owner_id` = OLD.`user_id`
    AND json_extract(material.value, '$.fileId') = OLD.`id`
)
BEGIN
  SELECT RAISE(ABORT, 'classgamify_user_file_source_material_in_use');
END;
