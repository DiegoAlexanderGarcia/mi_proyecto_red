<?php
// php/procesar_switch.php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

require_once __DIR__ . '/conexion.php'; // crea $pdo

function respond($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

$raw = file_get_contents("php://input");
$data = json_decode($raw, true);

if (!is_array($data)) {
    respond(["success" => false, "message" => "JSON inválido"], 400);
}

$accion = $data["accion"] ?? "guardar";

try {
    // Eliminar switch
    if ($accion === "eliminar_switch") {
        $id_switch = (int)($data["id_switch"] ?? 0);
        if (!$id_switch) respond(["success" => false, "message" => "Falta id_switch"], 400);

        $stmt = $pdo->prepare("DELETE FROM `switch` WHERE id_switch = ?");
        $stmt->execute([$id_switch]);

        respond(["success" => true, "message" => "Switch eliminado"]);
    }

    // (Opcional) Eliminar puerto si existe tabla puertos_switch
    if ($accion === "eliminar_puerto") {
        $id_switch = (int)($data["id_switch"] ?? 0);
        $numero_puerto = (int)($data["numero_puerto"] ?? 0);
        if (!$id_switch || !$numero_puerto) respond(["success" => false, "message" => "Faltan parámetros"], 400);

        // Intentar borrar si existe tabla
        try {
            $pdo->query("SELECT 1 FROM puertos_switch LIMIT 1");
            $stmt = $pdo->prepare("DELETE FROM puertos_switch WHERE id_switch=? AND numero_puerto=?");
            $stmt->execute([$id_switch, $numero_puerto]);
            respond(["success" => true, "message" => "Puerto eliminado"]);
        } catch (Exception $e) {
            respond(["success" => false, "message" => "La tabla puertos_switch no existe o no está disponible."], 400);
        }
    }

    // Guardar / actualizar switch
    $id_switch = isset($data["id_switch"]) && $data["id_switch"] !== "" ? (int)$data["id_switch"] : 0;

    $codigo_switch = trim((string)($data["codigo_switch"] ?? ""));
    $nombre = trim((string)($data["nombre"] ?? ""));
    $ubicacion = trim((string)($data["ubicacion"] ?? ""));
    $numero_serie = trim((string)($data["numero_serie"] ?? ""));
    $mac = trim((string)($data["mac"] ?? ""));
    $id_zona = (int)($data["id_zona"] ?? 0);

    if ($codigo_switch === "" || !$id_zona) {
        respond(["success" => false, "message" => "Faltan campos obligatorios (codigo_switch, id_zona)"], 400);
    }

    // Si no viene id_switch, intentamos resolver por codigo_switch
    if (!$id_switch) {
        $stmtFind = $pdo->prepare("SELECT id_switch FROM `switch` WHERE codigo_switch=? AND id_zona=? LIMIT 1");
        $stmtFind->execute([$codigo_switch, $id_zona]);
        $found = $stmtFind->fetch(PDO::FETCH_ASSOC);
        if ($found) $id_switch = (int)$found["id_switch"];
    }

    if ($id_switch) {
        $stmt = $pdo->prepare("
            UPDATE `switch`
            SET codigo_switch=?, nombre=?, ubicacion=?, numero_serie=?, mac=?, id_zona=?
            WHERE id_switch=?
        ");
        $stmt->execute([$codigo_switch, $nombre, $ubicacion, $numero_serie, $mac, $id_zona, $id_switch]);

        respond(["success" => true, "id_switch" => $id_switch, "message" => "Switch actualizado"]);
    } else {
        $stmt = $pdo->prepare("
            INSERT INTO `switch` (codigo_switch, nombre, ubicacion, numero_serie, mac, id_zona)
            VALUES (?,?,?,?,?,?)
        ");
        $stmt->execute([$codigo_switch, $nombre, $ubicacion, $numero_serie, $mac, $id_zona]);

        respond(["success" => true, "id_switch" => (int)$pdo->lastInsertId(), "message" => "Switch creado"]);
    }

} catch (Exception $e) {
    respond(["success" => false, "message" => $e->getMessage()], 500);
}
?>
