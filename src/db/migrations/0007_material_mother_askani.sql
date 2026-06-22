CREATE INDEX `assignment_owner_updated_idx` ON `assignment` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE INDEX `assignment_owner_status_updated_idx` ON `assignment` (`owner_id`,`status`,`updated_at`);--> statement-breakpoint
CREATE INDEX `attempt_assignment_completed_idx` ON `attempt` (`assignment_id`,`completed_at`);