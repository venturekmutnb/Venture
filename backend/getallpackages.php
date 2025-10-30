<?php
require "database.php";
header('Content-Type: application/json');

$packages = [];
$sql = "SELECT * FROM package ORDER BY travel_date ASC";
$res = $conn->query($sql);
while ($p = $res->fetch_assoc()) {
    $pid = $p['package_id'];

    $proms = [];
    $pp = $conn->query("SELECT pr.name, pr.discount_percent 
                        FROM promotion pr 
                        JOIN package_promotion pp ON pr.promo_id=pp.promo_id 
                        WHERE pp.package_id='$pid'");
    while ($r = $pp->fetch_assoc()) $proms[] = $r;
    $p['promotions'] = $proms;

    $packages[] = $p;
}

echo json_encode($packages);
