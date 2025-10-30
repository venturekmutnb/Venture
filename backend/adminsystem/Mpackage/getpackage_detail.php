<?php
require '../../database.php';

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

$package_id = $_GET['id'] ?? null;
if (!$package_id) {
    echo json_encode(['success'=>false, 'message'=>'No package id']);
    exit;
}

$sql = "SELECT 
          p.package_id, p.title AS package_title, p.description, p.image_url,
          p.destination, p.duration_days, p.travel_date, p.price, p.available_seats,
          pp.day_number, pp.title AS plan_title, pp.activities
        FROM package p
        LEFT JOIN package_plan pp ON p.package_id = pp.package_id
        WHERE p.package_id = ?
        ORDER BY pp.day_number";


$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success'=>false, 'message'=>'Prepare failed: '.$conn->error]);
    exit;
}

// ถ้า package_id เป็น VARCHAR เช่น "69KR01"
$stmt->bind_param("s", $package_id);

if (!$stmt->execute()) {
    echo json_encode(['success'=>false, 'message'=>'Execute failed: '.$stmt->error]);
    exit;
}

$result = $stmt->get_result();
$rows = [];
while ($row = $result->fetch_assoc()) {
    $rows[] = $row;
}

echo json_encode(['success'=>true, 'data'=>$rows]);
