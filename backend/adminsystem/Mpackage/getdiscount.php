<?php
require "../../database.php";

$res = $conn->query("SELECT * FROM discount_codes ORDER BY code_id DESC");
$codes = [];
while ($c = $res->fetch_assoc()) {
    $code_id = $c['code_id'];
    $rulesRes = $conn->query("SELECT rule_type, rule_value FROM discount_rules WHERE code_id=$code_id");
    $rules = [];
    while ($r = $rulesRes->fetch_assoc()) $rules[] = $r;
    $c['rules'] = $rules;
    $codes[] = $c;
}

header('Content-Type: application/json');
echo json_encode($codes);

