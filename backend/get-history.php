<?php
session_start();
require "database.php";

if (!isset($_SESSION['acc_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}
$acc_id = $_SESSION['acc_id'];

try {
    $sql = "SELECT 
                T.trans_id, T.quantity, T.total_price, T.status,
                T.created_at AS booking_date,
                P.title AS package_name, P.travel_date
            FROM 
                transaction T
            JOIN 
                package P ON T.package_id = P.package_id
            WHERE 
                T.acc_id = ?
            ORDER BY 
                T.created_at DESC";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(['success'=>false, 'message'=>'Prepare failed: '.$conn->error]);
        exit;
    }

    $stmt->bind_param("i", $acc_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $bookings = $result->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    // แปลงค่า status เป็นข้อความ
    $formatted_bookings = [];
    foreach ($bookings as $booking) {
        switch($booking['status']){
            case 'pending':
                $booking['statusText'] = 'รอยืนยันจากฝั่งแอดมิน';
                break;
            case 'paid':
                $booking['statusText'] = 'ชำระแล้ว';
                break;
            case 'cancelled':
                $booking['statusText'] = 'ยกเลิกแล้ว';
                break;
            case 'completed':
                $booking['statusText'] = 'เที่ยวเสร็จสิ้น';
                break;
            default:
                $booking['statusText'] = $booking['status'];
        }
        $formatted_bookings[] = $booking;
    }

    header('Content-Type: application/json');
    echo json_encode($formatted_bookings);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Error fetching history: '.$e->getMessage()]);
}

$conn->close();
?>
