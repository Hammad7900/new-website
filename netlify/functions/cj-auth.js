// netlify/functions/cj-auth.js
/**
 * Netlify Function: CJ Dropshipping Authentication
 * Obtains and in-memory caches the CJ API access token
 */

let tokenCache = {
  accessToken: null,
  expiresAt: 0,
};

// User provided CJ API Key
const DEFAULT_CJ_API_KEY = 'CJ5799036@api@68240b5fc55f4b8db42e75c858c29b05';

export async function getCJAccessToken() {
  const now = Date.now();
  // Return cached token if valid (with 5 min buffer)
  if (tokenCache.accessToken && tokenCache.expiresAt > now + 300000) {
    return { token: tokenCache.accessToken, source: 'cache', isDemo: false };
  }

  const apiKey = (process.env.CJ_API_KEY || DEFAULT_CJ_API_KEY || '').trim();

  if (!apiKey) {
    const mockToken = 'mock_cj_token_' + Math.random().toString(36).substring(2, 15);
    tokenCache = {
      accessToken: mockToken,
      expiresAt: now + 3600000 * 24,
    };
    return { token: mockToken, source: 'demo_fallback', isDemo: true };
  }

  try {
    const response = await fetch('https://developers.cjdropshipping.com/api2.0/v1/authentication/getAccessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey: apiKey,
      }),
    });

    const data = await response.json();

    if (data.result && data.code === 200 && data.data?.accessToken) {
      // Access token expiry
      const expiryMs = data.data.accessTokenExpiryDate 
        ? new Date(data.data.accessTokenExpiryDate).getTime() 
        : now + 3600000 * 24 * 15;

      tokenCache = {
        accessToken: data.data.accessToken,
        expiresAt: expiryMs,
      };
      return { token: tokenCache.accessToken, source: 'cj_api', isDemo: false };
    } else {
      console.warn('CJ Auth response error:', data.message || 'Unknown error');
      return { 
        token: null, 
        source: 'error', 
        isDemo: false, 
        error: data.message || 'Invalid API Key or CJ Service Error' 
      };
    }
  } catch (error) {
    console.error('CJ Auth fetch error:', error);
    return { 
      token: null, 
      source: 'network_error', 
      isDemo: false, 
      error: error.message 
    };
  }
}

export const handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const authData = await getCJAccessToken();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: !!authData.token,
        accessToken: authData.token,
        source: authData.source,
        isDemo: authData.isDemo || false,
        cachedUntil: new Date(tokenCache.expiresAt).toISOString(),
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
