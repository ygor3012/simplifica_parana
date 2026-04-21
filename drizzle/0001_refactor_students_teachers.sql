-- Criar tabela de alunos
CREATE TABLE `students` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL UNIQUE,
	`email` varchar(320) NOT NULL UNIQUE,
	`name` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `students_id` PRIMARY KEY(`id`),
	CONSTRAINT `students_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `students_email_unique` UNIQUE(`email`)
);

-- Criar tabela de professores
CREATE TABLE `teachers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL UNIQUE,
	`email` varchar(320) NOT NULL UNIQUE,
	`name` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `teachers_id` PRIMARY KEY(`id`),
	CONSTRAINT `teachers_userId_unique` UNIQUE(`userId`),
	CONSTRAINT `teachers_email_unique` UNIQUE(`email`)
);

-- Remover coluna appRole da tabela users (será determinada pela presença em students ou teachers)
ALTER TABLE `users` DROP COLUMN `appRole`;

-- Renomear coluna userId para studentId na tabela tasks
ALTER TABLE `tasks` CHANGE COLUMN `userId` `studentId` int NOT NULL;
