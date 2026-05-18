<?php
session_start();
header("Content-Type: application/json");

if (!isset($_SESSION['user_id'])) {
    echo json_encode(["status" => "not_logged_in"]);
    exit();
}

if (!isset($_FILES['profile_picture'])) {
    echo json_encode(["status" => "error", "message" => "No file uploaded."]);
    exit();
}

$file    = $_FILES['profile_picture'];
$allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
$maxSize = 3 * 1024 * 1024; // 3MB

if (!in_array($file['type'], $allowed)) {
    echo json_encode(["status" => "error", "message" => "Only JPG, PNG, GIF, and WEBP are allowed."]);
    exit();
}

if ($file['size'] > $maxSize) {
    echo json_encode(["status" => "error", "message" => "File must be under 3MB."]);
    exit();
}

$user_id   = $_SESSION['user_id'];
$ext       = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
$filename  = 'user_' . $user_id . '_' . time() . '.' . $ext;

// Absolute path on disk — PHP/upload_picture.php → go up one level to project root
$uploadDir = dirname(__DIR__) . '/uploads/profiles/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$destPath = $uploadDir . $filename;

// Root-relative URL path — works in the browser from any page
$publicPath = '/uploads/profiles/' . $filename;

if (!move_uploaded_file($file['tmp_name'], $destPath)) {
    echo json_encode(["status" => "error", "message" => "Failed to save file."]);
    exit();
}

$conn = new mysqli("localhost", "root", "", "laundry_db");

if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "DB connection failed."]);
    exit();
}

// Delete old profile picture file if it exists
$stmt = $conn->prepare("SELECT profile_picture FROM users WHERE id = ?");
$stmt->bind_param("i", $user_id);
$stmt->execute();
$old = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!empty($old['profile_picture'])) {
    // Convert root-relative URL back to absolute disk path
    $oldFile = dirname(__DIR__) . $old['profile_picture'];
    if (file_exists($oldFile)) {
        unlink($oldFile);
    }
}

// Save new path to DB
$stmt = $conn->prepare("UPDATE users SET profile_picture = ? WHERE id = ?");
$stmt->bind_param("si", $publicPath, $user_id);

if ($stmt->execute()) {
    echo json_encode([
        "status"  => "success",
        "message" => "Profile picture updated!",
        "path"    => $publicPath
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "DB update failed."]);
}

$stmt->close();
$conn->close();
?>