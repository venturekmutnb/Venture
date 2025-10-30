<?php
date_default_timezone_set('Asia/Bangkok');
require "database.php";

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    exit("❌ วิธีการเข้าถึงไม่ถูกต้อง");
}

$token    = $_POST['token'] ?? '';
$password = $_POST['password'] ?? '';

var_dump($_POST);

if (empty($token) || empty($password)) {
    exit("❌ ข้อมูลไม่ครบ");
}

$stmt = $conn->prepare("SELECT acc_id FROM resetpass WHERE token=? AND expires > NOW()");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    exit("❌ ลิงก์หมดอายุหรือไม่ถูกต้อง");
}

$row = $result->fetch_assoc();
$acc_id = $row['acc_id'];


$stmt = $conn->prepare("UPDATE account SET pass=? WHERE acc_id=?");
$stmt->bind_param("si", $password, $acc_id);
if (!$stmt->execute()) {
    exit("❌ เกิดข้อผิดพลาดในการอัปเดตรหัสผ่าน");
}


$stmt = $conn->prepare("DELETE FROM resetpass WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();

echo "✅ รีเซ็ตรหัสผ่านสำเร็จแล้ว";
?>
