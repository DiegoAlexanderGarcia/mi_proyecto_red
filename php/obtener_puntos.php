<?php
header('Content-Type: application/json');
require_once __DIR__ . '/conexion.php';

$id_zona = isset($_GET["id_zona"]) ? (int)$_GET["id_zona"] : 0;

if (!$id_zona) {
    echo json_encode(["success" => false, "message" => "Falta id_zona"]);
    exit;
}

try {
    $stmt = $pdo->prepare("
        SELECT pr.*,
               s.nombre AS switch_nombre,
               s.codigo_switch AS switch_codigo
        FROM punto_red pr
        LEFT JOIN `switch` s ON s.id_switch = pr.id_switch
        WHERE pr.id_zona = ?
    ");
    $stmt->execute([$id_zona]);

    echo json_encode(["success" => true, "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
?>
