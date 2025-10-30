<?php
ini_set('display_errors', 0);
error_reporting(0);
header('Content-Type: application/json');

session_start();
require '../database.php';

if(!isset($_SESSION['acc_id'])){
    echo json_encode(['success'=>false,'message'=>'User not logged in']);
    exit;
}

$acc_id = intval($_SESSION['acc_id']);

$stmt = $conn->prepare("SELECT username, email, pass FROM account WHERE acc_id=?");
$stmt->bind_param("i", $acc_id);
$stmt->execute();
$result = $stmt->get_result();

if($user = $result->fetch_assoc()){
    echo json_encode(['success'=>true,'data'=>$user]);
} else {
    echo json_encode(['success'=>false,'message'=>'User not found']);
}
