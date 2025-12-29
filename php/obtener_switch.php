<?php
header('Content-Type: application/json');
require_once "conexion.php"; // crea $pdo

$id_zona = isset($_GET["id_zona"]) ? (int)$_GET["id_zona"] : 0;
if (!$id_zona) {
    echo json_encode(["success" => false, "message" => "Falta id_zona"]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT s.id_switch, s.nombre, s.ubicacion, s.serie, s.mac, s.id_zona,
            p.numero_puerto, p.nombre AS p_nombre, p.localizacion, p.observaciones
    FROM switches s
    LEFT JOIN puertos_switch p ON s.id_switch = p.id_switch
    WHERE s.id_zona = ?
    ORDER BY s.id_switch, p.numero_puerto
    ");
$stmt->execute([$id_zona]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

$switches = [];

foreach ($rows as $r) {
    $id = (int)$r["id_switch"];

    if (!isset($switches[$id])) {
        $switches[$id] = [
        "id_switch" => $id,
        "nombre" => $r["nombre"],
        "ubicacion" => $r["ubicacion"],
        "serie" => $r["serie"],
        "mac" => $r["mac"],
        "id_zona" => (int)$r["id_zona"],
        "puertos" => []
        ];
    }

    if (!empty($r["numero_puerto"])) {
        $switches[$id]["puertos"][] = [
        "numero" => (int)$r["numero_puerto"],
        "nombre" => $r["p_nombre"],
        "localizacion" => $r["localizacion"],
        "observaciones" => $r["observaciones"]
        ];
    }
}

echo json_encode(["success" => true, "data" => array_values($switches)]);
