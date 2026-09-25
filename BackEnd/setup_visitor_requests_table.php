<?php
require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die("Database connection failed.\n");
}

$sql = "CREATE TABLE IF NOT EXISTS `visitor_requests` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ref_no` VARCHAR(50) DEFAULT NULL,
  `user_id` INT DEFAULT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `nic` VARCHAR(50) NOT NULL,
  `contact_phone` VARCHAR(50) NOT NULL,
  `email` VARCHAR(150) NOT NULL,
  `purpose` VARCHAR(100) NOT NULL,
  `department` VARCHAR(150) NOT NULL,
  `visit_date` DATE NOT NULL,
  `visit_time` TIME NOT NULL,
  `vehicle_no` VARCHAR(50) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `status` VARCHAR(50) DEFAULT 'Pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db->exec($sql);
echo "VisitorRequests table created/verified successfully.\n";

// Seed initial sample visitor requests if table is empty
$count = $db->query("SELECT COUNT(*) FROM `visitor_requests`")->fetchColumn();
if ($count == 0) {
    $seedSql = "INSERT INTO `visitor_requests` (`ref_no`, `full_name`, `nic`, `contact_phone`, `email`, `purpose`, `department`, `visit_date`, `visit_time`, `vehicle_no`, `notes`, `status`) VALUES
    ('VP-2026-0001', 'Kasun Perera', '200145601234', '077 123 4567', 'kasun@email.com', 'Official Meeting', 'UCSC', '2026-08-10', '09:30:00', 'WP CAB-1234', 'Meeting regarding IT security audit.', 'Approved'),
    ('VP-2026-0002', 'Nimali Fernando', '199578104321', '071 987 6543', 'nimali@email.com', 'Academic / Research Visit', 'Faculty of Science', '2026-08-12', '11:00:00', NULL, 'Library research visit.', 'Pending'),
    ('VP-2026-0003', 'Suresh De Silva', '198823405678', '075 555 1212', 'suresh@email.com', 'Campus Event', 'Faculty of Arts', '2026-08-15', '14:00:00', 'WP QK-7723', 'Guest lecture attendance.', 'Pending');";

    $db->exec($seedSql);
    echo "Sample visitor requests seeded successfully.\n";
}
