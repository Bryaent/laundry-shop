<?php
header("Content-Type: application/json");

include "db.php";

$fullname = $_POST['fullname'] ?? '';
$email = $_POST['email'] ?? '';
$username = $_POST['username'] ?? '';
$password = $_POST['password'] ?? '';
$confirmPassword = $_POST['confirmPassword'] ?? '';

if (!$fullname || !$email || !$username || !$password || !$confirmPassword) {
    echo json_encode([
        "status" => "error",
        "message" => "Missing fields"
    ]);
    exit();
}

if ($password !== $confirmPassword) {
    echo json_encode([
        "status" => "password_mismatch"
    ]);
    exit();
}

$check = $conn->prepare("SELECT id FROM users WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo json_encode([
        "status" => "exists"
    ]);
    exit();
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

$role = "customer";

$stmt = $conn->prepare(
    "INSERT INTO users (fullname, email, username, password, role)
     VALUES (?, ?, ?, ?, ?)"
);

$stmt->bind_param(
    "sssss",
    $fullname,
    $email,
    $username,
    $hashedPassword,
    $role
);

if ($stmt->execute()) {

    echo json_encode([
        "status" => "success"
    ]);

} else {

    echo json_encode([
        "status" => "error",
        "message" => $conn->error
    ]);

}
?>