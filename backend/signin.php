<?php
require 'database.php';
session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $username = isset($_POST['username']) ? trim($_POST['username']) : '';
    $password = isset($_POST['password']) ? trim($_POST['password']) : '';

    if (empty($username) || empty($password)) {
        exit("❌ กรุณากรอกข้อมูลให้ครบถ้วน");
    }

    $stmt = $conn->prepare("SELECT acc_id , pass , role FROM account WHERE username = ? ");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->store_result();
    if ($stmt->num_rows == 1) {
        $stmt->bind_result($acc_id, $dbpassword,$role);
        $stmt->fetch();

       
        if ($password == $dbpassword) {
            $_SESSION['acc_id'] = $acc_id;
            $_SESSION['username'] = $username;
            $_SESSION['role'] = $role;
            echo "สำเร็จแล้ว";
        } else {
            exit("password wrong!");
        }
    } else {
        exit("ไม่พบผู้ใช้งานนี้");
    }
}
?>