<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require '../database.php';
require __DIR__ . "/vendor/autoload.php";

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ตรวจ session
if(!isset($_SESSION['acc_id'])){
    echo json_encode(['success'=>false,'message'=>'User not logged in']);
    exit;
}

$acc_id = intval($_SESSION['acc_id']);

// ดึง username และ email ปัจจุบัน
$stmt = $conn->prepare("SELECT username, email FROM account WHERE acc_id=?");
$stmt->bind_param("i", $acc_id);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if(!$user){
    echo json_encode(['success'=>false,'message'=>'User not found']);
    exit;
}

// สร้าง token และ expires
$token = bin2hex(random_bytes(16));
$expires = date('Y-m-d H:i:s', strtotime('+1 day'));

// บันทึก token ลงตาราง email_confirm
$stmtToken = $conn->prepare("INSERT INTO email_confirm (acc_id, token, expires) VALUES (?, ?, ?)");
$stmtToken->bind_param("iss", $acc_id, $token, $expires);
$stmtToken->execute();

// ส่ง email
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
    $mail->addAddress($user['email']); 

    $mail->isHTML(true);
    $mail->Subject = 'Confirm your email';
    $mail->Body    = "Hello {$user['username']},<br>Please confirm your email by clicking <a href='https://yourdomain.com/confirm_email.php?token=$token'>here</a>.";

    $mail->send();
    echo json_encode(['success'=>true,'message'=>'Verification email sent.']);
} catch (Exception $e) {
    echo json_encode(['success'=>false,'message'=>"Mailer Error: {$mail->ErrorInfo}"]);
}
