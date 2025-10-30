<?php
// backend/getUserpoints.php
require "database.php";
session_start(); 

header('Content-Type: application/json');

// 1. ตรวจสอบว่า Login หรือยัง (ผมเดาว่าคุณเก็บ 'acc_id' ใน session)
if (!isset($_SESSION['acc_id'])) {
    http_response_code(401); // Unauthorized
    echo json_encode(['points' => 0, 'message' => 'User not logged in']);
    exit;
}

$acc_id = $_SESSION['acc_id'];

try {
    // 2. ค้นหาแต้มจากตาราง 'loyalty_points'
    $sql = "SELECT points FROM loyalty_points WHERE acc_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $acc_id);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        // 3. ถ้าเจอ: ส่งแต้มกลับไป
        $user_points = $result->fetch_assoc();
        echo json_encode(['points' => (int)$user_points['points']]);
    } else {
        // 4. ถ้าไม่เจอ (user ยังไม่มีแต้ม): ส่ง 0 กลับไป
        echo json_encode(['points' => 0]);
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['points' => 0, 'message' => 'Server Error: ' . $e->getMessage()]);
}
?>