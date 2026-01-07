<?php
header('Content-Type: application/json');
require_once "conexion.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos vacíos o JSON inválido"]);
    exit;
}

$accion = $data["accion"] ?? "guardar";

try {

    // ELIMINAR SWITCH
    if ($accion === "eliminar_switch") {
        $id_switch = (int)($data["id_switch"] ?? 0);
        if (!$id_switch) throw new Exception("Falta id_switch");

        $stmt = $pdo->prepare("DELETE FROM `switch` WHERE id_switch = ?");
        $stmt->execute([$id_switch]);

        echo json_encode(["success" => true]);
        exit;
    }

    // GUARDAR / ACTUALIZAR SWITCH
    $id_switch     = $data["id_switch"] ?? null;
    $codigo_switch = $data["codigo_switch"] ?? null;
    $nombre        = $data["nombre"] ?? "Sin Asignar";
    $ubicacion     = $data["ubicacion"] ?? "N/A";
    $numero_serie  = $data["numero_serie"] ?? ($data["serie"] ?? "N/A"); // por compatibilidad
    $mac           = $data["mac"] ?? "N/A";
    $id_zona       = (int)($data["id_zona"] ?? 0);

    if (!$id_zona) throw new Exception("Falta id_zona");

    if ($id_switch) {
        $id_switch = (int)$id_switch;

        $stmt = $pdo->prepare("
        UPDATE `switch`
        SET codigo_switch=?, nombre=?, ubicacion=?, numero_serie=?, mac=?, id_zona=?
        WHERE id_switch=?
    ");
        $stmt->execute([$codigo_switch, $nombre, $ubicacion, $numero_serie, $mac, $id_zona, $id_switch]);

        echo json_encode(["success" => true, "id_switch" => $id_switch]);
        exit;
    }

    // INSERT
    $stmt = $pdo->prepare("
    INSERT INTO `switch` (codigo_switch, nombre, ubicacion, numero_serie, mac, id_zona)
    VALUES (?,?,?,?,?,?)
    ");
    $stmt->execute([$codigo_switch, $nombre, $ubicacion, $numero_serie, $mac, $id_zona]);

    echo json_encode(["success" => true, "id_switch" => (int)$pdo->lastInsertId()]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
