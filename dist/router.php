<?php
// Optional local PHP router for Vite's /api proxy. Production uses Apache rewrite rules.
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
if (strpos($path, '/api/') === 0) {
    require __DIR__ . '/api/index.php';
    exit();
}
return false;
