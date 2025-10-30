<?php
session_start();
require '../database.php'; 

header('Content-Type: application/json');

// --- ตรวจสอบว่าเป็น admin ---
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

try {
    // ดึงทุก package และ transaction (ถ้ามี)
    $sql = "SELECT 
                P.package_id,
                P.title AS package_name,
                P.travel_date,
                T.trans_id,
                T.acc_id,
                T.quantity,
                T.total_price,
                T.discount_applied,
                T.status,
                T.slip_image,
                T.created_at AS booking_date,
                A.username
            FROM package P
            LEFT JOIN transaction T ON T.package_id = P.package_id
            LEFT JOIN account A ON T.acc_id = A.acc_id
            ORDER BY P.title ASC, T.created_at DESC";

    $result = $conn->query($sql);
    $transactions = [];

    while ($row = $result->fetch_assoc()) {
        $transactions[] = [
            'package_id' => $row['package_id'],
            'package_name' => $row['package_name'],
            'travel_date' => $row['travel_date'],
            'trans_id' => $row['trans_id'] ? (int)$row['trans_id'] : null,
            'acc_id' => $row['acc_id'] ? (int)$row['acc_id'] : null,
            'quantity' => $row['quantity'] ? (int)$row['quantity'] : null,
            'total_price' => $row['total_price'] ? (float)$row['total_price'] : null,
            'discount_applied' => $row['discount_applied'],
            'status' => $row['status'],
            'slip_image' => $row['slip_image'],
            'booking_date' => $row['booking_date'],
            'username' => $row['username']
        ];
    }

    echo json_encode($transactions);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
}

$conn->close();
?>
