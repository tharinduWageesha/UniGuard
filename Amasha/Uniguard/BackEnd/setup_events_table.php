<?php
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die("Database connection failed.\n");
}

$sql = "CREATE TABLE IF NOT EXISTS `events` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref_no` VARCHAR(50) DEFAULT NULL,
  `event_name` VARCHAR(255) NOT NULL,
  `organizer` VARCHAR(255) NOT NULL,
  `event_date` DATE NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME DEFAULT NULL,
  `venue` VARCHAR(255) NOT NULL,
  `expected_attendees` INT DEFAULT 0,
  `contact_number` VARCHAR(50) DEFAULT NULL,
  `description` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'upcoming',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db->exec($sql);
echo "Events table created/verified successfully.\n";

// Seed initial sample events if table is empty
$count = $db->query("SELECT COUNT(*) FROM `events`")->fetchColumn();
if ($count == 0) {
    $seedSql = "INSERT INTO `events` (`ref_no`, `event_name`, `organizer`, `event_date`, `start_time`, `end_time`, `venue`, `expected_attendees`, `contact_number`, `description`, `status`) VALUES
    ('EVT-801', 'Annual General Convocation 2026', 'Dept. of Computer Science', '2026-08-15', '08:30:00', '16:00:00', 'UCSC Auditorium', 500, '0112581835', 'Annual graduation ceremony for undergraduate and postgraduate students.', 'upcoming'),
    ('EVT-802', 'Inter-Faculty Cricket Championship', 'Student Affairs', '2026-08-10', '09:00:00', '18:00:00', 'University Grounds', 300, '0771234567', 'Annual inter-faculty sports competition.', 'upcoming'),
    ('EVT-803', 'International IT & Cyber Exhibition', 'Dept. of Computer Science', '2026-08-12', '10:00:00', '17:00:00', 'UCSC Auditorium', 250, '0112581835', 'Exhibition showcasing research projects and cybersecurity solutions.', 'upcoming'),
    ('EVT-804', 'Delegation Visit - Ministry of Education', 'Faculty of Science', '2026-08-18', '13:00:00', '15:30:00', 'Main Campus', 50, '0112581835', 'Official ministry delegation site visit and security review.', 'upcoming');";

    $db->exec($seedSql);
    echo "Sample events seeded successfully.\n";
}
