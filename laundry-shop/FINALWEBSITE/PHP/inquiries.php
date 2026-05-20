<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$host   = 'localhost';
$dbname = 'admin_db';
$user   = 'root';       
$pass   = '';           

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'DB connection failed: ' . $e->getMessage()]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];

// ── GET: fetch all inquiries ──────────────────────────────
if ($method === 'GET') {
    $stmt = $pdo->query('SELECT * FROM inquiries ORDER BY created_at DESC');
    echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
    exit();
}

// ── POST: save new inquiry ────────────────────────────────
if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);

    $full_name = trim($data['full_name'] ?? '');
    $email     = trim($data['email']     ?? '');
    $contact   = trim($data['contact']   ?? '');
    $message   = trim($data['message']   ?? '');

    if (!$full_name || !$email || !$contact || !$message) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit();
    }

    $stmt = $pdo->prepare(
        'INSERT INTO inquiries (full_name, email, contact, message, created_at)
         VALUES (:full_name, :email, :contact, :message, NOW())'
    );
    $stmt->execute([
        ':full_name' => $full_name,
        ':email'     => $email,
        ':contact'   => $contact,
        ':message'   => $message,
    ]);

    echo json_encode(['success' => true, 'id' => $pdo->lastInsertId()]);
    exit();
}

// ── DELETE: remove inquiry by id ──────────────────────────
if ($method === 'DELETE') {
    $data = json_decode(file_get_contents('php://input'), true);
    $id   = intval($data['id'] ?? 0);

    if (!$id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid ID.']);
        exit();
    }

    $stmt = $pdo->prepare('DELETE FROM inquiries WHERE id = :id');
    $stmt->execute([':id' => $id]);

    echo json_encode(['success' => true]);
    exit();
}

http_response_code(405);
echo json_encode(['success' => false, 'error' => 'Method not allowed']);