<?php
// procesar_datos.php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

function json_error($message) {
    echo json_encode(['success' => false, 'message' => $message]);
    exit;
}

// 1. Conexión
try {
    require_once 'conexion.php';
} catch (Exception $e) {
    json_error('Error al incluir conexión: ' . $e->getMessage());
}

// 2. Recibir JSON
$json = file_get_contents("php://input");
$puntos = json_decode($json, true);

if (!$puntos || !is_array($puntos)) {
    json_error("Datos inválidos recibidos.");
}

// -------------------------------
// SENTENCIAS CRUD
// -------------------------------

// UPDATE usando id_punto (REAL)
$sql_update = "UPDATE punto_red SET 
    id_punto_codigo = :codigo,
    usuario = :usuario,
    puesto = :puesto,
    estado = :estado,
    equipos_conectados = :equipos,
    patch_panel = :ppanel,
    switch_asociado = :sw,
    centro_cableado = :centro,
    observaciones = :obs,
    id_zona = :zona
WHERE id_punto = :id_punto";

$stmt_update = $pdo->prepare($sql_update);

// INSERT
$sql_insert = "INSERT INTO punto_red (
    usuario, puesto, estado, equipos_conectados, id_punto_codigo,
    patch_panel, switch_asociado, centro_cableado, observaciones, id_zona
) VALUES (
    :usuario, :puesto, :estado, :equipos, :codigo,
    :ppanel, :sw, :centro, :obs, :zona
)";
$stmt_insert = $pdo->prepare($sql_insert);

// DELETE usando id_punto REAL
$sql_delete = "DELETE FROM punto_red WHERE id_punto = :id_punto";
$stmt_delete = $pdo->prepare($sql_delete);


// -------------------------------
// TRANSACCIÓN
// -------------------------------

try {
    $pdo->beginTransaction();

    $contador = ['UPDATE' => 0, 'INSERT' => 0, 'DELETE' => 0];

    foreach ($puntos as $p) {

        $accion = strtoupper($p["accion"] ?? "");

        switch ($accion) {

            case 'UPDATE':
                $stmt_update->execute([
                    ':codigo' => $p['id_punto_codigo'],
                    ':usuario' => $p['usuario'] ?? null,
                    ':puesto' => $p['puesto'] ?? null,
                    ':estado' => $p['estado'] ?? null,
                    ':equipos' => $p['equipos_conectados'] ?? null,
                    ':ppanel' => $p['patch_panel'] ?? null,
                    ':sw' => $p['switch_asociado'] ?? null,
                    ':centro' => $p['centro_cableado'] ?? null,
                    ':obs' => $p['observaciones'] ?? null,
                    ':zona' => $p['id_zona'] ?? 1,
                    ':id_punto' => $p['id_punto'] // ← ID REAL
                ]);
                $contador['UPDATE']++;
                break;

            case 'INSERT':
                $stmt_insert->execute([
                    ':usuario' => $p['usuario'] ?? null,
                    ':puesto' => $p['puesto'] ?? null,
                    ':estado' => $p['estado'] ?? null,
                    ':equipos' => $p['equipos_conectados'] ?? null,
                    ':codigo' => $p['id_punto_codigo'] ?? null,
                    ':ppanel' => $p['patch_panel'] ?? null,
                    ':sw' => $p['switch_asociado'] ?? null,
                    ':centro' => $p['centro_cableado'] ?? null,
                    ':obs' => $p['observaciones'] ?? null,
                    ':zona' => $p['id_zona'] ?? 1
                ]);
                $contador['INSERT']++;
                break;

            case 'DELETE':
                $stmt_delete->execute([
                    ':id_punto' => $p['id_punto']  // ← ID REAL
                ]);
                $contador['DELETE']++;
                break;

            default:
                throw new Exception("Acción no válida: " . $accion);
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Transacción exitosa',
        'resumen' => $contador
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    json_error("Error en transacción: " . $e->getMessage());
}
?>
