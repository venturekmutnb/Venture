<?php
require 'database.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $email    = isset($_POST['email']) ? trim($_POST['email']) : '';
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['pass']) ? $_POST['pass'] : '';
    $firm     = isset($_POST['firmpass']) ? $_POST['firmpass'] : '';

    if (empty($email) || empty($username) || empty($password) || empty($firm)) {
        exit("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        exit("❌ email ไม่ถูกต้อง");
    }

    if ($password !== $firm) {
        exit("❌ password ไม่ตรงกัน");
    }

    // ตรวจสอบ email ซ้ำ
    $checkSql = "SELECT acc_id FROM account WHERE email = ?";
    $checkStmt = $conn->prepare($checkSql);
    $checkStmt->bind_param("s", $email);
    $checkStmt->execute();
    $checkStmt->store_result();
    if ($checkStmt->num_rows > 0) {
        $checkStmt->close();
        $conn->close();
        exit("❌ email นี้ถูกใช้แล้ว");
    }
    $checkStmt->close();

    $sql = "INSERT INTO account (email, username , pass) VALUES (?,?,?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss",$email,$username,$password);

    if ($stmt->execute()) {
        echo "สมัครสมาชิกสำเร็จ";
    } else {
        echo "❌ เกิดข้อผิดพลาดในการบันทึก" . $stmt->error;
    }
    $stmt->close();
    $conn->close();
}
?>