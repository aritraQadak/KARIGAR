/**
 * Karigar Safe API Client
 * - Targets import.meta.env.VITE_API_URL if configured, or falls back to relative /api paths.
 * - Safely inspects response content-type to prevent "Unexpected end of JSON input".
 * - Clearly identifies non-JSON, HTML, 404, or empty responses in production.
 */

export const API_BASE_URL = (
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
  (typeof process !== 'undefined' && process.env && process.env.VITE_API_URL) ||
  ''
).replace(/\/+$/, '');

/**
 * Executes a network fetch and safely parses JSON, providing descriptive error messages on failure.
 * @param {string} endpoint - API path (e.g. '/api/auth/login')
 * @param {RequestInit} options - fetch options
 * @returns {Promise<any>} Parsed JSON response body
 */
export async function safeFetch(endpoint, options = {}) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://')
    ? endpoint
    : `${API_BASE_URL}${cleanEndpoint}`;

  const headers = {
    ...options.headers
  };

  let response;
  try {
    response = await fetch(fullUrl, {
      ...options,
      headers
    });
  } catch (networkError) {
    console.error('API Network or CORS error:', {
      url: fullUrl,
      error: networkError.message
    });
    throw new Error('Unable to connect to server. Please check your internet connection or verify the backend service is running.');
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;

  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch (jsonErr) {
      console.error('Failed to parse JSON response from server:', {
        url: fullUrl,
        status: response.status,
        statusText: response.statusText,
        error: jsonErr.message
      });
      throw new Error(`Server returned invalid JSON (${response.status} ${response.statusText})`);
    }
  } else {
    // Non-JSON response (e.g. HTML from SPA rewrite, 404 page, or empty body)
    const textBody = await response.text();
    console.error('Non-JSON API response received:', {
      url: fullUrl,
      status: response.status,
      statusText: response.statusText,
      contentType,
      bodyPreview: textBody ? textBody.slice(0, 300) : '<empty>'
    });

    if (textBody && (textBody.includes('<!DOCTYPE') || textBody.includes('<html'))) {
      throw new Error(
        `Backend API returned an HTML page instead of JSON (${response.status}). If frontend and backend are hosted separately on Render, verify that VITE_API_URL is configured to point to your backend service.`
      );
    }

    if (!textBody || textBody.trim() === '') {
      throw new Error(
        `Server returned an empty response (${response.status} ${response.statusText}).`
      );
    }

    throw new Error(
      `Server returned ${response.status} ${response.statusText} instead of JSON.`
    );
  }

  if (!response.ok) {
    const errorMessage = data?.error || data?.message || `Request failed with status ${response.status}`;
    throw new Error(errorMessage);
  }

  return data;
}
