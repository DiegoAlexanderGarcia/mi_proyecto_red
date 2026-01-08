<?php
// php/procesar_datos.php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0);

function respond($payload, $code = 200) {
    http_response_code($code);
    echo json_encode($payload);
    exit;
}

require_once __DIR__ . '/conexion.php'; // crea $pdo

$raw = file_get_contents('php://input');
$data = json_decode($raw, true);

if (!is_array($data)) {
    respond(['success' => false, 'message' => 'JSON inválido. Debe ser un arreglo de puntos.'], 400);
}

// Detectar columnas reales de la tabla para evitar errores si tu esquema cambia
try {
    $cols = [];
    $stmtCols = $pdo->query("SHOW COLUMNS FROM punto_red");
    foreach ($stmtCols->fetchAll(PDO::FETCH_ASSOC) as $row) {
        $cols[$row['Field']] = true;
    }
} catch (Exception $e) {
    respond(['success' => false, 'message' => 'No se pudo leer el esquema de punto_red: ' . $e->getMessage()], 500);
}

function hascol($name) {
    global $cols;
    return isset($cols[$name]);
}

// Helpers
function norm_equipos($v) {
    if (is_array($v)) return implode(', ', $v);
    if (is_string($v)) return $v;
    return '';
}

try {
    $pdo->beginTransaction();

    $resumen = [
        'insertados' => 0,
        'actualizados' => 0
    ];

    foreach ($data as $item) {
        if (!is_array($item)) continue;

        $accion = strtoupper(trim($item['accion'] ?? 'INSERT'));
        $id_punto = isset($item['id_punto']) && $item['id_punto'] !== '' ? (int)$item['id_punto'] : null;
        $id_punto_codigo = trim((string)($item['id_punto_codigo'] ?? ''));
        $id_zona = isset($item['id_zona']) ? (int)$item['id_zona'] : 0;

        if (!$id_punto_codigo || !$id_zona) {
            throw new Exception("Faltan campos obligatorios (id_punto_codigo, id_zona).");
        }

        $usuario = (string)($item['usuario'] ?? '');
        $puesto = (string)($item['puesto'] ?? '');
        $estado = (string)($item['estado'] ?? '');
        $equipos = norm_equipos($item['equipos_conectados'] ?? '');
        $patch_panel = (string)($item['patch_panel'] ?? '');
        $switch_asociado = (string)($item['switch_asociado'] ?? '');
        $centro_cableado = (string)($item['centro_cableado'] ?? '');
        $observaciones = (string)($item['observaciones'] ?? '');

        
// Resolver id_switch (conexión punto -> switch)
$id_switch = null;

// 1) Si viene id_switch numérico desde el frontend, usarlo.
if (hascol('id_switch') && isset($item['id_switch']) && $item['id_switch'] !== '' && $item['id_switch'] !== null) {
    $id_switch = (int)$item['id_switch'];
}

// 2) Compatibilidad: si no viene id_switch pero viene switch_asociado (texto),
// intentar resolverlo por codigo_switch.
if (hascol('id_switch') && $id_switch === null && $switch_asociado !== '') {
    $stmtSw = $pdo->prepare("SELECT id_switch FROM `switch` WHERE codigo_switch = ? LIMIT 1");
    $stmtSw->execute([$switch_asociado]);
    $rowSw = $stmtSw->fetch(PDO::FETCH_ASSOC);
    if ($rowSw) $id_switch = (int)$rowSw['id_switch'];
}
        // Si piden UPDATE pero no viene id_punto, lo resolvemos por (id_punto_codigo, id_zona)
        if ($accion === 'UPDATE' && !$id_punto) {
            $stmtFind = $pdo->prepare("SELECT id_punto FROM punto_red WHERE id_punto_codigo = ? AND id_zona = ? LIMIT 1");
            $stmtFind->execute([$id_punto_codigo, $id_zona]);
            $found = $stmtFind->fetch(PDO::FETCH_ASSOC);
            if ($found) $id_punto = (int)$found['id_punto'];
            else $accion = 'INSERT';
        }

        if ($accion === 'UPDATE' && $id_punto) {
            $sets = [];
            $vals = [];

            $map = [
                'id_punto_codigo' => $id_punto_codigo,
                'usuario' => $usuario,
                'puesto' => $puesto,
                'estado' => $estado,
                'equipos_conectados' => $equipos,
                'patch_panel' => $patch_panel,
                'switch_asociado' => $switch_asociado,
                'centro_cableado' => $centro_cableado,
                'observaciones' => $observaciones,
                'id_zona' => $id_zona
            ];

            foreach ($map as $k => $v) {
                if (hascol($k)) {
                    $sets[] = "{$k} = ?";
                    $vals[] = $v;
                }
            }
            if (hascol('id_switch')) {
                $sets[] = "id_switch = ?";
                $vals[] = $id_switch;
            }

            $vals[] = $id_punto;
            $sql = "UPDATE punto_red SET " . implode(', ', $sets) . " WHERE id_punto = ?";
            $stmtUp = $pdo->prepare($sql);
            $stmtUp->execute($vals);

            $resumen['actualizados']++;
        } else {
            // INSERT (si ya existe el punto por codigo+zona, hacemos UPDATE para evitar duplicados)
            $stmtFind = $pdo->prepare("SELECT id_punto FROM punto_red WHERE id_punto_codigo = ? AND id_zona = ? LIMIT 1");
            $stmtFind->execute([$id_punto_codigo, $id_zona]);
            $found = $stmtFind->fetch(PDO::FETCH_ASSOC);

            if ($found) {
                $id_punto = (int)$found['id_punto'];

                $sets = [];
                $vals = [];

                $map = [
                    'usuario' => $usuario,
                    'puesto' => $puesto,
                    'estado' => $estado,
                    'equipos_conectados' => $equipos,
                    'patch_panel' => $patch_panel,
                    'switch_asociado' => $switch_asociado,
                    'centro_cableado' => $centro_cableado,
                    'observaciones' => $observaciones
                ];

                foreach ($map as $k => $v) {
                    if (hascol($k)) {
                        $sets[] = "{$k} = ?";
                        $vals[] = $v;
                    }
                }
                if (hascol('id_switch')) {
                    $sets[] = "id_switch = ?";
                    $vals[] = $id_switch;
                }

                $vals[] = $id_punto;
                $sql = "UPDATE punto_red SET " . implode(', ', $sets) . " WHERE id_punto = ?";
                $stmtUp2 = $pdo->prepare($sql);
                $stmtUp2->execute($vals);

                $resumen['actualizados']++;
            } else {
                $fields = [];
                $place = [];
                $vals = [];

                $map = [
                    'id_punto_codigo' => $id_punto_codigo,
                    'usuario' => $usuario,
                    'puesto' => $puesto,
                    'estado' => $estado,
                    'equipos_conectados' => $equipos,
                    'patch_panel' => $patch_panel,
                    'switch_asociado' => $switch_asociado,
                    'centro_cableado' => $centro_cableado,
                    'observaciones' => $observaciones,
                    'id_zona' => $id_zona
                ];

                foreach ($map as $k => $v) {
                    if (hascol($k)) {
                        $fields[] = $k;
                        $place[] = '?';
                        $vals[] = $v;
                    }
                }
                if (hascol('id_switch')) {
                    $fields[] = 'id_switch';
                    $place[] = '?';
                    $vals[] = $id_switch;
                }

                $sql = "INSERT INTO punto_red (" . implode(',', $fields) . ") VALUES (" . implode(',', $place) . ")";
                $stmtIn = $pdo->prepare($sql);
                $stmtIn->execute($vals);

                $resumen['insertados']++;
            }
        }
    }

    $pdo->commit();
    respond(['success' => true, 'message' => 'Guardado OK', 'resumen' => $resumen]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) $pdo->rollBack();
    respond(['success' => false, 'message' => $e->getMessage()], 500);
}
?>
