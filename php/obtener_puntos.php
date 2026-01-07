<?php
require "conexion.php";

$id_zona = isset($_GET["id_zona"]) ? intval($_GET["id_zona"]) : 0;

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
