<?php
require "../../database.php";
header('Content-Type: application/json');

if (!$conn) {
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

//query
$sql = "SELECT * FROM promotion ORDER BY created_at DESC";
$res = $conn->query($sql);

//ตรวจสอบ
if (!$res) {
    echo json_encode(['error' => 'Query failed: '.$conn->error]);
    exit;
}

// สร้าง array ของผลลัพธ์
$data = [];
while ($row = $res->fetch_assoc()) {
    $data[] = $row;
}

// ส่ง JSON
echo json_encode($data);
