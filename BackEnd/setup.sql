-- UniGuard Database Setup Script
-- Database: uniguard

CREATE DATABASE IF NOT EXISTS `uniguard` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `uniguard`;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `fname` VARCHAR(100) NOT NULL,
  `lname` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` VARCHAR(50) NOT NULL DEFAULT 'User',
  `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------
-- Insert Default System Admin Account
-- Default Username: admin
-- Default Password: admin123
-- --------------------------------------------------------

INSERT INTO `users` (`fname`, `lname`, `email`, `username`, `password`, `role`)
SELECT 'System', 'Admin', 'admin@uniguard.lk', 'admin', '$2y$10$VJ2FTufnyTRyHuh9xEwHmuBHf9TYhDRJRm6ceAvxy5LZAQ6Nur5d2', 'Admin'
WHERE NOT EXISTS (SELECT 1 FROM `users` WHERE `username` = 'admin');
