<?php
header('Content-Type: application/json');
require_once "conexion.php"; // crea $pdo

$id_zona = isset($_GET['id_zona']) ? (int)$_GET['id_zona'] : 0;

if (!$id_zona) {
    echo json_encode(["success" => false, "message" => "Falta id_zona"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
    SELECT id_switch, codigo_switch, nombre, ubicacion, numero_serie, mac, id_zona
    FROM `switch`
    WHERE id_zona = ?
    ORDER BY id_switch DESC
    ");
    $stmt->execute([$id_zona]);

    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode(["success" => true, "data" => $data]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
