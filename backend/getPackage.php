<?php
require 'database.php';

if (!isset($_GET['package_id'])) {
    echo json_encode(["error" => "Missing package_id"]);
    exit;
}

$package_id = $_GET['package_id'];

try {
    $stmt = $conn->prepare("SELECT * FROM packages WHERE package_id = ?");
    $stmt->execute([$package_id]);
    $package = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$package) {
        echo json_encode(["error" => "Package not found"]);
        exit;
    }

    echo json_encode([
        "package_id" => $package['package_id'],
        "title" => $package['title'],
        "price" => floatval($package['price']),
        "travel_date" => $package['travel_date'] ?? "",
        "destination" => $package['destination'] ?? ""
    ]);
} catch (PDOException $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>