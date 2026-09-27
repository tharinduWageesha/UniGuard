<?php

require_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->connect();

echo "--- DESCRIBE oics ---\n";
$stmt = $db->query("DESCRIBE oics");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "--- DESCRIBE jsos ---\n";
$stmt = $db->query("DESCRIBE jsos");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "--- SELECT ALL oics ---\n";
$stmt = $db->query("SELECT * FROM oics");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

echo "--- SELECT ALL jsos ---\n";
$stmt = $db->query("SELECT id, fname, lname, badge_id, assigned_sector FROM jsos");
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
