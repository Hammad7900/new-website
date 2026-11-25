<?php
/**
 * Hostinger PHP Backend for CJ Dropshipping API
 * Handles Hostinger PHP API routes for CJ products/orders, admin auth, and store settings.
 */

// Allow CORS from any origin
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, CJ-Access-Token, X-Admin-Password');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$configFile = __DIR__ . '/config.php';
$appConfig = is_file($configFile) ? (require $configFile) : [];
$CJ_API_KEY = getenv('CJ_API_KEY') ?: ($appConfig['cj_api_key'] ?? 'CJ5799036@api@68240b5fc55f4b8db42e75c858c29b05');
$ADMIN_PASSWORD = getenv('ADMIN_PASSWORD') ?: ($appConfig['admin_password'] ?? 'admin123');
$ADMIN_AUTH_DISABLED = true; // Temporary: admin routes are open until this is turned off.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

function sendJson($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

function loadStoreState() {
    $path = dirname(__DIR__) . '/.aura-store-data.json';
    $defaults = [
        'shippingCost' => 1.00,
        'shippingRules' => [
            'baseRate' => 1.0,
            'additionalItemRate' => 1.0,
            'tier1' => 1.0,
            'tier2' => 2.0,
            'tier3' => 3.0,
            'tier4' => 4.0,
            'tier5' => 5.0,
            'tier6' => 6.0,
            'tier7' => 7.0,
            'tier8' => 8.0,
            'tier9' => 9.0,
            'tier10' => 10.0,
            'tierBeyond10' => 1.0,
        ],
        'collections' => [
            ['id' => 'col-human-hair-wigs', 'name' => 'Human Hair Wigs', 'slug' => 'human-hair-wigs', 'description' => 'Raw Human Hair & HD Lace Wigs — 100% unprocessed, glueless wear & go.', 'image' => 'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-curly-wigs', 'name' => 'Curly Wigs', 'slug' => 'curly-wigs', 'description' => 'Couture Curly & Deep Wave Wigs — bouncy curls, invisible HD lace.', 'image' => 'https://images.unsplash.com/photo-1560869713-7d0a29430803?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-dresses', 'name' => 'Dresses', 'slug' => 'dresses', 'description' => 'Atelier Dresses & Evening Couture — from casual chic to full glamour.', 'image' => 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-bags', 'name' => 'Bags', 'slug' => 'bags', 'description' => 'Designer Handbags & Leather Goods — structured luxury for every occasion.', 'image' => 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-winter-wear', 'name' => 'Winter Wear', 'slug' => 'winter-wear', 'description' => 'Winter Cashmere & Luxury Coats — warmth wrapped in couture.', 'image' => 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-jewelry', 'name' => 'Jewelry', 'slug' => 'jewelry', 'description' => 'Fine Jewelry, Chains & Diamonds — pure gold accents and radiant pendants.', 'image' => 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-gym-wear', 'name' => 'Gym Wear', 'slug' => 'gym-wear', 'description' => 'Atelier Active & Luxury Gym Wear — performance meets premium fabric.', 'image' => 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80'],
            ['id' => 'col-watches', 'name' => 'Watches', 'slug' => 'watches', 'description' => 'Horology & Precision Watches — timeless movements, sapphire crystal.', 'image' => 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=800&q=80'],
        ],
        'adminPassword' => '',
        'adminMasterKey' => '',
        'adminAuthRequired' => false,
        'coupons' => [],
        'orders' => [],
        'products' => [],
        'contactEmail' => 'concierge@auraatelier.com',
        'contactPhone' => '+1 (800) AURA-LUX',
        'contactHours' => 'Mon–Fri, 9am–6pm EST',
        'inquiries' => [],
    ];
    if (!is_file($path)) return $defaults;
    $state = json_decode(@file_get_contents($path), true);
    return is_array($state) ? array_merge($defaults, $state) : $defaults;
}

function mapCjProductDetail($item, $productId, $price) {
    $price = round((float)$price, 2);
    $images = $item['productImageSet'] ?? [];
    if (is_string($images)) $images = json_decode($images, true) ?: [$images];
    if (!is_array($images)) $images = [];
    $images = array_values(array_filter($images, function($image) { return is_string($image) && $image !== ''; }));
    if (count($images) === 0 && !empty($item['bigImage'])) $images[] = $item['bigImage'];
    $variants = array_values(array_map(function($v) use ($price) {
        $inventory = array_sum(array_map(function($entry) { return (int)($entry['totalInventory'] ?? 0); }, $v['inventories'] ?? []));
        return [
            'vid' => $v['vid'] ?? '',
            'name' => $v['variantNameEn'] ?? $v['variantKeyEn'] ?? $v['variantKey'] ?? $v['variantName'] ?? ($v['variantSku'] ?? ''),
            'sku' => $v['variantSku'] ?? '',
            'price' => $price,
            'stock' => $inventory
        ];
    }, array_filter($item['variants'] ?? [], function($variant) { return !empty($variant['vid']); })));
    return [
        'id' => $item['pid'] ?? $productId,
        'name' => $item['productNameEn'] ?? $item['productName'] ?? '',
        'price' => $price,
        'compareAtPrice' => 0,
        'images' => $images,
        'description' => $item['description'] ?? '',
        'category' => $item['categoryName'] ?? '',
        'sku' => $item['productSku'] ?? '',
        'stock' => array_sum(array_column($variants, 'stock')),
        'rating' => 0,
        'reviewsCount' => 0,
        'variants' => $variants
    ];
}

function saveStoreState($changes) {
    $path = dirname(__DIR__) . '/.aura-store-data.json';
    $lock = fopen($path . '.lock', 'c');
    if (!$lock || !flock($lock, LOCK_EX)) throw new RuntimeException('Could not lock store settings.');
    $state = loadStoreState();
    $state = array_merge($state, $changes);
    $ok = file_put_contents($path, json_encode($state, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), LOCK_EX);
    flock($lock, LOCK_UN);
    fclose($lock);
    if ($ok === false) throw new RuntimeException('Could not write store settings. Check PHP folder permissions.');
    return $state;
}

function adminPasswordIsValid($expected) {
    $state = loadStoreState();
    if (empty($state['adminAuthRequired']) || empty($state['adminPassword'])) {
        return true;
    }
    $provided = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    return $provided !== '' && hash_equals((string)$state['adminPassword'], $provided);
}

// Robust HTTP POST helper with SSL compatibility for Hostinger
function sendJsonPost($url, $data, $headers = []) {
    if (!function_exists('curl_init')) {
        // Fallback to file_get_contents if curl is not installed
        $opts = [
            'http' => [
                'method' => 'POST',
                'header' => implode("\r\n", array_merge(['Content-Type: application/json'], $headers)),
                'content' => json_encode($data),
                'timeout' => 30,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ]
        ];
        $ctx = stream_context_create($opts);
        $res = @file_get_contents($url, false, $ctx);
        return $res ? json_decode($res, true) : null;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    $defaultHeaders = ['Content-Type: application/json'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    $response = curl_exec($ch);
    curl_close($ch);
        return is_string($response) ? json_decode($response, true) : null;
}

// Robust HTTP GET helper with SSL compatibility for Hostinger
function sendGet($url, $headers = []) {
    if (!function_exists('curl_init')) {
        $opts = [
            'http' => [
                'method' => 'GET',
                'header' => implode("\r\n", array_merge(['Content-Type: application/json'], $headers)),
                'timeout' => 30,
                'ignore_errors' => true,
            ],
            'ssl' => [
                'verify_peer' => true,
                'verify_peer_name' => true,
            ]
        ];
        $ctx = stream_context_create($opts);
        $res = @file_get_contents($url, false, $ctx);
        return $res ? json_decode($res, true) : null;
    }

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $defaultHeaders = ['Content-Type: application/json'];
    curl_setopt($ch, CURLOPT_HTTPHEADER, array_merge($defaultHeaders, $headers));
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
    $response = curl_exec($ch);
    curl_close($ch);
    return is_string($response) ? json_decode($response, true) : null;
}

// Access Token Getter with dual-location caching (temp dir or local dir)
function getAccessToken($apiKey) {
    if (!$apiKey) return null;
    $cacheId = hash('sha256', $apiKey);
    $tempFile = sys_get_temp_dir() . '/aura_cj_token_' . $cacheId . '.json';
    $localFile = __DIR__ . '/.cj_token_' . $cacheId . '.json';
    $cacheFile = is_writable(sys_get_temp_dir()) ? $tempFile : $localFile;

    if (file_exists($cacheFile)) {
        $cached = json_decode(@file_get_contents($cacheFile), true);
        if ($cached && isset($cached['token']) && isset($cached['expiry']) && time() < ($cached['expiry'] - 300)) {
            return $cached['token'];
        }
    }

    $res = sendJsonPost('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', [
        'apiKey' => $apiKey
    ]);

    if ($res && isset($res['code']) && $res['code'] === 200 && isset($res['data']['accessToken'])) {
        $token = $res['data']['accessToken'];
        $expiry = time() + (86400 * 15); // default 15 days
        @file_put_contents($cacheFile, json_encode(['token' => $token, 'expiry' => $expiry]));
        return $token;
    }

    return null;
}

if (str_ends_with($uri, '/admin-auth') || $endpoint === 'admin-auth') {
    $state = loadStoreState();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        sendJson(200, [
            'success' => true,
            'passwordRequired' => !empty($state['adminAuthRequired']),
            'hasPassword' => !empty($state['adminPassword']),
            'hasMasterKey' => !empty($state['adminMasterKey']),
        ]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(405, ['success' => false, 'error' => 'GET or POST required.']);
    
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $action = $body['action'] ?? '';

    // Set Initial Password & Master Security Key
    if ($action === 'set') {
        $newPass = trim((string)($body['newPassword'] ?? ''));
        $masterKey = trim((string)($body['masterKey'] ?? ''));
        $requireAuth = isset($body['requireAuth']) ? (bool)$body['requireAuth'] : true;

        $changes = [];
        if ($newPass !== '') $changes['adminPassword'] = $newPass;
        if ($masterKey !== '') $changes['adminMasterKey'] = $masterKey;
        $changes['adminAuthRequired'] = ($requireAuth && (!empty($newPass) || !empty($state['adminPassword'])));

        $saved = saveStoreState($changes);
        sendJson(200, [
            'success' => true,
            'message' => 'Admin security settings and Master Key configured.',
            'passwordRequired' => !empty($saved['adminAuthRequired']),
            'hasMasterKey' => !empty($saved['adminMasterKey']),
        ]);
    }

    // Change Password (PROTECTED by Master Security Key)
    if ($action === 'change') {
        if (!empty($state['adminMasterKey'])) {
            $providedKey = trim((string)($body['masterKey'] ?? ''));
            if ($providedKey === '' || !hash_equals((string)$state['adminMasterKey'], $providedKey)) {
                sendJson(403, [
                    'success' => false,
                    'error' => 'Unauthorized: Incorrect Master Security Key. Password change blocked.'
                ]);
            }
        } elseif (!empty($state['adminPassword'])) {
            $curr = (string)($body['currentPassword'] ?? '');
            if (!hash_equals((string)$state['adminPassword'], $curr)) {
                sendJson(401, ['success' => false, 'error' => 'Current password does not match.']);
            }
        }

        $newPass = trim((string)($body['newPassword'] ?? ''));
        $newMaster = trim((string)($body['newMasterKey'] ?? ''));
        $changes = [];
        if ($newPass !== '') $changes['adminPassword'] = $newPass;
        if ($newMaster !== '') $changes['adminMasterKey'] = $newMaster;
        if (isset($body['requireAuth'])) $changes['adminAuthRequired'] = (bool)$body['requireAuth'];

        $saved = saveStoreState($changes);
        sendJson(200, [
            'success' => true,
            'message' => 'Admin password updated securely with Master Security authorization.',
            'passwordRequired' => !empty($saved['adminAuthRequired']),
        ]);
    }

    if (empty($state['adminAuthRequired']) || empty($state['adminPassword'])) {
        sendJson(200, ['success' => true, 'passwordRequired' => false]);
    }

    $provided = (string)($body['password'] ?? '');
    if (!hash_equals((string)$state['adminPassword'], $provided)) {
        sendJson(401, ['success' => false, 'error' => 'Incorrect administrator password.']);
    }
    sendJson(200, ['success' => true]);
}

// Collections Endpoint
if (str_ends_with($uri, '/collections') || $endpoint === 'collections') {
    $state = loadStoreState();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        sendJson(200, ['success' => true, 'collections' => $state['collections'] ?? []]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $name = trim((string)($body['name'] ?? ''));
        $slug = trim((string)($body['slug'] ?? ''));
        if ($slug === '' && $name !== '') {
            $slug = strtolower(preg_replace('/[^a-zA-Z0-9]+/', '-', $name));
        }
        $desc = trim((string)($body['description'] ?? ''));
        $image = trim((string)($body['image'] ?? ''));

        if ($name === '' || $slug === '') {
            sendJson(400, ['success' => false, 'error' => 'Collection name and slug are required.']);
        }

        $cols = $state['collections'] ?? [];
        $id = !empty($body['id']) ? $body['id'] : ('col-' . uniqid());
        $found = false;
        foreach ($cols as &$c) {
            if (($c['id'] ?? '') === $id || ($c['slug'] ?? '') === $slug) {
                $c['name'] = $name;
                $c['slug'] = $slug;
                $c['description'] = $desc;
                if ($image !== '' || isset($body['image'])) {
                    $c['image'] = $image;
                }
                $found = true;
                break;
            }
        }
        if (!$found) {
            $cols[] = ['id' => $id, 'name' => $name, 'slug' => $slug, 'description' => $desc, 'image' => $image];
        }
        $saved = saveStoreState(['collections' => $cols]);
        sendJson(200, ['success' => true, 'collections' => $saved['collections']]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = trim((string)($_GET['id'] ?? ''));
        $slug = trim((string)($_GET['slug'] ?? ''));
        $cols = array_values(array_filter($state['collections'] ?? [], function($c) use ($id, $slug) {
            return ($c['id'] ?? '') !== $id && ($c['slug'] ?? '') !== $slug;
        }));
        $saved = saveStoreState(['collections' => $cols]);
        sendJson(200, ['success' => true, 'collections' => $saved['collections']]);
    }

    sendJson(405, ['success' => false, 'error' => 'GET, POST, or DELETE required.']);
}

// The public storefront reads only products explicitly listed by the admin.
if (str_ends_with($uri, '/store-products') || $endpoint === 'store-products') {
    $state = loadStoreState();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $products = array_values($state['products']);
        $id = trim((string)($_GET['id'] ?? ''));
        if ($id !== '') $products = array_values(array_filter($products, function($product) use ($id) { return (string)($product['id'] ?? '') === $id; }));
        $search = strtolower(trim((string)($_GET['search'] ?? '')));
        $category = strtolower(trim((string)($_GET['category'] ?? '')));
        $collection = strtolower(trim((string)($_GET['collection'] ?? '')));
        if ($search !== '') $products = array_values(array_filter($products, function($product) use ($search) { return strpos(strtolower(($product['name'] ?? '') . ' ' . ($product['sku'] ?? '')), $search) !== false; }));
        if ($category !== '' && $category !== 'all') $products = array_values(array_filter($products, function($product) use ($category) { return strpos(strtolower($product['category'] ?? ''), $category) !== false; }));
        if ($collection !== '' && $collection !== 'all') $products = array_values(array_filter($products, function($product) use ($collection) {
            return strtolower($product['collectionSlug'] ?? '') === $collection || strpos(strtolower($product['category'] ?? ''), $collection) !== false;
        }));
        sendJson(200, ['success' => true, 'data' => $products, 'total' => count($products), 'source' => 'admin_listed_products']);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $productId = trim((string)($body['id'] ?? ''));
        if ($productId === '') sendJson(400, ['success' => false, 'error' => 'Product ID is required.']);

        $updatedProduct = null;
        $products = $state['products'] ?? [];
        foreach ($products as &$p) {
            if ((string)($p['id'] ?? '') === $productId) {
                if (isset($body['collectionSlug'])) $p['collectionSlug'] = trim((string)$body['collectionSlug']);
                if (isset($body['price']) && is_numeric($body['price']) && (float)$body['price'] >= 0) $p['price'] = round((float)$body['price'], 2);
                if (!empty($body['name'])) $p['name'] = trim((string)$body['name']);
                $updatedProduct = $p;
                break;
            }
        }
        if (!$updatedProduct) sendJson(404, ['success' => false, 'error' => 'Product not found.']);
        saveStoreState(['products' => $products]);
        sendJson(200, ['success' => true, 'product' => $updatedProduct]);
    }

    if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $productId = trim((string)($body['id'] ?? ''));
        $price = filter_var($body['price'] ?? null, FILTER_VALIDATE_FLOAT);
        if ($productId === '' || $price === false || $price < 0 || $price > 1000000) sendJson(400, ['success' => false, 'error' => 'Enter a valid CJ product ID and selling price.']);
        $token = getAccessToken($CJ_API_KEY);
        if (!$token) sendJson(503, ['success' => false, 'error' => 'CJ authentication failed. Check the server-side CJ_API_KEY.']);
        $detailRes = sendGet('https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=' . urlencode($productId), ['CJ-Access-Token: ' . $token]);
        $detail = $detailRes['data'] ?? null;
        if (!$detail || (int)($detailRes['code'] ?? 0) !== 200) sendJson(502, ['success' => false, 'error' => $detailRes['message'] ?? 'CJ product details could not be loaded.']);
        $product = mapCjProductDetail($detail, $productId, $price);
        if ($product['name'] === '' || count($product['variants']) === 0) sendJson(422, ['success' => false, 'error' => 'CJ did not return a product name and orderable variants.']);
        $state['products'] = array_values(array_filter($state['products'], function($saved) use ($productId) { return (string)($saved['id'] ?? '') !== $productId; }));
        $product['listedAt'] = gmdate('c');
        $state = saveStoreState(['products' => array_merge($state['products'], [$product])]);
        sendJson(200, ['success' => true, 'product' => $product]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $id = trim((string)($_GET['id'] ?? ''));
        if ($id === '') sendJson(400, ['success' => false, 'error' => 'Product ID is required.']);
        $products = array_values(array_filter($state['products'], function($product) use ($id) { return (string)($product['id'] ?? '') !== $id; }));
        $state = saveStoreState(['products' => $products]);
        sendJson(200, ['success' => true, 'data' => $products]);
    }
    sendJson(405, ['success' => false, 'error' => 'GET, POST, PATCH, or DELETE required.']);
}

if (str_ends_with($uri, '/store-settings') || $endpoint === 'store-settings') {
    $state = loadStoreState();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        sendJson(200, [
            'success' => true,
            'shippingCost' => (float)($state['shippingCost'] ?? 1.00),
            'shippingRules' => $state['shippingRules'] ?? [
                'baseRate' => 1.0,
                'additionalItemRate' => 1.0,
                'tier1' => 1.0,
                'tier2' => 2.0,
                'tier3' => 3.0,
                'tier4' => 4.0,
                'tier5' => 5.0,
                'tier6' => 6.0,
                'tier7' => 7.0,
                'tier8' => 8.0,
                'tier9' => 9.0,
                'tier10' => 10.0,
                'tierBeyond10' => 1.0,
            ],
            'adminAuthRequired' => !empty($state['adminAuthRequired']),
            'hasPassword' => !empty($state['adminPassword']),
            'contactEmail' => $state['contactEmail'] ?? 'concierge@auraatelier.com',
            'contactPhone' => $state['contactPhone'] ?? '+1 (800) AURA-LUX',
            'contactHours' => $state['contactHours'] ?? 'Mon–Fri, 9am–6pm EST',
        ]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(405, ['success' => false, 'error' => 'GET or POST required.']);
    
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $changes = [];

    if (isset($body['shippingCost'])) {
        $amount = filter_var($body['shippingCost'], FILTER_VALIDATE_FLOAT);
        if ($amount !== false && $amount >= 0) {
            $changes['shippingCost'] = round($amount, 2);
        }
    }
    if (isset($body['shippingRules']) && is_array($body['shippingRules'])) {
        $sr = $body['shippingRules'];
        $changes['shippingRules'] = [
            'baseRate' => (float)($sr['baseRate'] ?? 1.0),
            'additionalItemRate' => (float)($sr['additionalItemRate'] ?? 1.0),
            'tier1' => (float)($sr['tier1'] ?? $sr['baseRate'] ?? 1.0),
            'tier2' => (float)($sr['tier2'] ?? 2.0),
            'tier3' => (float)($sr['tier3'] ?? 3.0),
            'tier4' => (float)($sr['tier4'] ?? 4.0),
            'tier5' => (float)($sr['tier5'] ?? 5.0),
            'tier6' => (float)($sr['tier6'] ?? 6.0),
            'tier7' => (float)($sr['tier7'] ?? 7.0),
            'tier8' => (float)($sr['tier8'] ?? 8.0),
            'tier9' => (float)($sr['tier9'] ?? 9.0),
            'tier10' => (float)($sr['tier10'] ?? 10.0),
            'tierBeyond10' => (float)($sr['tierBeyond10'] ?? 1.0),
        ];
    }
    if (isset($body['adminAuthRequired'])) {
        $changes['adminAuthRequired'] = (bool)$body['adminAuthRequired'];
    }
    if (isset($body['adminPassword'])) {
        $changes['adminPassword'] = trim((string)$body['adminPassword']);
    }
    if (isset($body['contactEmail'])) {
        $changes['contactEmail'] = trim((string)$body['contactEmail']);
    }
    if (isset($body['contactPhone'])) {
        $changes['contactPhone'] = trim((string)$body['contactPhone']);
    }
    if (isset($body['contactHours'])) {
        $changes['contactHours'] = trim((string)$body['contactHours']);
    }

    try {
        $saved = saveStoreState($changes);
        sendJson(200, [
            'success' => true,
            'shippingCost' => (float)$saved['shippingCost'],
            'shippingRules' => $saved['shippingRules'],
            'adminAuthRequired' => (bool)$saved['adminAuthRequired'],
            'contactEmail' => $saved['contactEmail'] ?? 'concierge@auraatelier.com',
            'contactPhone' => $saved['contactPhone'] ?? '+1 (800) AURA-LUX',
            'contactHours' => $saved['contactHours'] ?? 'Mon–Fri, 9am–6pm EST',
        ]);
    } catch (Throwable $error) {
        sendJson(500, ['success' => false, 'error' => $error->getMessage()]);
    }
}

// Route: /api/inquiries
if (str_ends_with($uri, '/inquiries') || $endpoint === 'inquiries') {
    $state = loadStoreState();

    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!adminPasswordIsValid($ADMIN_PASSWORD)) {
            sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
        }
        sendJson(200, ['success' => true, 'inquiries' => $state['inquiries'] ?? []]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $name = trim($body['name'] ?? '');
        $email = trim($body['email'] ?? '');
        $subject = trim($body['subject'] ?? 'General Inquiry');
        $message = trim($body['message'] ?? '');

        if (!$name || !$email || !$message) {
            sendJson(400, ['success' => false, 'error' => 'Name, email, and message are required.']);
        }

        $inquiry = [
            'id' => 'inq_' . uniqid(),
            'name' => $name,
            'email' => $email,
            'subject' => $subject,
            'message' => $message,
            'date' => date('c'),
            'status' => 'new',
        ];

        $currentInquiries = $state['inquiries'] ?? [];
        $updatedInquiries = array_merge([$inquiry], $currentInquiries);
        saveStoreState(['inquiries' => $updatedInquiries]);

        // Email notification to the configured store email
        $recipient = $state['contactEmail'] ?? '';
        if ($recipient && filter_var($recipient, FILTER_VALIDATE_EMAIL)) {
            $headers = "From: noreply@" . ($_SERVER['HTTP_HOST'] ?? 'store.com') . "\r\n";
            $headers .= "Reply-To: {$email}\r\n";
            $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
            $mailSubject = "New Client Inquiry from {$name}: {$subject}";
            $mailBody = "You received a new inquiry on your store:\n\nName: {$name}\nEmail: {$email}\nSubject: {$subject}\n\nMessage:\n{$message}\n\nDate: " . date('Y-m-d H:i:s');
            @mail($recipient, $mailSubject, $mailBody, $headers);
        }

        sendJson(201, ['success' => true, 'message' => 'Inquiry submitted successfully.', 'inquiry' => $inquiry]);
    }

    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        if (!adminPasswordIsValid($ADMIN_PASSWORD)) {
            sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
        }
        $id = $_GET['id'] ?? '';
        if (!$id) sendJson(400, ['success' => false, 'error' => 'Inquiry ID required.']);
        $currentInquiries = $state['inquiries'] ?? [];
        $filtered = array_values(array_filter($currentInquiries, function($inq) use ($id) {
            return ($inq['id'] ?? '') !== $id;
        }));
        saveStoreState(['inquiries' => $filtered]);
        sendJson(200, ['success' => true, 'inquiries' => $filtered]);
    }

    sendJson(405, ['success' => false, 'error' => 'GET, POST, or DELETE required.']);
}

if (str_ends_with($uri, '/coupons')) {
    if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
    $state = loadStoreState();
    if ($_SERVER['REQUEST_METHOD'] === 'GET') sendJson(200, ['success' => true, 'coupons' => $state['coupons']]);
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $code = strtoupper(trim((string)($body['code'] ?? '')));
        $type = $body['type'] ?? '';
        $value = filter_var($body['value'] ?? null, FILTER_VALIDATE_FLOAT);
        $expiry = trim((string)($body['expiry'] ?? ''));
        if (!preg_match('/^[A-Z0-9_-]{2,20}$/', $code) || !in_array($type, ['percentage', 'fixed'], true) || $value === false || $value <= 0 || ($type === 'percentage' && $value > 100) || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $expiry)) {
            sendJson(400, ['success' => false, 'error' => 'Enter a valid code, discount, type, and expiry date.']);
        }
        foreach ($state['coupons'] as $coupon) if (strtoupper($coupon['code'] ?? '') === $code) sendJson(409, ['success' => false, 'error' => 'A coupon with this code already exists.']);
        $coupon = ['code' => $code, 'type' => $type, 'value' => (float)$value, 'expiry' => $expiry, 'createdAt' => gmdate('c')];
        $state = saveStoreState(['coupons' => array_merge($state['coupons'], [$coupon])]);
        sendJson(200, ['success' => true, 'coupons' => $state['coupons']]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
        $code = strtoupper(trim((string)($_GET['code'] ?? '')));
        $coupons = array_values(array_filter($state['coupons'], function($coupon) use ($code) { return strtoupper($coupon['code'] ?? '') !== $code; }));
        $state = saveStoreState(['coupons' => $coupons]);
        sendJson(200, ['success' => true, 'coupons' => $state['coupons']]);
    }
    sendJson(405, ['success' => false, 'error' => 'GET, POST, or DELETE required.']);
}

if (str_ends_with($uri, '/coupon-validate') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $code = strtoupper(trim((string)($body['code'] ?? '')));
    $subtotal = max(0, (float)($body['subtotal'] ?? 0));
    $state = loadStoreState();
    $coupon = null;
    foreach ($state['coupons'] as $stored) if (strtoupper($stored['code'] ?? '') === $code) { $coupon = $stored; break; }
    if (!$coupon) sendJson(200, ['success' => false, 'error' => 'Invalid coupon code.']);
    if (strtotime(($coupon['expiry'] ?? '') . ' 23:59:59 UTC') < time()) sendJson(200, ['success' => false, 'error' => 'This coupon has expired.']);
    $discount = ($coupon['type'] ?? '') === 'percentage' ? round($subtotal * ((float)$coupon['value']) / 100, 2) : min($subtotal, (float)$coupon['value']);
    sendJson(200, ['success' => true, 'coupon' => $coupon, 'discount' => $discount]);
}

if (str_ends_with($uri, '/orders')) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
        $state = loadStoreState();
        sendJson(200, ['success' => true, 'orders' => $state['orders']]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $customer = $body['customer'] ?? [];
        $address = $body['shippingAddress'] ?? [];
        $items = $body['items'] ?? [];
        if (empty($customer['name']) || empty($customer['email']) || empty($address['street']) || empty($address['city']) || empty($address['country']) || !is_array($items) || count($items) === 0) {
            sendJson(400, ['success' => false, 'error' => 'Customer, shipping details, and order items are required.']);
        }
        foreach ($items as $item) {
            if (empty($item['vid']) || (int)($item['quantity'] ?? 0) < 1) sendJson(400, ['success' => false, 'error' => 'Each order item needs a CJ variant and positive quantity.']);
        }
        $state = loadStoreState();
        $catalogById = [];
        foreach ($state['products'] as $product) $catalogById[(string)($product['id'] ?? '')] = $product;
        $verifiedItems = [];
        $subtotal = 0.0;
        $shipping = (float)$state['shippingCost'];
        foreach ($items as $item) {
            $product = $catalogById[(string)($item['id'] ?? '')] ?? null;
            $quantity = (int)($item['quantity'] ?? 0);
            $variant = null;
            if ($product) foreach (($product['variants'] ?? []) as $savedVariant) if ((string)($savedVariant['vid'] ?? '') === (string)($item['vid'] ?? '')) { $variant = $savedVariant; break; }
            if (!$product || !$variant || $quantity < 1 || $quantity > 99) sendJson(400, ['success' => false, 'error' => 'One or more cart products are no longer listed. Refresh your cart and try again.']);
            $unitPrice = (float)$product['price'];
            $subtotal += $unitPrice * $quantity;
            $verifiedItems[] = [
                'id' => $product['id'], 'name' => $product['name'], 'sku' => $variant['sku'] ?? $product['sku'],
                'vid' => $variant['vid'], 'variant' => $variant['name'] ?? '', 'price' => $unitPrice,
                'quantity' => $quantity, 'image' => $product['images'][0] ?? ''
            ];
        }
        $couponCode = strtoupper(trim((string)($body['couponCode'] ?? '')));
        $discount = 0.0;
        if ($couponCode !== '') {
            foreach ($state['coupons'] as $savedCoupon) {
                if (strtoupper($savedCoupon['code'] ?? '') === $couponCode && strtotime(($savedCoupon['expiry'] ?? '') . ' 23:59:59 UTC') >= time()) {
                    $discount = ($savedCoupon['type'] ?? '') === 'percentage'
                        ? round($subtotal * ((float)$savedCoupon['value']) / 100, 2)
                        : min($subtotal, (float)$savedCoupon['value']);
                    break;
                }
            }
        }
        $order = [
            'id' => 'ORD-' . strtoupper(bin2hex(random_bytes(5))),
            'createdAt' => gmdate('c'),
            'status' => 'PAYMENT_REVIEW',
            'customer' => $customer,
            'shippingAddress' => $address,
            'items' => $verifiedItems,
            'subtotal' => round($subtotal, 2),
            'shipping' => $shipping,
            'discountAmount' => $discount,
            'total' => round(max(0, $subtotal - $discount) + $shipping, 2),
            'couponCode' => $couponCode ?: null,
            'paymentMethod' => $body['paymentMethod'] ?? 'Whop (awaiting manual verification)',
        ];
        $state = saveStoreState(['orders' => array_merge([$order], $state['orders'])]);
        sendJson(201, ['success' => true, 'order' => $order]);
    }
    if ($_SERVER['REQUEST_METHOD'] === 'PATCH') {
        if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
        $body = json_decode(file_get_contents('php://input'), true) ?: [];
        $allowed = ['PAYMENT_REVIEW', 'PAID', 'PLACED_ON_CJ', 'DISPATCHED'];
        if (empty($body['id']) || !in_array($body['status'] ?? '', $allowed, true)) sendJson(400, ['success' => false, 'error' => 'Invalid order status update.']);
        $state = loadStoreState();
        $found = false;
        foreach ($state['orders'] as &$order) {
            if ($order['id'] === $body['id']) {
                $order['status'] = $body['status'];
                if (!empty($body['cjOrderId'])) $order['cjOrderId'] = $body['cjOrderId'];
                $found = true;
                break;
            }
        }
        unset($order);
        if (!$found) sendJson(404, ['success' => false, 'error' => 'Order not found.']);
        $state = saveStoreState(['orders' => $state['orders']]);
        sendJson(200, ['success' => true, 'orders' => $state['orders']]);
    }
    sendJson(405, ['success' => false, 'error' => 'GET, POST, or PATCH required.']);
}

// Route: /api/create-whop-checkout (Dynamic live checkout for exact order amount)
if (strpos($uri, 'create-whop-checkout') !== false || $endpoint === 'create-whop-checkout') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        sendJson(405, ['success' => false, 'error' => 'POST required.']);
    }

    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $amount = isset($body['amount']) ? (float)$body['amount'] : 0.0;
    if ($amount <= 0) {
        sendJson(400, ['success' => false, 'error' => 'Valid positive amount required.']);
    }

    // Official Whop credentials
    $whopApiKey = 'apik_J6aTnjsiggCFX_C8592368_C_58defc2d1f80a9c074d06c70a72fc4f60922cad7677484572e601ca96bef97';
    $accountId = 'biz_0DSMZeYhX5GeRy';
    $productId = 'prod_8lUVRU6hM1Bdo';

    $orderId = !empty($body['orderId']) ? trim($body['orderId']) : ('ORD-' . time());
    $customerEmail = !empty($body['customerEmail']) ? trim($body['customerEmail']) : '';
    $customerName = !empty($body['customerName']) ? trim($body['customerName']) : '';

    $ch = curl_init('https://api.whop.com/api/v1/plans');
    $payload = json_encode([
        'account_id' => $accountId,
        'product_id' => $productId,
        'initial_price' => round($amount, 2),
        'currency' => 'usd',
        'billing_type' => 'one_time',
        'release_method' => 'buy_now',
        'visibility' => 'hidden',
        'internal_notes' => 'Store Order ' . $orderId,
        'metadata' => [
            'order_id' => $orderId,
            'customer_email' => $customerEmail,
            'customer_name' => $customerName,
        ],
    ]);

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . $whopApiKey,
        'Content-Type: application/json',
        'Content-Length: ' . strlen($payload)
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    $resData = json_decode($response, true) ?: [];
    if ($httpCode >= 200 && $httpCode < 300 && !empty($resData['purchase_url'])) {
        sendJson(200, [
            'success' => true,
            'checkoutUrl' => $resData['purchase_url'],
            'planId' => $resData['id'] ?? null,
            'amount' => round($amount, 2),
        ]);
    } else {
        // Fallback to primary plan if API fails
        sendJson(200, [
            'success' => true,
            'checkoutUrl' => 'https://whop.com/checkout/plan_Nw9OfcyHAA0zJ',
            'amount' => round($amount, 2),
            'warning' => 'Fallback link generated'
        ]);
    }
}

// Route: /api/cj-products
if (strpos($uri, 'cj-products') !== false || $endpoint === 'cj-products') {
    if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required to browse the CJ catalog.']);
    $token = getAccessToken($CJ_API_KEY);
    if (!$token) {
        sendJson(503, ['success' => false, 'error' => $CJ_API_KEY === '' ? 'CJ API key is missing. Set cj_api_key in api/config.php or CJ_API_KEY on the PHP server.' : 'CJ authentication failed. Verify the API key in CJ Authorization > API.']);
    }

    $pageNum = isset($_GET['pageNum']) ? (int)$_GET['pageNum'] : 1;
    $pageSize = isset($_GET['pageSize']) ? (int)$_GET['pageSize'] : 20;
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $category = isset($_GET['category']) ? trim($_GET['category']) : '';
    $productId = isset($_GET['id']) ? trim($_GET['id']) : '';

    // If querying single product
    if ($productId) {
        $detailRes = sendGet('https://developers.cjdropshipping.com/api2.0/v1/product/query?pid=' . urlencode($productId), [
            'CJ-Access-Token: ' . $token
        ]);
        if ($detailRes && isset($detailRes['data'])) {
            $item = $detailRes['data'];
            $retailPrice = 0;
            $comparePrice = 0;

            $mappedSingle = [
                'id' => $item['pid'] ?? $productId,
                'name' => $item['productNameEn'] ?? $item['productName'] ?? '',
                'price' => $retailPrice,
                'compareAtPrice' => $comparePrice,
                'images' => !empty($item['productImageSet']) ? $item['productImageSet'] : [$item['bigImage'] ?? ''],
                'description' => $item['description'] ?? '',
                'category' => $item['categoryName'] ?? '',
                'sku' => $item['productSku'] ?? '',
                'stock' => 0,
                'rating' => 0,
                'reviewsCount' => 0,
                'variants' => array_values(array_map(function($v) use ($retailPrice) {
                    $inventory = array_sum(array_map(function($inventory) {
                        return (int)($inventory['totalInventory'] ?? 0);
                    }, $v['inventories'] ?? []));
                    return [
                        'vid' => $v['vid'] ?? '',
                        'name' => $v['variantNameEn'] ?? $v['variantKeyEn'] ?? $v['variantKey'] ?? $v['variantName'] ?? ($v['variantSku'] ?? ''),
                        'sku' => $v['variantSku'] ?? '',
                        'price' => $retailPrice,
                        'stock' => $inventory
                    ];
                }, array_filter($item['variants'] ?? [], function($variant) { return !empty($variant['vid']); })))
            ];

            echo json_encode(['success' => true, 'data' => [$mappedSingle], 'source' => 'cj_live_php_detail']);
            exit();
        }
        sendJson(404, ['success' => false, 'error' => $detailRes['message'] ?? 'CJ product was not found.']);
    }

    $keyword = $search ?: ($category && $category !== 'All' ? $category : '');
    $cjUrl = 'https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=' . max(1, $pageNum) . '&size=' . min(100, max(1, $pageSize));
    if ($keyword) {
        $cjUrl .= '&keyWord=' . urlencode($keyword);
    }

    $listRes = sendGet($cjUrl, ['CJ-Access-Token: ' . $token]);
    if (!$listRes || (int)($listRes['code'] ?? 0) !== 200) {
        sendJson(502, ['success' => false, 'error' => $listRes['message'] ?? 'CJ product search failed.', 'requestId' => $listRes['requestId'] ?? null]);
    }
    $rawList = $listRes['data']['content'][0]['productList'] ?? $listRes['data']['list'] ?? $listRes['data']['productList'] ?? [];

    $mapped = [];
    foreach (is_array($rawList) ? $rawList : [] as $p) {
        $productIdFromCJ = $p['id'] ?? $p['pid'] ?? '';
        $productNameFromCJ = trim((string)($p['nameEn'] ?? $p['productNameEn'] ?? ''));
        if ($productIdFromCJ === '' || $productNameFromCJ === '') continue;
        $retail = 0;
        $compare = 0;
        $mapped[] = [
            'id' => $productIdFromCJ,
            'name' => $productNameFromCJ,
            'price' => $retail,
            'compareAtPrice' => $compare,
            'images' => array_values(array_filter([$p['bigImage'] ?? $p['productImage'] ?? ''])),
            'description' => $p['description'] ?? '',
            'category' => $p['threeCategoryName'] ?? $p['twoCategoryName'] ?? '',
            'sku' => $p['sku'] ?? '',
            'stock' => isset($p['warehouseInventoryNum']) ? (int)$p['warehouseInventoryNum'] : null,
            'rating' => 0,
            'reviewsCount' => 0,
            'variants' => []
        ];
    }

    echo json_encode([
        'success' => true,
        'data' => $mapped,
        'total' => count($mapped),
        'source' => 'cj_live_php_api'
    ]);
    exit();
}

// Route: /api/cj-order
if ((strpos($uri, 'cj-order') !== false || $endpoint === 'cj-order') && $_SERVER['REQUEST_METHOD'] === 'POST') {
    if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
    $token = getAccessToken($CJ_API_KEY);
    $payload = json_decode(file_get_contents('php://input'), true) ?: [];

    $customer = $payload['customer'] ?? [];
    $address = $payload['shippingAddress'] ?? [];
    $items = $payload['items'] ?? [];
    if (!$token) sendJson(503, ['success' => false, 'error' => 'CJ authentication failed. Check server credentials.']);
    $state = loadStoreState();
    $storedOrder = null;
    foreach ($state['orders'] as $savedOrder) if (($savedOrder['id'] ?? '') === ($payload['orderId'] ?? '')) { $storedOrder = $savedOrder; break; }
    if (!$storedOrder || ($storedOrder['status'] ?? '') !== 'PAID') sendJson(409, ['success' => false, 'error' => 'Order must be saved and payment verified before dispatch.']);
    if (empty($customer['name']) || empty($customer['phone']) || empty($address['street']) || empty($address['city']) || empty($address['country']) || empty($address['zip']) || !is_array($items) || count($items) === 0) {
        sendJson(400, ['success' => false, 'error' => 'Complete shipping details and at least one product are required.']);
    }
    foreach ($items as $item) {
        if (empty($item['vid']) || (int)($item['quantity'] ?? 0) < 1) {
            sendJson(400, ['success' => false, 'error' => 'Every order item needs a valid CJ variant ID and quantity.']);
        }
    }

    // CJ requires an available logistics name. Quote from CJ using the variant IDs,
    // then pass the cheapest available method unchanged to createOrderV2.
    $freightRes = sendJsonPost('https://developers.cjdropshipping.com/api2.0/v1/logistic/freightCalculate', [
        'startCountryCode' => strtoupper($appConfig['cj_start_country_code'] ?? 'CN'),
        'endCountryCode' => strtoupper($address['countryCode'] ?? ''),
        'zip' => $address['zip'],
        'products' => array_map(function($it) { return ['vid' => $it['vid'], 'quantity' => (int)$it['quantity']]; }, $items)
    ], ['CJ-Access-Token: ' . $token]);
    $freightOptions = $freightRes['data'] ?? [];
    if (empty($freightRes['result']) || !is_array($freightOptions) || count($freightOptions) === 0) {
        sendJson(502, ['success' => false, 'error' => $freightRes['message'] ?? 'CJ has no shipping method for this destination.', 'requestId' => $freightRes['requestId'] ?? null]);
    }
    usort($freightOptions, function($a, $b) { return (float)($a['logisticPrice'] ?? INF) <=> (float)($b['logisticPrice'] ?? INF); });
    $logisticName = $freightOptions[0]['logisticName'] ?? '';
    if ($logisticName === '') sendJson(502, ['success' => false, 'error' => 'CJ freight quote did not include a shipping method.']);

    $orderPayload = [
        'orderNumber' => $payload['orderId'] ?? ('ORD-' . time()),
        'shippingZip' => $address['zip'],
        'shippingCountryCode' => $address['countryCode'] ?? 'US',
        'shippingCountry' => $address['country'],
        'logisticName' => $logisticName,
        'shippingProvince' => $address['state'] ?? '',
        'shippingCity' => $address['city'],
        'shippingAddress' => $address['street'],
        'shippingCustomerName' => $customer['name'],
        'shippingPhone' => $customer['phone'],
        'payType' => 3, // Create order only
        'products' => array_map(function($it) {
            return [
                'vid' => $it['vid'],
                'sku' => $it['sku'] ?? '',
                'quantity' => (int)$it['quantity']
            ];
        }, $items)
    ];

    if ($token) {
        $cjOrderRes = sendJsonPost('https://developers.cjdropshipping.com/api2.0/v1/shopping/order/createOrderV2', $orderPayload, [
            'CJ-Access-Token: ' . $token
        ]);

        if ($cjOrderRes && isset($cjOrderRes['result']) && $cjOrderRes['result']) {
            echo json_encode([
                'success' => true,
                'cjOrderId' => $cjOrderRes['data']['orderId'] ?? ('CJ-' . time()),
                'status' => 'PLACED_ON_CJ',
                'source' => 'cj_live_order'
            ]);
            exit();
        }
    }

    echo json_encode([
        'success' => false,
        'error' => 'CJ order was not created. Verify CJ_API_KEY and CJ response.'
    ]);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint not found', 'uri' => $uri]);
