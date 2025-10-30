<?php
session_start();
require "../database.php"; // ปรับ path ตามจริง

header('Content-Type: application/json');

// 1. ตรวจสอบว่า admin login หรือยัง (คุณอาจเช็ค role ได้)
if (!isset($_SESSION['acc_id']) || ($_SESSION['role'] ?? '') !== 'admin') {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

// 2. รับค่า POST
$data = json_decode(file_get_contents('php://input'), true);
$trans_id = $data['trans_id'] ?? null;
$new_status = $data['status'] ?? null;

if (!$trans_id || !$new_status) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing transaction ID or status']);
    exit;
}

// 3. Transaction update + point logic
$conn->begin_transaction();

try {
    // ดึง transaction ก่อน
    $stmt = $conn->prepare("SELECT acc_id, total_price, status FROM transaction WHERE trans_id = ?");
    $stmt->bind_param("i", $trans_id);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) throw new Exception("Transaction not found");

    $tx = $result->fetch_assoc();
    $user_id = $tx['acc_id'];
    $old_status = $tx['status'];
    $total_price = (float)$tx['total_price'];

    $stmt->close();

    // 4. อัปเดต status
    $stmt = $conn->prepare("UPDATE transaction SET status = ? WHERE trans_id = ?");
    $stmt->bind_param("si", $new_status, $trans_id);
    if (!$stmt->execute()) throw new Exception("Failed to update status");
    $stmt->close();

    // 5. เพิ่ม points ก็ต่อเมื่อ status เปลี่ยนเป็น paid/completed และยังไม่เคยเพิ่มแต้ม
    $add_points = false;
    if (($new_status === 'paid' || $new_status === 'completed') &&
        ($old_status !== 'paid' && $old_status !== 'completed')) {
        $add_points = true;
        $points_to_add = (int)($total_price * 0.1); // 10% ของราคาจริง

        // ตรวจสอบ user มี row ใน loyalty_points หรือไม่
        $stmt = $conn->prepare("SELECT points FROM loyalty_points WHERE acc_id = ?");
        $stmt->bind_param("i", $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($result->num_rows > 0) {
            $current_points = $result->fetch_assoc()['points'];
            $new_points = $current_points + $points_to_add;
            $stmt->close();

            $stmt = $conn->prepare("UPDATE loyalty_points SET points = ? WHERE acc_id = ?");
            $stmt->bind_param("ii", $new_points, $user_id);
            $stmt->execute();
            $stmt->close();
        } else {
            $stmt->close();
            // insert row ใหม่
            $stmt = $conn->prepare("INSERT INTO loyalty_points (acc_id, points) VALUES (?, ?)");
            $stmt->bind_param("ii", $user_id, $points_to_add);
            $stmt->execute();
            $stmt->close();
        }
    }

    $conn->commit();
    echo json_encode([
        'success' => true,
        'message' => 'Transaction updated successfully',
        'points_added' => $add_points ? $points_to_add : 0
    ]);

} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

$conn->close();
?>
