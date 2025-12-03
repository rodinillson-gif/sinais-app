CREATE TABLE `alertHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`signalId` int NOT NULL,
	`spreadsheetId` int NOT NULL,
	`numero` varchar(20) NOT NULL,
	`horario` varchar(8) NOT NULL,
	`alertTriggeredAt` timestamp NOT NULL DEFAULT (now()),
	`signalTime` varchar(19) NOT NULL,
	`webhooksSent` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `alertHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `userPreferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`minMultiplier` varchar(10) NOT NULL DEFAULT '0',
	`enableNotifications` int NOT NULL DEFAULT 1,
	`enableSound` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `userPreferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `userPreferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `webhookIntegrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('whatsapp','telegram','email','custom') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`config` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `webhookIntegrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `alertHistory` ADD CONSTRAINT `alertHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertHistory` ADD CONSTRAINT `alertHistory_signalId_signals_id_fk` FOREIGN KEY (`signalId`) REFERENCES `signals`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `alertHistory` ADD CONSTRAINT `alertHistory_spreadsheetId_spreadsheets_id_fk` FOREIGN KEY (`spreadsheetId`) REFERENCES `spreadsheets`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `userPreferences` ADD CONSTRAINT `userPreferences_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `webhookIntegrations` ADD CONSTRAINT `webhookIntegrations_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;