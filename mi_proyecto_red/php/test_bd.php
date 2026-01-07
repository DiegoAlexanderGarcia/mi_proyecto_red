<?php
require_once "conexion.php";

echo "<h2>✅ Conexión OK</h2>";

$stmt = $pdo->query("SHOW TABLES");
$tables = $stmt->fetchAll();

echo "<pre>";
print_r($tables);
echo "</pre>";
