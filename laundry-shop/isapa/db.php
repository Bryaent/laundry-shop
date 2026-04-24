<?php
$conn = new mysqli("localhost", "root", "", "laundry_db");

if ($conn->connect_error) {
  die("DB Connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8");
?>