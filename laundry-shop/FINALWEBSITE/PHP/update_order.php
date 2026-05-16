<?php
include '../db.php';

$data = json_decode(file_get_contents('php://input'), true);

$id = (int)$data['id'];
$status = $data['status'];
$month = isset($data['month']) ? (int)$data['month'] : null;

if ($month !== null) {
    $stmt = $conn->prepare("UPDATE orders SET status = ?, month = ? WHERE id = ?");
    $stmt->bind_param("sii", $status, $month, $id);
} else {
    $stmt = $conn->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->bind_param("si", $status, $id);
}

if ($stmt->execute()) {
    echo json_encode(["success" => true]);
} else {
    echo json_encode(["success" => false, "error" => $stmt->error]);
}
?>