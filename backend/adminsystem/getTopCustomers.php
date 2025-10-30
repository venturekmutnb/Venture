<?php
require '../database.php';
header('Content-Type: application/json');

$sql = "SELECT
    account.acc_id,
    account.username,
    account.email,
    COALESCE(SUM(transaction.total_price), 0) AS total_spent,
    COALESCE(MAX(loyalty_points.points), 0) AS total_points
FROM account
LEFT JOIN transaction
    ON account.acc_id = transaction.acc_id
    AND transaction.status = 'completed'
LEFT JOIN loyalty_points
    ON account.acc_id = loyalty_points.acc_id
GROUP BY account.acc_id, account.username, account.email
HAVING total_spent > 0
ORDER BY total_spent DESC, total_points DESC
LIMIT 5";

$result = $conn->query($sql);
$topCustomers = [];

while($row = $result->fetch_assoc()) {
    $topCustomers[] = $row;
}

echo json_encode($topCustomers);
$conn->close();
?>
