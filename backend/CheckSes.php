<?php
session_start();
header('Content-Type: application/json');

if(isset($_SESSION['username'])) {
    echo json_encode([
        'username' => $_SESSION['username'],
        'role' => $_SESSION['role']
    ]);
} else {
    echo json_encode(['username' => null, 'role' => null]);
}
?>