<?php
date_default_timezone_set('Asia/Bangkok');
require "database.php";
require __DIR__ . "/vendor/autoload.php"; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
session_start();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';

    if (empty($email)) {
        exit("‼️กรุณากรอก email");
    }
 
    $stmt = $conn->prepare("SELECT acc_id, email FROM account WHERE email = ?");
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    $account = $result->fetch_assoc();
    if (!$account) {
        exit("❌ ไม่มีผู้ใช้งานในระบบ");
    }
    $acc_id = $account['acc_id'];

    
    $token = bin2hex(random_bytes(32)); 
    $expires = date("Y-m-d H:i:s", strtotime("+1 hour")); 

    
    $stmt = $conn->prepare("INSERT INTO resetpass (acc_id, token, expires) VALUES (?, ?, ?)");
    $stmt->bind_param("iss", $acc_id, $token, $expires);
    $stmt->execute();

    $resetLink = "http://localhost/Venture/frontend/Public/resetPass.html?token=" . $token;

   
    $mail = new PHPMailer(true);
    try {
        $mail->isSMTP();
        $mail->Host = "smtp.gmail.com";
        $mail->SMTPAuth = true;
        $mail->Username = "jakkapat.wut@gmail.com";      
        $mail->Password = "mzjd wspm pthn numu";
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;        
        $mail->Port = 587;

        
        $mail->setFrom("jakkapat.wut@gmail.com", "Venture-Support Team");
        $mail->addAddress($email); 

        $mail->isHTML(true);
        $mail->Subject = "Password Reset Request";
        $mail->Body    = "
            <p>คุณได้ส่งคำขอรีเซ็ตรหัสผ่าน</p>
            <p>กรุณาคลิกลิงก์ด้านล่าง (ลิงก์จะหมดอายุใน 1 ชั่วโมง)</p>
            <p><a href='$resetLink'>$resetLink</a></p>
        ";

        $mail->send();
        echo "✅ กรุณาตรวจสอบอีเมลของคุณ";
    } catch (Exception $e) {
        echo "❌ ไม่สามารถส่งอีเมลได้: {$mail->ErrorInfo}";
    }
}
?>