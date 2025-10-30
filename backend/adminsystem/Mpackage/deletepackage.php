<?php
require "../../database.php";
$id = $_GET['id'] ?? '';
if ($id === '') { echo "invalid"; exit; }

$stmt = $conn->prepare("DELETE FROM package WHERE package_id = ?");
$stmt->bind_param("s", $id); 
if ($stmt->execute()) echo "success"; else echo $stmt->error;
$stmt->close();
$conn->close();
