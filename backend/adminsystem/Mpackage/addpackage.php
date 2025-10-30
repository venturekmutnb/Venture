<?php
require "../../database.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') { 
    echo "method"; 
    exit; 
}

$package_id = $_POST['package_id'] ?? ''; 
$title = $_POST['title'] ?? '';
$destination = $_POST['destination'] ?? '';
$duration_days = intval($_POST['duration_days'] ?? 0);
$travel_date = $_POST['travel_date'] ?? null;
$price = floatval($_POST['price'] ?? 0);
$available_seats = intval($_POST['available_seats'] ?? 0);
$description = $_POST['description'] ?? '';
$plansJson = $_POST['plans'] ?? '[]';

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

$stmt = $conn->prepare("INSERT INTO package (package_id, title, description, image_url, destination, duration_days, travel_date, price, available_seats) VALUES (?,?,?,?,?,?,?,?,?)");
$stmt->bind_param("sssssssdi", $package_id, $title, $description, $imagePath, $destination, $duration_days, $travel_date, $price, $available_seats);

if (!$stmt->execute()) { 
    echo $stmt->error; 
    exit; 
}

$plans = json_decode($plansJson, true);
if (is_array($plans)) {
    $ps = $conn->prepare("INSERT INTO package_plan (package_id, day_number, title, activities) VALUES (?,?,?,?)");
    foreach ($plans as $pl) {
        $day = intval($pl['day_number'] ?? 0);
        $t = $pl['title'] ?? '';
        $act = $pl['activities'] ?? '';
        $ps->bind_param("siss", $package_id, $day, $t, $act);
        $ps->execute();
    }
}

if (!empty($_POST['promotions'])) {
    $promo_ids = $_POST['promotions'];
    if (!is_array($promo_ids)) $promo_ids = [$promo_ids];
    $ppstmt = $conn->prepare("INSERT INTO package_promotion (package_id, promo_id) VALUES (?,?)");
    foreach ($promo_ids as $pid) {
        $ppstmt->bind_param("si", $package_id, $pid);
        $ppstmt->execute();
    }
}

echo "success";
