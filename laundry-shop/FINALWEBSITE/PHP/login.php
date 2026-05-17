<?php
session_start();
header("Content-Type: application/json");

$conn = new mysqli("localhost", "root", "", "laundry_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "db_error"]);
    exit();
}

$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';

$sql = "SELECT * FROM users WHERE username = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $username);
$stmt->execute();

$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {

        // session (optional but good)
        $_SESSION['user_id'] = $user['id'];

        echo json_encode([
            "status" => "success",
            "id" => $user['id'],
            "fullname" => $user['fullname'],
            "username" => $user['username'],
            "email" => $user['email'],
            "contact" => $user['contact'] ?? "",
            "address" => $user['address'] ?? "",
            "role" => $user['role'] ?? "customer"
        ]);

    } else {
        echo json_encode(["status" => "wrong_password"]);
    }

} else {
    echo json_encode(["status" => "not_found"]);
}

$stmt->close();
$conn->close();
?>