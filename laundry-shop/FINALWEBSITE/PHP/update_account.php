<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "not_logged_in"]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "laundry_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "db_error", "message" => $conn->connect_error]);
    exit();
}

$body    = file_get_contents("php://input");
$payload = json_decode($body, true);

if (!$payload) {
    echo json_encode(["status" => "error", "message" => "Invalid JSON payload."]);
    exit();
}

$user_id = $_SESSION['user_id'];

// ── PASSWORD CHANGE ────────────────────────────────────────────────────────
if (isset($payload['change_password'])) {
    $current_pw = $payload['current_password'] ?? '';
    $new_pw     = $payload['new_password']     ?? '';
    $confirm_pw = $payload['confirm_password'] ?? '';

    if (empty($current_pw) || empty($new_pw) || empty($confirm_pw)) {
        echo json_encode(["status" => "error", "message" => "All password fields are required."]);
        exit();
    }

    if ($new_pw !== $confirm_pw) {
        echo json_encode(["status" => "error", "message" => "New passwords do not match."]);
        exit();
    }

    if (strlen($new_pw) < 6) {
        echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters."]);
        exit();
    }

    $stmt = $conn->prepare("SELECT password FROM users WHERE id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $row = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$row || !password_verify($current_pw, $row['password'])) {
        echo json_encode(["status" => "error", "message" => "Current password is incorrect."]);
        exit();
    }

    $new_hash = password_hash($new_pw, PASSWORD_BCRYPT);
    $stmt = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
    $stmt->bind_param("si", $new_hash, $user_id);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "Password updated successfully."]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update password."]);
    }

    $stmt->close();
    $conn->close();
    exit();
}

// ── PROFILE UPDATE ─────────────────────────────────────────────────────────
$fullname = trim($payload['name']     ?? '');
$email    = trim($payload['email']    ?? '');
$contact  = trim($payload['contact']  ?? '');
$address  = trim($payload['address']  ?? '');
$username = trim($payload['username'] ?? '');

if (empty($fullname) || empty($email)) {
    echo json_encode(["status" => "error", "message" => "Full name and email are required."]);
    exit();
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format."]);
    exit();
}

// Check username uniqueness
if (!empty($username)) {
    $check = $conn->prepare("SELECT id FROM users WHERE username = ? AND id != ?");
    $check->bind_param("si", $username, $user_id);
    $check->execute();
    $check->store_result();
    if ($check->num_rows > 0) {
        echo json_encode(["status" => "error", "message" => "Username is already taken."]);
        exit();
    }
    $check->close();
}

// Add columns if they don't exist yet
$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS contact VARCHAR(20)");
$conn->query("ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT");

$stmt = $conn->prepare(
    "UPDATE users SET fullname = ?, email = ?, contact = ?, address = ?, username = ? WHERE id = ?"
);
$stmt->bind_param("sssssi", $fullname, $email, $contact, $address, $username, $user_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Profile updated successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Update failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>