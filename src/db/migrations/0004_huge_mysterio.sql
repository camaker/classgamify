CREATE TABLE `activity` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`template_type` text NOT NULL,
	`content_json` text NOT NULL,
	`visibility` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `activity_owner_id_idx` ON `activity` (`owner_id`);--> statement-breakpoint
CREATE INDEX `activity_template_type_idx` ON `activity` (`template_type`);--> statement-breakpoint
CREATE INDEX `activity_visibility_idx` ON `activity` (`visibility`);--> statement-breakpoint
CREATE INDEX `activity_owner_updated_idx` ON `activity` (`owner_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `assignment` (
	`id` text PRIMARY KEY NOT NULL,
	`activity_id` text NOT NULL,
	`owner_id` text NOT NULL,
	`share_slug` text NOT NULL,
	`title` text NOT NULL,
	`settings_json` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`expires_at` integer,
	FOREIGN KEY (`activity_id`) REFERENCES `activity`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `assignment_share_slug_unique` ON `assignment` (`share_slug`);--> statement-breakpoint
CREATE INDEX `assignment_activity_id_idx` ON `assignment` (`activity_id`);--> statement-breakpoint
CREATE INDEX `assignment_owner_id_idx` ON `assignment` (`owner_id`);--> statement-breakpoint
CREATE INDEX `assignment_share_slug_idx` ON `assignment` (`share_slug`);--> statement-breakpoint
CREATE INDEX `assignment_status_idx` ON `assignment` (`status`);--> statement-breakpoint
CREATE TABLE `attempt` (
	`id` text PRIMARY KEY NOT NULL,
	`assignment_id` text NOT NULL,
	`student_name` text,
	`anonymous_token` text,
	`score` integer,
	`max_score` integer,
	`answers_json` text NOT NULL,
	`result_json` text,
	`started_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `attempt_assignment_id_idx` ON `attempt` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `attempt_anonymous_token_idx` ON `attempt` (`anonymous_token`);--> statement-breakpoint
CREATE INDEX `attempt_completed_at_idx` ON `attempt` (`completed_at`);