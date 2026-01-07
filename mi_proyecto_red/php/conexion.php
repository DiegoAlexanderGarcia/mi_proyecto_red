<?php
// php/conexion.php

$host = getenv('DB_HOST') ?: '127.0.0.1';

// IMPORTANTE: en XAMPP el puerto típico es 3306.
// Si tu MySQL está realmente en 3307, lo dejamos en 3307.
$port = getenv('DB_PORT') ?: '3307';

$db   = getenv('DB_NAME') ?: 'unilibre_red';
$user = getenv('DB_USER') ?: 'root';
$pass = getenv('DB_PASS') ?: '';
$charset = 'utf8mb4';

$dsn = "mysql:host={$host};port={$port};dbname={$db};charset={$charset}";

$options = [
  PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
  PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
  PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
  $pdo = new PDO($dsn, $user, $pass, $options);
} catch (PDOException $e) {
  http_response_code(500);
  // Si abres esto desde navegador, se verá el error.
  die("Error de conexión a BD: " . $e->getMessage());
}
