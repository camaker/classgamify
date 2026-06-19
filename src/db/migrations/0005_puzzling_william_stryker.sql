CREATE TABLE `assignment_snapshot` (
	`assignment_id` text PRIMARY KEY NOT NULL,
	`activity_title` text NOT NULL,
	`activity_description` text,
	`template_type` text NOT NULL,
	`content_json` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`assignment_id`) REFERENCES `assignment`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `assignment_snapshot_template_type_idx` ON `assignment_snapshot` (`template_type`);