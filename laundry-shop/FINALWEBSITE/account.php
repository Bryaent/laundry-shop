<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode([
        "status" => "not_logged_in"
    ]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "laundry_db");

if ($conn->connect_error) {
    echo json_encode([
        "status" => "db_error"
    ]);
    exit();
}

$user_id = $_SESSION['user_id'];

$sql = "SELECT fullname, email, password FROM users WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $user_id);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    echo json_encode([
        "status" => "success",
        "fullname" => $user['fullname'],
        "email" => $user['email'],
        "password" => $user['password']
    ]);
} else {
    echo json_encode([
        "status" => "user_not_found"
    ]);
}

$stmt->close();
$conn->close();
?>