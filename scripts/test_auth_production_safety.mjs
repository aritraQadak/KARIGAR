import http from 'http';
import { handleAuthRequest } from '../server/authHandler.js';

// Create a test server to run verification tests
const testServer = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    await handleAuthRequest(req, res);
    return;
  }
  res.statusCode = 404;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ error: 'Not found' }));
});

const TEST_PORT = 5099;

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:${TEST_PORT}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        let json = null;
        if (contentType.includes('application/json')) {
          try {
            json = JSON.parse(data);
          } catch (e) {
            // failed parsing
          }
        }
        resolve({
          status: res.statusCode,
          contentType,
          rawBody: data,
          json
        });
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  await new Promise((resolve) => testServer.listen(TEST_PORT, resolve));
  console.log(`Test server running on port ${TEST_PORT}`);

  try {
    // 1. Health check
    const health = await request('/api/health', { method: 'GET' });
    console.log('1. Health check status:', health.status, 'Body:', health.json);
    if (health.status !== 200 || health.json?.status !== 'ok') {
      throw new Error('Health check failed');
    }

    // 2. Missing fields login
    const missingRole = await request('/api/auth/login', { method: 'POST' }, {
      identifier: 'test@example.com',
      password: 'password123'
    });
    console.log('2. Missing role status:', missingRole.status, 'Body:', missingRole.json);
    if (missingRole.status !== 400 || !missingRole.json?.error) {
      throw new Error('Missing role test failed');
    }

    // 3. Invalid credentials login
    const badCreds = await request('/api/auth/login', { method: 'POST' }, {
      identifier: 'nonexistent_user_9999@example.com',
      password: 'wrongpassword',
      selectedRole: 'PATRON'
    });
    console.log('3. Bad credentials status:', badCreds.status, 'Body:', badCreds.json);
    if (badCreds.status !== 401 || !badCreds.json?.error) {
      throw new Error('Bad credentials test failed');
    }

    // 4. Check 404 endpoint returns JSON, never empty or HTML
    const notFound = await request('/api/auth/unknown_endpoint', { method: 'GET' });
    console.log('4. 404 endpoint status:', notFound.status, 'Body:', notFound.json);
    if (notFound.status !== 404 || !notFound.json?.error) {
      throw new Error('404 endpoint did not return JSON');
    }

    console.log('\nAll auth endpoints consistently return valid JSON with proper status codes! No empty responses or unhandled errors.');
  } finally {
    testServer.close();
  }
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
