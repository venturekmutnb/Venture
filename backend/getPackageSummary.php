<?php
session_start();
require 'database.php';

header('Content-Type: application/json');

// ตรวจสอบว่าเป็น admin
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

try {
    $sql = "SELECT 
                package.package_id,
                package.title,
                COUNT(transaction.trans_id) AS total_bookings,
                COALESCE(SUM(transaction.total_price), 0) AS total_revenue
            FROM package
            LEFT JOIN transaction
                ON package.package_id = transaction.package_id
            GROUP BY package.package_id, package.title
            ORDER BY total_revenue DESC";

    $result = $conn->query($sql);
    $packages = [];

    while($row = $result->fetch_assoc()) {
        $packages[] = [
            'package_id' => $row['package_id'],
            'title' => $row['title'],
            'total_bookings' => (int)$row['total_bookings'],
            'total_revenue' => (float)$row['total_revenue']
        ];
    }

    echo json_encode(['success' => true, 'data' => $packages]);

} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
