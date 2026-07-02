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
