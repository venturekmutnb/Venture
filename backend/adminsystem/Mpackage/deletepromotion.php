<?php
require "../../database.php"; 

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $promo_id = $_POST['promo_id'] ?? '';
    if ($promo_id === '') { echo "Invalid promo_id"; exit; }

    $stmt = $conn->prepare("DELETE FROM promotion WHERE promo_id = ?");
    $stmt->bind_param("i", $promo_id); // promo_id เป็น int
    if ($stmt->execute()) echo "Promotion deleted successfully"; else echo "Failed to delete promotion";
    $stmt->close();
}
$conn->close();