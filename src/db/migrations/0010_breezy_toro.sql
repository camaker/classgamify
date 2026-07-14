ALTER TABLE `attempt` ADD `identity_key` text;--> statement-breakpoint
ALTER TABLE `attempt` ADD `attempt_number` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `attempt_assignment_identity_number_unique` ON `attempt` (`assignment_id`,`identity_key`,`attempt_number`);