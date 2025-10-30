<?php
session_start(); 
require 'database.php'; 

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

if (!isset($_FILES['paymentSlip']) || $_FILES['paymentSlip']['error'] != 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No slip file uploaded']);
    exit;
}

// upload
$uploadDir = __DIR__ . '/uploads/'; 
if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);

$fileExtension = pathinfo($_FILES['paymentSlip']['name'], PATHINFO_EXTENSION);
$fileName = 'slip-' . uniqid() . '.' . $fileExtension;
$uploadPath = $uploadDir . $fileName;
$dbPath = 'uploads/' . $fileName;

if (!move_uploaded_file($_FILES['paymentSlip']['tmp_name'], $uploadPath)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Could not save slip file']);
    exit;
}

// POST data
$package_id = $_POST['packageId'] ?? null;
$quantity = (int)($_POST['quantity'] ?? 0);
$total_price = (float)($_POST['totalPrice'] ?? 0);
$discount = $_POST['discountCode'] ?? null;
if ($discount === 'null') $discount = null;

if (!isset($_SESSION['acc_id'])) { 
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    unlink($uploadPath); 
    exit;
}
$acc_id = $_SESSION['acc_id'];

// validate
if (!$package_id || $quantity <= 0 || $total_price <= 0) {
    unlink($uploadPath);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid booking data']);
    exit;
}

// check package exists
$check_pkg = $conn->prepare("SELECT available_seats FROM package WHERE package_id = ?");
$check_pkg->bind_param("s", $package_id);
$check_pkg->execute();
$result = $check_pkg->get_result();
if ($result->num_rows === 0) {
    unlink($uploadPath);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid package ID']);
    exit;
}
$row = $result->fetch_assoc();
$availableSeats = (int)$row['available_seats'];
$check_pkg->close();

if ($availableSeats < $quantity) {
    unlink($uploadPath);
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Not enough seats available']);
    exit;
}

// transaction
$conn->begin_transaction();
try {
    $sql_insert = "INSERT INTO transaction 
                   (acc_id, package_id, quantity, total_price, discount_applied, status, slip_image) 
                   VALUES (?, ?, ?, ?, ?, 'pending', ?)";
    $stmt_insert = $conn->prepare($sql_insert);
    $stmt_insert->bind_param("isidss", $acc_id, $package_id, $quantity, $total_price, $discount, $dbPath);
    if (!$stmt_insert->execute()) throw new Exception("Insert failed: " . $stmt_insert->error);
    $stmt_insert->close();

    $sql_update = "UPDATE package 
                   SET available_seats = available_seats - ? 
                   WHERE package_id = ? AND available_seats >= ?";
    $stmt_update = $conn->prepare($sql_update);
    $stmt_update->bind_param("isi", $quantity, $package_id, $quantity);
    $stmt_update->execute();
    if ($stmt_update->affected_rows === 0) throw new Exception("Not enough seats available");
    $stmt_update->close();

    $conn->commit();
    echo json_encode(['success' => true, 'message' => 'Booking submitted successfully']);

} catch (Exception $e) {
    $conn->rollback();
    if (file_exists($uploadPath)) unlink($uploadPath);
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}

$conn->close();
?>
