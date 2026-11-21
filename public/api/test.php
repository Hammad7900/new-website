<?php
/**
 * Hostinger Health Check & CJ API Diagnostic
 * Access this at: https://yourdomain.com/api/test.php
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

$apiKey = getenv('CJ_API_KEY') ?: 'CJ5799036@api@68240b5fc55f4b8db42e75c858c29b05';

$curlEnabled = function_exists('curl_init');
$phpVersion = phpversion();

$ch = curl_init('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['apiKey' => $apiKey]));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_TIMEOUT, 15);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
$authRaw = curl_exec($ch);
$curlError = curl_error($ch);
curl_close($ch);

$authData = json_decode($authRaw, true);
$hasToken = isset($authData['code']) && $authData['code'] === 200 && !empty($authData['data']['accessToken']);

$productsCount = 0;
if ($hasToken) {
    $token = $authData['data']['accessToken'];
    $ch2 = curl_init('https://developers.cjdropshipping.com/api2.0/v1/product/listV2?pageNum=1&pageSize=5&keyWord=watch');
    curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'CJ-Access-Token: ' . $token]);
    curl_setopt($ch2, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch2, CURLOPT_SSL_VERIFYHOST, false);
    $prodRaw = curl_exec($ch2);
    curl_close($ch2);
    $prodData = json_decode($prodRaw, true);
    $list = $prodData['data']['content'][0]['productList'] ?? $prodData['data']['list'] ?? [];
    $productsCount = count($list);
}

echo json_encode([
    'status' => $hasToken ? 'ONLINE_AND_CONNECTED' : 'AUTH_FAILED',
    'php_version' => $phpVersion,
    'curl_enabled' => $curlEnabled,
    'curl_error' => $curlError ?: null,
    'cj_api_response_code' => $authData['code'] ?? null,
    'cj_authenticated' => $hasToken,
    'cj_sample_products_retrieved' => $productsCount,
    'message' => $hasToken
        ? 'CJ API is completely active and returning products from Hostinger!'
        : 'Could not connect to CJ API. Check curl or API key.'
], JSON_PRETTY_PRINT);
