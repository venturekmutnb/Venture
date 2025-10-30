<?php
require "../database.php";

$token = $_GET['token'] ?? '';

$stmt = $conn->prepare("SELECT acc_id, expires FROM email_confirm WHERE token=?");
$stmt->bind_param("s", $token);
$stmt->execute();
$result = $stmt->get_result();

if($row = $result->fetch_assoc()){
    if(strtotime($row['expires']) > time()){
        // อัปเดต status หรือ flag ว่า email ยืนยันแล้ว
        $stmtUpdate = $conn->prepare("UPDATE account SET email_verified=1 WHERE acc_id=?");
        $stmtUpdate->bind_param("i", $row['acc_id']);
        $stmtUpdate->execute();

        echo "Email confirmed successfully!";
    } else {
        echo "Token expired!";
    }
} else {
    echo "Invalid token!";
}
