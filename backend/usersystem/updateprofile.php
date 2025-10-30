<?php
ini_set('display_errors', 0); 
error_reporting(E_ALL);
header('Content-Type: application/json');

session_start();
require '../database.php';

if(!isset($_SESSION['acc_id'])){
    echo json_encode(['success'=>false,'message'=>'User not logged in']);
    exit;
}

$acc_id = intval($_SESSION['acc_id']);
$data = json_decode(file_get_contents('php://input'), true);

$username = trim($data['username'] ?? '');
$email = trim($data['email'] ?? '');
$password = trim($data['password'] ?? '');

if(!$username || !$email){
    echo json_encode(['success'=>false,'message'=>'Username and Email are required']);
    exit;
}

try {
    if($password){
        $stmt = $conn->prepare("UPDATE account SET username=?, email=?, pass=? WHERE acc_id=?");
        $stmt->bind_param("sssi", $username, $email, $password, $acc_id);
    } else {
        $stmt = $conn->prepare("UPDATE account SET username=?, email=? WHERE acc_id=?");
        $stmt->bind_param("ssi", $username, $email, $acc_id);
    }

    if($stmt->execute()){

    $_SESSION['username'] = $username;
    $_SESSION['email'] = $email;
    if($password){
        $_SESSION['pass'] = $password; 
    }

    echo json_encode([
        'success' => true,
        'message' => 'Profile updated successfully',
        'role' => $_SESSION['role'] ?? 'user',
        'username' => $_SESSION['username']
    ]);
    } else {
        echo json_encode(['success'=>false,'message'=>'Failed to update profile: '.$conn->error]);
    }
} catch(Exception $e){
    echo json_encode(['success'=>false,'message'=>'Error: '.$e->getMessage()]);
}
