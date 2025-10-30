<?php
require 'database.php';

$package_id = $_GET['package_id'] ?? '';
if (!$package_id) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing package_id']);
    exit;
}

// ดึงโปรโมชั่นของแพ็กเกจ
$sql = "SELECT p.name, p.discount_percent, p.start_date, p.end_date 
        FROM promotion p
        JOIN package_promotion pp ON p.promo_id = pp.promo_id
        WHERE pp.package_id = ?";

$stmt = $conn->prepare($sql);
$stmt->bind_param('s', $package_id);
$stmt->execute();
$result = $stmt->get_result();

$promotions = [];
while ($row = $result->fetch_assoc()) {
    $promotions[] = $row;
}

echo json_encode(['success' => true, 'promotions' => $promotions]);
