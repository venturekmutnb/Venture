<?php
require "../../database.php";
header('Content-Type: application/json');

$packages = [];
$sql = "SELECT * FROM package ORDER BY created_at DESC";
$res = $conn->query($sql);
if (!$res) {
    echo json_encode(["error"=>$conn->error]);
    exit;
}

while ($p = $res->fetch_assoc()) {
  $pid = $p['package_id'];

  // plans
  $plans = [];
  $ps = $conn->query("SELECT * FROM package_plan WHERE package_id = '$pid' ORDER BY day_number");
  if ($ps) {
      while ($r = $ps->fetch_assoc()) $plans[] = $r;
  }

  // promotions
  $proms = [];
  $pp = $conn->query("SELECT pr.* FROM promotion pr 
                      JOIN package_promotion pp ON pr.promo_id=pp.promo_id 
                      WHERE pp.package_id='$pid'");
  if ($pp) {
      while ($r = $pp->fetch_assoc()) $proms[] = $r;
  }

  $p['plans'] = $plans;
  $p['promotions'] = $proms;
  $packages[] = $p;
}

echo json_encode($packages);
