<?php
require "../../database.php";
if ($_SERVER['REQUEST_METHOD'] !== 'POST') { echo "method"; exit; }

$pid = $_POST['package_id'] ?? '';
$title = $_POST['title'] ?? '';
$destination = $_POST['destination'] ?? '';
$duration_days = intval($_POST['duration_days'] ?? 0);
$travel_date = $_POST['travel_date'] ?? null;
$price = floatval($_POST['price'] ?? 0);
$available_seats = intval($_POST['available_seats'] ?? 0);
$description = $_POST['description'] ?? '';

// handle image
$imagePath = null;
if (!empty($_FILES['image']['name'])) {
    $uploads = __DIR__ . '/packagepics/';
    if (!file_exists($uploads)) mkdir($uploads, 0755, true);
    $name = time() . '_' . basename($_FILES['image']['name']);
    $target = $uploads . $name;
    if (move_uploaded_file($_FILES['image']['tmp_name'], $target)) {
        $imagePath = 'packagepics/' . $name;
    }
}

// update package table
if ($imagePath) {
    $stmt = $conn->prepare("UPDATE package SET title=?, description=?, image_url=?, destination=?, duration_days=?, travel_date=?, price=?, available_seats=? WHERE package_id=?");
    $stmt->bind_param("sssssidis", $title, $description, $imagePath, $destination, $duration_days, $travel_date, $price, $available_seats, $pid);
} else {
    $stmt = $conn->prepare("UPDATE package SET title=?, description=?, destination=?, duration_days=?, travel_date=?, price=?, available_seats=? WHERE package_id=?");
    $stmt->bind_param("sssisdii", $title, $description, $destination, $duration_days, $travel_date, $price, $available_seats, $pid);
}

if (!$stmt->execute()) {
    echo $stmt->error;
    exit;
}

// --- handle plans ---
$plansJson = $_POST['plans'] ?? '[]';
$plans = json_decode($plansJson, true);
if ($plans && is_array($plans)) {
    // ลบ plan เก่าของ package
    $stmt = $conn->prepare("DELETE FROM package_plan WHERE package_id=?");
    $stmt->bind_param("s", $pid);
    $stmt->execute();

    // insert plan ใหม่
    $stmt = $conn->prepare("INSERT INTO package_plan (package_id, day_number, title, activities) VALUES (?,?,?,?)");
    foreach ($plans as $pl) {
        $day = intval($pl['day_number'] ?? 0);
        $ptitle = $pl['title'] ?? '';
        $activities = $pl['activities'] ?? '';
        $stmt->bind_param("siss", $pid, $day, $ptitle, $activities);
        $stmt->execute();
    }
}

echo "success";
