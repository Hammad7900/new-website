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
$CJ_API_KEY = getenv('CJ_API_KEY') ?: ($appConfig['cj_api_key'] ?? '');
$ADMIN_PASSWORD = getenv('ADMIN_PASSWORD') ?: ($appConfig['admin_password'] ?? '');
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '';
$endpoint = isset($_GET['endpoint']) ? $_GET['endpoint'] : '';

function sendJson($status, $payload) {
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    exit();
}

function loadStoreState() {
    $path = dirname(__DIR__) . '/.aura-store-data.json';
    if (!is_file($path)) return ['shippingCost' => 12.99, 'coupons' => [], 'orders' => []];
    $state = json_decode(@file_get_contents($path), true);
    return is_array($state) ? array_merge(['shippingCost' => 12.99, 'coupons' => [], 'orders' => []], $state) : ['shippingCost' => 12.99, 'coupons' => [], 'orders' => []];
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
    $provided = $_SERVER['HTTP_X_ADMIN_PASSWORD'] ?? '';
    return $expected !== '' && $provided !== '' && hash_equals($expected, $provided);
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

if (str_ends_with($uri, '/admin-auth')) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(405, ['success' => false, 'error' => 'POST required.']);
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    if (!$ADMIN_PASSWORD || !isset($body['password']) || !hash_equals($ADMIN_PASSWORD, (string)$body['password'])) {
        sendJson(401, ['success' => false, 'error' => 'Incorrect administrator password.']);
    }
    sendJson(200, ['success' => true]);
}

if (str_ends_with($uri, '/store-settings')) {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $state = loadStoreState();
        sendJson(200, ['success' => true, 'shippingCost' => (float)$state['shippingCost']]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') sendJson(405, ['success' => false, 'error' => 'GET or POST required.']);
    if (!adminPasswordIsValid($ADMIN_PASSWORD)) sendJson(401, ['success' => false, 'error' => 'Administrator authentication required.']);
    $body = json_decode(file_get_contents('php://input'), true) ?: [];
    $amount = filter_var($body['shippingCost'] ?? null, FILTER_VALIDATE_FLOAT);
    if ($amount === false || $amount < 0 || $amount > 10000) sendJson(400, ['success' => false, 'error' => 'Shipping fee must be between 0 and 10000.']);
    try {
        $state = saveStoreState(['shippingCost' => round($amount, 2)]);
        sendJson(200, ['success' => true, 'shippingCost' => (float)$state['shippingCost']]);
    } catch (Throwable $error) {
        sendJson(500, ['success' => false, 'error' => $error->getMessage()]);
    }
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
        $shipping = (float)$state['shippingCost'];
        $couponCode = strtoupper(trim((string)($body['couponCode'] ?? '')));
        $discount = 0.0;
        if ($couponCode !== '') {
            foreach ($state['coupons'] as $savedCoupon) {
                if (strtoupper($savedCoupon['code'] ?? '') === $couponCode && strtotime(($savedCoupon['expiry'] ?? '') . ' 23:59:59 UTC') >= time()) {
                    $discount = ($savedCoupon['type'] ?? '') === 'percentage'
                        ? round(0 * ((float)$savedCoupon['value']) / 100, 2)
                        : 0.0;
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
            'items' => $items,
            'subtotal' => 0,
            'shipping' => $shipping,
            'discountAmount' => $discount,
            'total' => $shipping,
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

// Route: /api/cj-products
if (strpos($uri, 'cj-products') !== false || $endpoint === 'cj-products') {
    $token = getAccessToken($CJ_API_KEY);
    if (!$token) {
        echo json_encode(['success' => false, 'error' => 'Unable to authenticate with CJ API']);
        exit();
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
                'name' => $item['productNameEn'] ?? $item['productName'] ?? 'Curated Atelier Piece',
                'price' => $retailPrice,
                'compareAtPrice' => $comparePrice,
                'images' => !empty($item['productImageSet']) ? $item['productImageSet'] : [$item['bigImage'] ?? ''],
                'description' => $item['description'] ?? $item['productNameEn'] ?? 'Curated premium item.',
                'category' => $item['categoryName'] ?? 'Curated',
                'sku' => $item['productSku'] ?? ('CJ-' . $productId),
                'stock' => 0,
                'rating' => 0,
                'reviewsCount' => 0,
                'variants' => array_values(array_map(function($v) use ($retailPrice) {
                    $inventory = array_sum(array_map(function($inventory) {
                        return (int)($inventory['totalInventory'] ?? 0);
                    }, $v['inventories'] ?? []));
                    return [
                        'vid' => $v['vid'] ?? '',
                        'name' => $v['variantNameEn'] ?? $v['variantKeyEn'] ?? $v['variantKey'] ?? $v['variantName'] ?? 'Standard Edition',
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
    foreach ($rawList as $p) {
        $retail = 0;
        $compare = 0;
        $mapped[] = [
            'id' => $p['id'],
            'name' => $p['nameEn'] ?? $p['productNameEn'] ?? 'Luxury Atelier Item',
            'price' => $retail,
            'compareAtPrice' => $compare,
            'images' => [$p['bigImage'] ?? $p['productImage'] ?? ''],
            'description' => 'Direct from vetted master workshops. High-precision materials and verified priority courier dispatch.',
            'category' => $p['threeCategoryName'] ?? $p['twoCategoryName'] ?? ($keyword ?: 'Curated'),
            'sku' => $p['sku'] ?? ('REF-' . $p['id']),
            'stock' => (int)($p['warehouseInventoryNum'] ?? 0),
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
