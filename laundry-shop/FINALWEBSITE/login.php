<?php
session_start();
include "db.php";

$username = $_POST['username'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE username = ?");
$stmt->bind_param("s", $username);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {

        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];

        echo json_encode([
            "status" => "success",
            "role" => $user["role"]
        ]);

    } else {
        echo json_encode(["status" => "wrong_password"]);
    }

} else {
    echo json_encode(["status" => "not_found"]);
}
?>