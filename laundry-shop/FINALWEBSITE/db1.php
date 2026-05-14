<?php
$host = "localhost";
$user = "root";
$password = "";
$database = "admin_db";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode([
        "success" => false,
        "message" => "Database connection failed",
        "error" => $conn->connect_error
    ]));
}

$conn->set_charset("utf8mb4");

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
?>