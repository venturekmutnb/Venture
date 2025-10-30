<?php
require "database.php";
header('Content-Type: application/json');

$package_id = null;
if (isset($_GET['package_id'])) $package_id = $_GET['package_id'];

if (!$package_id) {
    echo json_encode(["error" => "Package ID is required."]);
    exit;
}

// --- เตรียมคำสั่งดึงข้อมูลย่อย (Plans และ Promos) ---
// (ใช้ Prepared Statements เพื่อความปลอดภัย)
$stmt_plans = $conn->prepare("SELECT * FROM package_plan WHERE package_id = ? ORDER BY day_number");
$stmt_proms = $conn->prepare("SELECT pr.* FROM promotion pr 
                             JOIN package_promotion pp ON pr.promo_id=pp.promo_id 
                             WHERE pp.package_id = ?");

if (!$stmt_plans || !$stmt_proms) {
    echo json_encode(["error" => "Prepare statements failed: " . $conn->error]);
    exit;
}
// --- จบการเตรียม ---

// --- ดึงข้อมูลแพ็กเกจหลัก ---
$sql = "SELECT * FROM package WHERE package_id = ?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode(["error" => "Statement preparation failed: " . $conn->error]);
    exit;
}

$stmt->bind_param("s", $package_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $package = $result->fetch_assoc();
    $pid = $package['package_id']; // ใช้ ID จากผลลัพธ์ที่ได้

    // --- เริ่มส่วนที่เพิ่มเข้ามา ---

    // 1. ดึง Plans
    $plans = [];
    $stmt_plans->bind_param("s", $pid);
    $stmt_plans->execute();
    $ps = $stmt_plans->get_result();
    if ($ps) {
        while ($r = $ps->fetch_assoc()) $plans[] = $r;
    }

    // 2. ดึง Promotions
    $proms = [];
    $stmt_proms->bind_param("s", $pid);
    $stmt_proms->execute();
    $pp = $stmt_proms->get_result();
    if ($pp) {
        while ($r = $pp->fetch_assoc()) $proms[] = $r;
    }

    // 3. เพิ่มข้อมูล plans และ promotions เข้าไปใน package object
    $package['plans'] = $plans;
    $package['promotions'] = $proms;

    // --- จบส่วนที่เพิ่มเข้ามา ---

    echo json_encode($package); // ส่ง JSON ที่มีข้อมูลครบถ้วนกลับไป

} else {
    echo json_encode(["error" => "Package not found."]);
}

// ปิด statements ทั้งหมด
$stmt->close();
$stmt_plans->close();
$stmt_proms->close();
$conn->close();
?>