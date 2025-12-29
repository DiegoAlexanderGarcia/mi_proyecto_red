<?php
header('Content-Type: application/json');
require_once "conexion.php"; // crea $pdo

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    echo json_encode(["success" => false, "message" => "Datos vacíos o JSON inválido"]);
    exit;
}

$accion = $data["accion"] ?? "guardar";

try {
// ELIMINAR SWITCH COMPLETO
    if ($accion === "eliminar_switch") {
        $id_switch = (int)($data["id_switch"] ?? 0);
        if (!$id_switch) throw new Exception("Falta id_switch");

        $stmt = $pdo->prepare("DELETE FROM switches WHERE id_switch = ?");
        $stmt->execute([$id_switch]);

        echo json_encode(["success" => true]);
        exit;
    }

// ELIMINAR UN PUERTO
    if ($accion === "eliminar_puerto") {
        $id_switch = (int)($data["id_switch"] ?? 0);
        $numero = (int)($data["numero_puerto"] ?? 0);
        if (!$id_switch || !$numero) throw new Exception("Falta id_switch o numero_puerto");

        $stmt = $pdo->prepare("DELETE FROM puertos_switch WHERE id_switch = ? AND numero_puerto = ?");
        $stmt->execute([$id_switch, $numero]);

        echo json_encode(["success" => true]);
        exit;
    }

// GUARDAR / ACTUALIZAR SWITCH + PUERTOS
    $id_switch = $data["id_switch"] ?? null;

    $nombre = $data["nombre"] ?? "Sin Asignar";
    $ubicacion = $data["ubicacion"] ?? "N/A";
    $serie = $data["serie"] ?? "N/A";
    $mac = $data["mac"] ?? "N/A";
    $id_zona = (int)($data["id_zona"] ?? 0);
    $puertos = $data["puertos"] ?? [];

    if (!$id_zona) throw new Exception("Falta id_zona");

    $pdo->beginTransaction();

    if ($id_switch) {
        $id_switch = (int)$id_switch;

    $stmt = $pdo->prepare("
        UPDATE switches
        SET nombre=?, ubicacion=?, serie=?, mac=?, id_zona=?
        WHERE id_switch=?
        ");
    $stmt->execute([$nombre, $ubicacion, $serie, $mac, $id_zona, $id_switch]);

    // Reemplaza puertos (simple y consistente)
    $stmtDel = $pdo->prepare("DELETE FROM puertos_switch WHERE id_switch=?");
    $stmtDel->execute([$id_switch]);

    } else {
        $stmt = $pdo->prepare("
        INSERT INTO switches (nombre, ubicacion, serie, mac, id_zona)
        VALUES (?,?,?,?,?)
        ");
        $stmt->execute([$nombre, $ubicacion, $serie, $mac, $id_zona]);
        $id_switch = (int)$pdo->lastInsertId();
    }

    $stmtPuerto = $pdo->prepare("
        INSERT INTO puertos_switch
        (id_switch, numero_puerto, nombre, localizacion, observaciones)
        VALUES (?,?,?,?,?)
    ");

    foreach ($puertos as $p) {
        $stmtPuerto->execute([
        $id_switch,
        (int)($p["numero"] ?? 0),
        $p["nombre"] ?? "N/A",
        $p["localizacion"] ?? "N/A",
        $p["observaciones"] ?? "N/A"
        ]);
    }

    $pdo->commit();

    echo json_encode(["success" => true, "id_switch" => $id_switch]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    echo json_encode(["success" => false, "message" => $e->getMessage()]);
}
