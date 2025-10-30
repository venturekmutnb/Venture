<?php
require "../../database.php";

if($_SERVER['REQUEST_METHOD'] !== 'POST') { echo "method"; exit; }

$name = $_POST['name'] ?? '';
$discount = floatval($_POST['discount_percent'] ?? 0);
$start = $_POST['start_date'] ?? null;
$end = $_POST['end_date'] ?? null;

$start = $start === '' ? null : $start;
$end = $end === '' ? null : $end;

$stmt = $conn->prepare("INSERT INTO promotion (name, discount_percent, start_date, end_date) VALUES (?,?,?,?)");
$stmt->bind_param("sdss", $name, $discount, $start, $end);

if($stmt->execute()) {
    echo "success";
} else {
    echo $stmt->error;
}
