<?php
require "database.php";
session_start();
header('Content-Type: application/json');

// รับข้อมูลจาก frontend
$data = json_decode(file_get_contents('php://input'), true);

$code = $data['code'] ?? '';
$subtotal = $data['subtotal'] ?? 0;
$travel_date = $data['travel_date'] ?? ''; // ต้องส่งจาก frontend

if (!isset($_SESSION['acc_id'])) {
    echo json_encode(['success' => false, 'message' => 'กรุณาเข้าสู่ระบบก่อนใช้โค้ด']);
    exit;
}

$acc_id = $_SESSION['acc_id'];
$today = new DateTime();

try {
    // ตรวจสอบว่าโค้ดมีอยู่จริงไหม
    $sql = "SELECT * FROM discount_codes WHERE code = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("s", $code);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        echo json_encode(['success' => false, 'message' => 'ไม่พบโค้ดส่วนลดนี้']);
        exit;
    }

    $promo = $result->fetch_assoc();
    $code_id = $promo['code_id'];
    $stmt->close();

    // ตรวจสอบว่า user เคยใช้โค้ดนี้หรือไม่
    $checkUsageSQL = "SELECT * FROM discount_usage WHERE code_id = ? AND acc_id = ?";
    $checkStmt = $conn->prepare($checkUsageSQL);
    $checkStmt->bind_param("ii", $code_id, $acc_id);
    $checkStmt->execute();
    $checkResult = $checkStmt->get_result();
    if ($checkResult->num_rows > 0) {
        echo json_encode(['success' => false, 'message' => 'คุณเคยใช้โค้ดนี้แล้ว']);
        exit;
    }
    $checkStmt->close();

    $discount_percent = $promo['discount_percent'];

    // เงื่อนไขพิเศษสำหรับโค้ดแต่ละประเภท
    if ($code === 'NEW10') {
        // สำหรับผู้ใช้ใหม่ไม่เกิน 10 วัน
        $accSQL = "SELECT created_at FROM account WHERE acc_id = ?";
        $accStmt = $conn->prepare($accSQL);
        $accStmt->bind_param("i", $acc_id);
        $accStmt->execute();
        $accResult = $accStmt->get_result()->fetch_assoc();
        $accStmt->close();

        if (!$accResult) {
            echo json_encode(['success' => false, 'message' => 'ไม่พบข้อมูลผู้ใช้']);
            exit;
        }

        $created_at = new DateTime($accResult['created_at']);
        $diff = $today->diff($created_at)->days;
        if ($diff > 10) {
            echo json_encode(['success' => false, 'message' => 'โค้ด NEW10 ใช้ได้เฉพาะผู้ใช้ใหม่ที่สมัครไม่เกิน 10 วัน']);
            exit;
        }
    } elseif ($code === 'EARLY15' || $code === 'LAST10') {
        if (!$travel_date) {
            echo json_encode(['success' => false, 'message' => 'ไม่พบวันเดินทางสำหรับตรวจสอบโค้ด']);
            exit;
        }
        $travelDate = new DateTime($travel_date);
        $diffDays = (int)$travelDate->diff($today)->format("%r%a"); // จำนวนวันจากวันนี้ไปวันเดินทาง

        if ($code === 'EARLY15' && $diffDays < 30) {
            echo json_encode(['success' => false, 'message' => 'โค้ด EARLY15 ต้องใช้ก่อนการเดินทางอย่างน้อย 30 วัน']);
            exit;
        }

        if ($code === 'LAST10' && $diffDays > 7) {
            echo json_encode(['success' => false, 'message' => 'โค้ด LAST10 ต้องใช้ภายใน 7 วันก่อนการเดินทาง']);
            exit;
        }

        // ตั้งส่วนลดตามโค้ด
        if ($code === 'EARLY15') $discount_percent = 15;
        if ($code === 'LAST10') $discount_percent = 10;
    }

    // ตรวจสอบช่วงวันที่ใช้งานได้ (จาก discount_codes)
    $todayStr = $today->format('Y-m-d');
    if ($todayStr < $promo['start_date'] || $todayStr > $promo['end_date']) {
        echo json_encode(['success' => false, 'message' => 'โค้ดนี้หมดอายุหรือยังไม่เริ่มใช้งาน']);
        exit;
    }

    // คำนวณส่วนลด
    $discountAmount = $subtotal * ($discount_percent / 100);
    $totalAfterDiscount = $subtotal - $discountAmount;

    // บันทึกการใช้โค้ด
    $insertSQL = "INSERT INTO discount_usage (code_id, acc_id) VALUES (?, ?)";
    $insertStmt = $conn->prepare($insertSQL);
    $insertStmt->bind_param("ii", $code_id, $acc_id);
    $insertStmt->execute();
    $insertStmt->close();

    echo json_encode([
        'success' => true,
        'message' => "ใช้โค้ดสำเร็จ ลด {$discount_percent}%",
        'discount_percent' => $discount_percent,
        'discountAmount' => $discountAmount,
        'totalAfterDiscount' => $totalAfterDiscount
    ]);

    $conn->close();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Server Error: ' . $e->getMessage()]);
}
?>
