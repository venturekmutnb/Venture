<?php
require "../../../database.php";

//ตรวจสอบว่า user ใหม่หรือไม่ (ภายใน $daysLimit วัน)
function isNewUser($userId, $conn, $daysLimit = 7) {
    $stmt = $conn->prepare("SELECT created_at FROM account WHERE acc_id = ?");
    $stmt->bind_param("i", $userId);
    $stmt->execute();
    $stmt->bind_result($created_at);
    if ($stmt->fetch()) {
        $created = new DateTime($created_at);
        $now = new DateTime();
        $interval = $now->diff($created);
        return $interval->days <= $daysLimit;
    }
    return false;
}

//ตรวจสอบว่า user เคยใช้ code นี้หรือยัง
function canUseCode($userId, $codeId, $conn) {
    $stmt = $conn->prepare("SELECT COUNT(*) FROM discount_usage WHERE acc_id = ? AND code_id = ?");
    $stmt->bind_param("ii", $userId, $codeId);
    $stmt->execute();
    $stmt->bind_result($count);
    $stmt->fetch();
    return $count == 0;
}

//ตรวจสอบว่า discount code ใช้ได้หรือไม่

function checkDiscountCode($userId, $codeInput, $packagePrice, $conn) {
    // ดึงข้อมูล code
    $stmt = $conn->prepare("SELECT * FROM discount_codes WHERE code = ?");
    $stmt->bind_param("s", $codeInput);
    $stmt->execute();
    $result = $stmt->get_result();
    if ($result->num_rows === 0) return ['ok'=>false,'msg'=>'Code ไม่ถูกต้อง'];

    $code = $result->fetch_assoc();

    // ตรวจสอบวันที่
    $today = new DateTime();
    if (($code['start_date'] && $today < new DateTime($code['start_date'])) ||
        ($code['end_date'] && $today > new DateTime($code['end_date']))) {
        return ['ok'=>false,'msg'=>'Code หมดอายุ'];
    }

    // ดึง rules
    $rstmt = $conn->prepare("SELECT * FROM discount_rules WHERE code_id = ?");
    $rstmt->bind_param("i", $code['code_id']);
    $rstmt->execute();
    $rules = $rstmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // ตรวจสอบ rules ทีละตัว(ก็คือ rule ทั้งหมดที่มี)
    foreach ($rules as $rule) {
        switch ($rule['rule_type']) {
            case 'user_new_days':
                $daysLimit = intval($rule['rule_value']);
                if (!isNewUser($userId, $conn, $daysLimit)) {
                    return ['ok'=>false,'msg'=>"สำหรับ user ใหม่เท่านั้น"];
                }
                break;
            case 'first_order_only':
                if (!canUseCode($userId, $code['code_id'], $conn)) {
                    return ['ok'=>false,'msg'=>"ใช้ได้ครั้งเดียวเท่านั้น"];
                }
                break;
            case 'min_price':
                $minPrice = floatval($rule['rule_value']);
                if ($packagePrice < $minPrice) {
                    return ['ok'=>false,'msg'=>"ยอดซื้อขั้นต่ำ $minPrice"];
                }
                break;
            default:
                //แล้วแต่ปอนด์จะเพิ่ม rule อะไรมา
                break;
        }
    }

    // ผ่านทุก rule → ใช้ได้
    return ['ok'=>true, 'code'=>$code];
}

//บันทึกการใช้ discount code

function markDiscountUsed($userId, $codeId, $conn) {
    $stmt = $conn->prepare("INSERT INTO discount_usage (acc_id, code_id) VALUES (?,?)");
    $stmt->bind_param("ii", $userId, $codeId);
    $stmt->execute();
}

