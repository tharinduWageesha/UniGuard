<?php

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die("Database connection failed.\n");
}

echo "Checking tables in uniguard database...\n";

// Check if `users` table exists
$checkUsers = $db->query("SHOW TABLES LIKE 'users'")->rowCount();
$checkSupportAgent = $db->query("SHOW TABLES LIKE 'support_agent'")->rowCount();

if ($checkUsers > 0 && $checkSupportAgent == 0) {
    $db->exec("RENAME TABLE `users` TO `support_agent`");
    echo "Successfully renamed table `users` to `support_agent`.\n";
} else if ($checkSupportAgent > 0) {
    echo "Table `support_agent` already exists.\n";
} else {
    // Create support_agent table directly
    $sql = "CREATE TABLE IF NOT EXISTS `support_agent` (
      `id` INT AUTO_INCREMENT PRIMARY KEY,
      `fname` VARCHAR(100) NOT NULL,
      `lname` VARCHAR(100) NOT NULL,
      `email` VARCHAR(150) NOT NULL UNIQUE,
      `username` VARCHAR(100) NOT NULL UNIQUE,
      `password` VARCHAR(255) NOT NULL,
      `role` VARCHAR(50) NOT NULL DEFAULT 'Support Agent',
      `status` VARCHAR(20) NOT NULL DEFAULT 'Active',
      `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";
    $db->exec($sql);
    echo "Created table `support_agent`.\n";

    // Insert default support agent account if not exists
    $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO `support_agent` (fname, lname, email, username, password, role, status) VALUES (:fname, :lname, :email, :username, :password, :role, :status)");
    $stmt->execute([
        ':fname' => 'Fathima',
        ':lname' => 'Amna',
        ':email' => 'support@uniguard.lk',
        ':username' => 'support',
        ':password' => $hashedPassword,
        ':role' => 'Support Agent',
        ':status' => 'Active'
    ]);
    echo "Seeded default support agent user into `support_agent`.\n";
}
