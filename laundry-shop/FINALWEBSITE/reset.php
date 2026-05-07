<?php
include "db.php";

$newPassword = password_hash("admin123", PASSWORD_DEFAULT);

$stmt = $conn->prepare("UPDATE users SET password = ? WHERE username = 'admin'");
$stmt->bind_param("s", $newPassword);

if ($stmt->execute()) {
    echo "Password reset success";
} else {
    echo "Error";
}
?>