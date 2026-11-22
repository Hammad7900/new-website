<?php
/**
 * Hostinger Health Check & CJ API Diagnostic
 * Access this at: https://yourdomain.com/api/test.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$configFile = __DIR__ . '/config.php';
$appConfig = is_file($configFile) ? (require $configFile) : [];
$apiKey = getenv('CJ_API_KEY') ?: ($appConfig['cj_api_key'] ?? '');

$curlEnabled = function_exists('curl_init');
$phpVersion = phpversion();

if (!$apiKey || !$curlEnabled) {
    http_response_code(503);
    echo json_encode(['status' => 'NOT_CONFIGURED', 'php_version' => $phpVersion, 'curl_enabled' => $curlEnabled, 'message' => 'Set cj_api_key in api/config.php (or CJ_API_KEY in the PHP environment) and enable PHP cURL.']);
    exit();
}

$ch = curl_init('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['apiKey' => $apiKey]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
$authRaw = curl_exec($ch);
$curlError = curl_error($ch);
curl_close($ch);

$authData = is_string($authRaw) ? json_decode($authRaw, true) : null;
$hasToken = isset($authData['code']) && $authData['code'] === 200 && !empty($authData['data']['accessToken']);

$productsCount = 0;
$productData = null;
$productCurlError = null;
if ($hasToken) {
    $token = $authData['data']['accessToken'];
    $ch2 = curl_init('https://developers.cjdropshipping.com/api2.0/v1/product/listV2?page=1&size=5');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'CJ-Access-Token: ' . $token]);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, 2);
    $prodRaw = curl_exec($ch2);
    $productCurlError = curl_error($ch2);
    curl_close($ch2);
    $productData = is_string($prodRaw) ? json_decode($prodRaw, true) : null;
    $list = $productData['data']['content'][0]['productList'] ?? $productData['data']['productList'] ?? $productData['data']['list'] ?? [];
    $productsCount = is_array($list) ? count($list) : 0;
}

$listingOk = $hasToken && (int)($productData['code'] ?? 0) === 200;
$status = !$hasToken ? 'AUTH_FAILED' : ($listingOk ? 'ONLINE_AND_LISTING' : 'AUTHENTICATED_LISTING_FAILED');

echo json_encode([
    'status' => $status,
    'php_version' => $phpVersion,
    'curl_enabled' => $curlEnabled,
    'curl_error' => $curlError ?: null,
    'cj_api_response_code' => $authData['code'] ?? null,
    'cj_authenticated' => $hasToken,
    'cj_listing_api_code' => $productData['code'] ?? null,
    'cj_listing_api_message' => $productData['message'] ?? null,
    'cj_listing_request_id' => $productData['requestId'] ?? null,
    'cj_listing_curl_error' => $productCurlError ?: null,
    'cj_sample_products_retrieved' => $productsCount,
    'message' => !$hasToken
        ? 'CJ authentication failed. Check that the API key comes from CJ Authorization > API and is current.'
        : ($listingOk ? 'CJ authentication and product listing both succeeded.' : 'CJ authentication succeeded, but product listing failed. See the listing response code, message, and request ID.')
], JSON_PRETTY_PRINT);
