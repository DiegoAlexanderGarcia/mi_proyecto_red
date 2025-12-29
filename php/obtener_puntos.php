<?php
// obtener_puntos.php

header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function json_error($message) {
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

try {
    require_once 'conexion.php';
} catch (Exception $e) {
    json_error('Error al incluir la conexión: ' . $e->getMessage());
}

$sql = "SELECT 
    id_punto, 
    id_punto_codigo, 
    usuario, 
    puesto, 
    estado, 
    equipos_conectados, 
    patch_panel, 
    switch_asociado, 
    centro_cableado, 
    observaciones, 
    id_zona
FROM punto_red
ORDER BY id_punto DESC";

try {
    $stmt = $pdo->query($sql);
    $puntos = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => $puntos
    ]);

} catch (PDOException $e) {
    json_error("Error al ejecutar SELECT: " . $e->getMessage());
}
?>
