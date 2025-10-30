<?php
session_start();
require '../database.php'; 

header('Content-Type: application/json');

// --- ตรวจสอบสิทธิ์ admin ---
if (!isset($_SESSION['role']) || $_SESSION['role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['success' => false, 'message' => 'Access denied']);
    exit;
}

// --- รับค่า filter type และ year ---
$type = $_GET['type'] ?? 'month'; // month / quarter / year
$year = intval($_GET['year'] ?? date('Y'));

try {
    $data = [];

    if ($type === 'month') {
        // รายเดือน
        $sql = "SELECT MONTH(created_at) AS month, SUM(total_price) AS total
                FROM transaction
                WHERE YEAR(created_at) = ? AND status IN ('paid', 'completed')
                GROUP BY month
                ORDER BY month ASC";

        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $year);
        $stmt->execute();
        $result = $stmt->get_result();

        // สร้าง array ทั้ง 12 เดือน
        $months = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
        for ($i=1; $i<=12; $i++) $data[$i] = 0;

        while($row = $result->fetch_assoc()){
            $data[intval($row['month'])] = floatval($row['total']);
        }

        $output = [];
        foreach($months as $index => $label){
            $output[] = ['period' => $label, 'total' => $data[$index+1]];
        }

    } elseif ($type === 'quarter') {
        // รายไตรมาส
        $sql = "SELECT CEIL(MONTH(created_at)/3) AS quarter, SUM(total_price) AS total
                FROM transaction
                WHERE YEAR(created_at) = ? AND status IN ('paid', 'completed')
                GROUP BY quarter
                ORDER BY quarter ASC";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $year);
        $stmt->execute();
        $result = $stmt->get_result();

        $quarters = [1=>0,2=>0,3=>0,4=>0];
        while($row = $result->fetch_assoc()){
            $quarters[intval($row['quarter'])] = floatval($row['total']);
        }

        $output = [];
        for ($i=1; $i<=4; $i++){
            $output[] = ['period' => "ไตรมาส $i", 'total' => $quarters[$i]];
        }

   } else {
    $sql = "SELECT YEAR(created_at) AS year, SUM(total_price) AS total
            FROM transaction
            WHERE YEAR(created_at) = ? AND status IN ('paid', 'completed')
            GROUP BY year
            ORDER BY year ASC";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $year);
    $stmt->execute();
    $result = $stmt->get_result();

    $output = [];
    while($row = $result->fetch_assoc()){
        $output[] = ['period' => $row['year'], 'total' => floatval($row['total'])];
    }

    // ถ้าไม่มี transaction ในปีนั้น ส่ง 0
    if(empty($output)){
        $output[] = ['period' => $year, 'total' => 0];
    }
}

    echo json_encode($output);

} catch(Exception $e){
    http_response_code(500);
    echo json_encode(['success'=>false,'message'=>'Server error: '.$e->getMessage()]);
}

$conn->close();
?>
