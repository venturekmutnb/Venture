<?php
require "../../database.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo "Invalid method";
    exit;
}

$code_id = intval($_POST['code_id'] ?? 0);
if (!$code_id) {
    echo "Invalid code_id";
    exit;
}

// ลบ rules ก่อน
$conn->query("DELETE FROM discount_rules WHERE code_id=$code_id");

// ลบ code
if ($conn->query("DELETE FROM discount_codes WHERE code_id=$code_id")) {
    echo "success";
} else {
    echo $conn->error;
}
