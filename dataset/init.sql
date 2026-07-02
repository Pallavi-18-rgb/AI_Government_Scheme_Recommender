SET FOREIGN_KEY_CHECKS = 0;
CREATE TABLE `Admins` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Chat_History` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `message` text,
  `sender` varchar(50) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `Chat_History_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Feedback` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `scheme_id` int DEFAULT NULL,
  `rating` int DEFAULT NULL,
  `review_text` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `scheme_id` (`scheme_id`),
  CONSTRAINT `Feedback_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  CONSTRAINT `Feedback_ibfk_2` FOREIGN KEY (`scheme_id`) REFERENCES `Government_Schemes` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Government_Schemes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `scheme_name` varchar(255) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `age_group` varchar(50) DEFAULT NULL,
  `gender` varchar(50) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `income_limit` varchar(100) DEFAULT NULL,
  `eligibility` text,
  `benefits` text,
  `deadline` date DEFAULT NULL,
  `state` varchar(100) DEFAULT 'All',
  `education` varchar(255) DEFAULT 'All',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Recommendations` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `scheme_id` int DEFAULT NULL,
  `eligibility_percentage` float DEFAULT NULL,
  `confidence_score` float DEFAULT NULL,
  `explanation` text,
  `is_missed_benefit` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `scheme_id` (`scheme_id`),
  CONSTRAINT `Recommendations_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  CONSTRAINT `Recommendations_ibfk_2` FOREIGN KEY (`scheme_id`) REFERENCES `Government_Schemes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10201 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Saved_Schemes` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `scheme_id` int DEFAULT NULL,
  `saved_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `scheme_id` (`scheme_id`),
  CONSTRAINT `Saved_Schemes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  CONSTRAINT `Saved_Schemes_ibfk_2` FOREIGN KEY (`scheme_id`) REFERENCES `Government_Schemes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Scheme_Reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `scheme_id` int DEFAULT NULL,
  `rating` int NOT NULL,
  `review` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `scheme_id` (`scheme_id`),
  CONSTRAINT `Scheme_Reviews_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`),
  CONSTRAINT `Scheme_Reviews_ibfk_2` FOREIGN KEY (`scheme_id`) REFERENCES `Government_Schemes` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `Users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `income` float DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `disability_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_admin` tinyint(1) DEFAULT '0',
  `marital_status` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


SET FOREIGN_KEY_CHECKS = 1;
CREATE TABLE IF NOT EXISTS `Recommendation_Feedback` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT,
  `scheme_id` INT,
  `recommendation_id` INT,
  `rating` INT DEFAULT 0,
  `liked` BOOLEAN DEFAULT FALSE,
  `disliked` BOOLEAN DEFAULT FALSE,
  `saved` BOOLEAN DEFAULT FALSE,
  `applied` BOOLEAN DEFAULT FALSE,
  `review_text` TEXT,
  `application_status` VARCHAR(50) DEFAULT 'Not Started',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `User_Documents` (
  `id` INT AUTO_INCREMENT PRIMARY KEY, 
  `user_id` INT, 
  `document_type` VARCHAR(100), 
  `is_available` BOOLEAN DEFAULT FALSE, 
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  FOREIGN KEY (`user_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE, 
  UNIQUE KEY `user_doc` (`user_id`, `document_type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

ALTER TABLE `Users` 
ADD COLUMN IF NOT EXISTS `marital_status` VARCHAR(50);

ALTER TABLE `Government_Schemes` 
ADD COLUMN IF NOT EXISTS `education` VARCHAR(255) DEFAULT 'All',
ADD COLUMN IF NOT EXISTS `required_documents` JSON, 
ADD COLUMN IF NOT EXISTS `application_steps` JSON, 
ADD COLUMN IF NOT EXISTS `estimated_approval_time` VARCHAR(50) DEFAULT '15-30 days', 
ADD COLUMN IF NOT EXISTS `benefits_amount` VARCHAR(50) DEFAULT 'Variable';
