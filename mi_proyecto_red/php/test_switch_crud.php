<?php
require_once "conexion.php";

echo "<h2>Prueba CRUD switches</h2>";

/* INSERT */
$stmt = $pdo->prepare("INSERT INTO switches (nombre, ubicacion, serie, mac, id_zona) VALUES (?,?,?,?,?)");
$stmt->execute(["SW_TEST", "LAB", "SERIE_TEST", "AA:BB:CC:DD:EE", 18]);
$id = (int)$pdo->lastInsertId();

echo "<p>✅ Insert OK. ID = {$id}</p>";

/* UPDATE */
$stmt = $pdo->prepare("UPDATE switches SET ubicacion=? WHERE id_switch=?");
$stmt->execute(["LAB_EDITADO", $id]);
echo "<p>✅ Update OK</p>";

/* SELECT */
$stmt = $pdo->prepare("SELECT * FROM switches WHERE id_switch=?");
$stmt->execute([$id]);
$row = $stmt->fetch();

echo "<p>✅ Select OK:</p>";
echo "<pre>";
print_r($row);
echo "</pre>";

/* DELETE */
$stmt = $pdo->prepare("DELETE FROM switches WHERE id_switch=?");
$stmt->execute([$id]);
echo "<p>✅ Delete OK</p>";
