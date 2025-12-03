CREATE TABLE `signals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`spreadsheetId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`data` varchar(10) NOT NULL,
	`horario` varchar(8) NOT NULL,
	`idSignal` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `signals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `spreadsheets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`filename` varchar(255) NOT NULL,
	`fileKey` varchar(512) NOT NULL,
	`fileUrl` text NOT NULL,
	`rowCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `spreadsheets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `signals` ADD CONSTRAINT `signals_spreadsheetId_spreadsheets_id_fk` FOREIGN KEY (`spreadsheetId`) REFERENCES `spreadsheets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `spreadsheets` ADD CONSTRAINT `spreadsheets_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;