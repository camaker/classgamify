CREATE INDEX `activity_owner_visibility_updated_idx` ON `activity` (`owner_id`,`visibility`,`updated_at`);--> statement-breakpoint
CREATE INDEX `activity_owner_template_updated_idx` ON `activity` (`owner_id`,`template_type`,`updated_at`);--> statement-breakpoint
CREATE INDEX `assignment_owner_status_expires_updated_idx` ON `assignment` (`owner_id`,`status`,`expires_at`,`updated_at`);--> statement-breakpoint
CREATE INDEX `payment_user_paid_created_idx` ON `payment` (`user_id`,`paid`,`created_at`);--> statement-breakpoint
CREATE INDEX `user_files_user_created_idx` ON `user_files` (`user_id`,`created_at`);