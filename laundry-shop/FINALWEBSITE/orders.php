<?php
header("Content-Type: application/json");
$conn = new mysqli("localhost", "root", "", "admin_db");

if ($conn->connect_error) {
    die(json_encode(["error" => "DB Connection failed"]));
}

$method = $_SERVER['REQUEST_METHOD'];

/* ================= GET ================= */
if ($method === "GET") {
    $result = $conn->query("SELECT * FROM orders");
    $orders = [];

    while ($row = $result->fetch_assoc()) {
        $orders[] = $row;
    }

    echo json_encode($orders);
}

/* ================= INSERT ================= */
if ($method === "POST") {

    $data = json_decode(file_get_contents("php://input"), true);

    $sql = "INSERT INTO orders 
    (ticket, name, contact, address, service, soap, fabcon, pickup, payment, kg, quantity, amount, status, pickupType, pickupTime)
    VALUES 
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "sssssssssiidsss",
        $data["ticket"],
        $data["name"],
        $data["contact"],
        $data["address"],
        $data["service"],
        $data["soap"],
        $data["fabcon"],
        $data["pickup"],
        $data["payment"],
        $data["kg"],
        $data["quantity"],
        $data["amount"],
        $data["status"],
        $data["pickupType"],
        $data["pickupTime"]
    );

    $stmt->execute();

    echo json_encode(["success" => true]);
}

/* ================= UPDATE STATUS ================= */
if ($method === "PUT") {

    $data = json_decode(file_get_contents("php://input"), true);

    $sql = "UPDATE orders SET status=? WHERE id=?";
    $stmt = $conn->prepare($sql);

    $stmt->bind_param(
        "si",
        $data["status"],
        $data["id"]
    );

    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Updated"]);
}

/* ================= DELETE ================= */
if ($method === "DELETE") {

    $data = json_decode(file_get_contents("php://input"), true);

    $sql = "DELETE FROM orders WHERE id=?";
    $stmt = $conn->prepare($sql);

    $stmt->bind_param("i", $data["id"]);
    $stmt->execute();

    echo json_encode(["success" => true, "message" => "Deleted"]);
}
?>