<?php
require_once "conexion.php";

header('Content-Type: application/json');

try {
    $stmt = $pdo->prepare("
        INSERT INTO switches (nombre, ubicacion, serie, mac, id_zona)
        VALUES (?,?,?,?,?)
    ");

    $stmt->execute([
        "WS_PRUEBA",
        "SISTEMAS",
        "SERIE1",
        "AA:BB:CC:DD:EE",
        18
    ]);

    $id_switch = (int)$pdo->lastInsertId();

    $stmtP = $pdo->prepare("
        INSERT INTO puertos_switch
        (id_switch, numero_puerto, nombre, localizacion, observaciones)
        VALUES (?,?,?,?,?)
    ");

    $stmtP->execute([$id_switch, 1, "PC1", "Mesa 1", "OK"]);
    $stmtP->execute([$id_switch, 2, "PC2", "Mesa 2", "OK"]);

    echo json_encode([
        "success" => true,
        "id_switch" => $id_switch
    ]);

} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
