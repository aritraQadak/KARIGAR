import http from 'http';
import { spawn } from 'child_process';

const serverProcess = spawn('node', ['server/server.js'], {
  env: { ...process.env, PORT: '5097' },
  stdio: 'pipe'
});

serverProcess.stdout.on('data', d => console.log('[Server stdout]:', d.toString().trim()));
serverProcess.stderr.on('data', d => console.error('[Server stderr]:', d.toString().trim()));

function request(path, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(`http://localhost:5097${path}`, {
      ...options,
      headers: {
        'Origin': 'https://karigar-frontend.onrender.com',
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        const corsOrigin = res.headers['access-control-allow-origin'] || '';
        const corsCreds = res.headers['access-control-allow-credentials'] || '';
        let json = null;
        if (contentType.includes('application/json')) {
          try { json = JSON.parse(data); } catch (e) {}
        }
        resolve({
          status: res.statusCode,
          contentType,
          corsOrigin,
          corsCreds,
          rawBody: data,
          json
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(typeof body === 'string' ? body : JSON.stringify(body));
    req.end();
  });
}

// Wait 1.5s for server to start
setTimeout(async () => {
  try {
    console.log('Testing unified server.js...');

    // 1. Health check with CORS headers
    const health = await request('/api/health');
    console.log('1. Health check response:', health.json, 'CORS Origin:', health.corsOrigin, 'CORS Creds:', health.corsCreds);
    if (health.status !== 200 || health.json?.status !== 'ok') throw new Error('Health check failed');
    if (health.corsOrigin !== 'https://karigar-frontend.onrender.com') throw new Error('CORS origin reflection failed');
    if (health.corsCreds !== 'true') throw new Error('CORS credentials failed');

    // 2. SPA fallback check (serving index.html for non-api routes)
    const spa = await request('/login');
    console.log('2. SPA fallback status:', spa.status, 'Content-type:', spa.contentType);
    if (spa.status !== 200 || !spa.contentType.includes('text/html')) throw new Error('SPA fallback failed');

    // 3. API route never falls through to SPA
    const badApi = await request('/api/auth/login', { method: 'POST' }, {
      identifier: 'wrong@example.com',
      password: 'badpassword',
      selectedRole: 'PATRON'
    });
    console.log('3. Bad API call status:', badApi.status, 'Content-type:', badApi.contentType, 'Body:', badApi.json);
    if (badApi.status !== 401 || !badApi.contentType.includes('application/json') || !badApi.json?.error) {
      throw new Error('API route fell through or failed to return JSON');
    }

    console.log('\nAll server.js tests PASSED with distinction!');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    serverProcess.kill();
    process.exit();
  }
}, 1500);
