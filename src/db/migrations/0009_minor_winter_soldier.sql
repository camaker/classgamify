ALTER TABLE `attempt` ADD `submission_key` text;--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_assignment_submission_key_unique` ON `attempt` (`assignment_id`,`submission_key`);