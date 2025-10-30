<?php
require "../../database.php";

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit("Invalid method");
}

$code = $_POST['code'] ?? '';
$discount_percent = floatval($_POST['discount_percent'] ?? 0);
$start_date = $_POST['start_date'] ?: null;
$end_date = $_POST['end_date'] ?: null;
$rulesJson = $_POST['rules'] ?? '[]';

if (!$code || $discount_percent <= 0) {
    exit("Invalid input");
}

// insert code
$stmt = $conn->prepare("INSERT INTO discount_codes (code, discount_percent, start_date, end_date) VALUES (?,?,?,?)");
$stmt->bind_param("sdss", $code, $discount_percent, $start_date, $end_date);
if (!$stmt->execute()) {
    exit($stmt->error);
}
$code_id = $stmt->insert_id;

// insert rules
$types = $_POST['rule_type'] ?? [];
$values = $_POST['rule_value'] ?? [];

if(is_array($types) && is_array($values)){
    $rstmt = $conn->prepare("INSERT INTO discount_rules (code_id, rule_type, rule_value) VALUES (?,?,?)");
    for($i=0; $i<count($types); $i++){
        $type = $types[$i] ?? '';
        $value = $values[$i] ?? '';
        if($type !== ''){
            $rstmt->bind_param("iss", $code_id, $type, $value);
            $rstmt->execute();
        }
    }
}


echo "success";
