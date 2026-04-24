<?php
include "db.php";

$fullname = $_POST['fullname'];
$email = $_POST['email'];
$username = $_POST['username'];
$password = $_POST['password'];
$confirmPassword = $_POST['confirmPassword'];

if ($password !== $confirmPassword) {
    echo "password_mismatch";
    exit();
}

$check = $conn->prepare("SELECT id FROM users WHERE username = ?");
$check->bind_param("s", $username);
$check->execute();
$check->store_result();

if ($check->num_rows > 0) {
    echo "exists";
    exit();
}

// hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// insert user
$stmt = $conn->prepare("INSERT INTO users (fullname, email, username, password) VALUES (?, ?, ?, ?)");
$stmt->bind_param("ssss", $fullname, $email, $username, $hashedPassword);

if ($stmt->execute()) {
    echo "success";
} else {
    echo "error: " . $conn->error;
}
?>