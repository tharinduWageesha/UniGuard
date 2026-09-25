<?php

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->connect();

if (!$db) {
    die("Database connection failed.\n");
}

echo "Setting up Support System tables...\n";

// 1. Support Tickets Table
$sqlTickets = "CREATE TABLE IF NOT EXISTS `support_tickets` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `ticket_number` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NULL,
  `sender_name` VARCHAR(150) NOT NULL,
  `sender_email` VARCHAR(150) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `subject` VARCHAR(255) NOT NULL,
  `message` TEXT NOT NULL,
  `priority` VARCHAR(20) DEFAULT 'Normal',
  `status` VARCHAR(50) DEFAULT 'Pending',
  `response` TEXT NULL,
  `escalated_to` VARCHAR(50) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db->exec($sqlTickets);
echo "Table `support_tickets` verified/created.\n";

// 2. FAQ Categories Table
$sqlCategories = "CREATE TABLE IF NOT EXISTS `faq_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db->exec($sqlCategories);
echo "Table `faq_categories` verified/created.\n";

// 3. FAQs Table
$sqlFaqs = "CREATE TABLE IF NOT EXISTS `faqs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_id` INT NULL,
  `category_name` VARCHAR(100) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT NOT NULL,
  `status` VARCHAR(20) DEFAULT 'Active',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;";

$db->exec($sqlFaqs);
echo "Table `faqs` verified/created.\n";

// 4. Seed Default Support Agent Account in `support_agent`
$checkAgent = $db->prepare("SELECT id FROM support_agent WHERE role = 'Support Agent' OR username = 'support'");
$checkAgent->execute();
if ($checkAgent->rowCount() == 0) {
    $hashedPassword = password_hash('admin123', PASSWORD_BCRYPT);
    $stmt = $db->prepare("INSERT INTO support_agent (fname, lname, email, username, password, role, status) VALUES (:fname, :lname, :email, :username, :password, :role, :status)");
    $stmt->execute([
        ':fname' => 'Fathima',
        ':lname' => 'Amna',
        ':email' => 'support@uniguard.lk',
        ':username' => 'support',
        ':password' => $hashedPassword,
        ':role' => 'Support Agent',
        ':status' => 'Active'
    ]);
    echo "Default Support Agent account created (username: support, password: admin123).\n";
} else {
    echo "Support Agent account already exists.\n";
}

// 5. Seed Initial Categories if empty
$checkCats = $db->query("SELECT COUNT(*) FROM faq_categories")->fetchColumn();
if ($checkCats == 0) {
    $initialCategories = [
        ['Registration', 'Questions related to visitor and staff registration.'],
        ['Visitor Pass', 'Information regarding visitor access passes and gate scanning.'],
        ['Approval Status', 'Inquiries regarding host approvals and clearance.'],
        ['Account/Login', 'Troubleshooting user account and portal login issues.'],
        ['Technical Issues', 'Reporting technical glitches and portal support.'],
        ['General', 'General security information and campus rules.']
    ];
    $stmtCat = $db->prepare("INSERT INTO faq_categories (name, description) VALUES (?, ?)");
    foreach ($initialCategories as $cat) {
        $stmtCat->execute($cat);
    }
    echo "Initial FAQ Categories seeded.\n";
}

// 6. Seed Initial FAQs if empty
$checkFaqs = $db->query("SELECT COUNT(*) FROM faqs")->fetchColumn();
if ($checkFaqs == 0) {
    $initialFaqs = [
        ['Registration', 'How do I register as a visitor?', 'You can register by completing the visitor registration form on the UniGuard visitor portal.'],
        ['Visitor Pass', 'Where can I view my visitor pass?', 'Your approved visitor pass with QR code can be viewed in your visitor dashboard.'],
        ['Approval Status', 'How long does host approval take?', 'Visitor approvals are reviewed by Officers in Charge (OIC) within 1-2 hours of submission.'],
        ['Account/Login', 'What if I forget my password?', 'Contact the UniGuard Help Centre or click on Support on the login page to reset credentials.'],
        ['General', 'What are the campus security rules?', 'All visitors must present valid photo identification and their approved pass at campus gates.']
    ];
    $stmtFaq = $db->prepare("INSERT INTO faqs (category_name, question, answer) VALUES (?, ?, ?)");
    foreach ($initialFaqs as $faq) {
        $stmtFaq->execute($faq);
    }
    echo "Initial FAQs seeded.\n";
}

// 7. Seed Initial Support Tickets if empty
$checkTickets = $db->query("SELECT COUNT(*) FROM support_tickets")->fetchColumn();
if ($checkTickets == 0) {
    $initialTickets = [
        ['TICK-1001', 'Amal Perera', 'amal@gmail.com', 'Approval Status', 'Approval request not showing', 'I registered yesterday for visitor entry but cannot see my request status.', 'Normal', 'Pending', null],
        ['TICK-1002', 'Nimal Silva', 'nimal@gmail.com', 'Account/Login', 'Login problem on student portal', 'I cannot login to my student account using my email.', 'High', 'Resolved', 'Your account credentials have been verified. Please try logging in again.'],
        ['TICK-1003', 'Ahamed Rizwan', 'ahamed@gmail.com', 'Visitor Pass', 'Visitor pass barcode generation failed', 'I completed registration but pass barcode fails to load on phone.', 'Normal', 'In Progress', 'We are currently reviewing your visitor pass record.']
    ];
    $stmtT = $db->prepare("INSERT INTO support_tickets (ticket_number, sender_name, sender_email, category, subject, message, priority, status, response) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
    foreach ($initialTickets as $t) {
        $stmtT->execute($t);
    }
    echo "Initial Support Tickets seeded.\n";
}

echo "Setup completed successfully!\n";
