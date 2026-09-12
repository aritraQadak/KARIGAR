/**
 * Live test of seeded artisan accounts against existing KARIGAR authentication system
 */

import { handleAuthRequest, prisma } from '../server/authHandler.js';
import { EventEmitter } from 'events';

function mockApiRequest(pathname, method, body, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = pathname;
  req.headers = { host: 'localhost:5173', ...headers };

  const res = {
    statusCode: 200,
    headers: {},
    body: '',
    setHeader(key, value) {
      this.headers[key] = value;
    },
    end(chunk) {
      if (chunk) this.body += chunk;
      this.emit('finish');
    }
  };
  Object.assign(res, EventEmitter.prototype);
  EventEmitter.call(res);

  return new Promise((resolve) => {
    res.on('finish', () => {
      let parsed = null;
      try {
        parsed = JSON.parse(res.body);
      } catch (e) {
        parsed = res.body;
      }
      resolve({ status: res.statusCode, headers: res.headers, data: parsed });
    });

    handleAuthRequest(req, res);

    if (body) {
      req.emit('data', Buffer.from(JSON.stringify(body)));
    }
    req.emit('end');
  });
}

async function testSeededLogins() {
  console.log('--- TESTING SEEDED ARTISAN LOGINS THROUGH /api/auth/login ---');

  const testAccounts = [
    { email: 'anirban.pal@karigar.in', region: 'West Bengal', craft: 'Jamdani' },
    { email: 'kailash.kripal.kumbhar@karigar.in', region: 'Rajasthan', craft: 'Blue Pottery' },
    { email: 'karthik.subramanian@karigar.in', region: 'Tamil Nadu', craft: 'Kanchipuram Silk' },
    { email: 'ghulam.hassan.mir@karigar.in', region: 'Jammu and Kashmir', craft: 'Pashmina Weaving' },
    { email: 'tsering.angchuk@karigar.in', region: 'Ladakh', craft: 'Pashmina Raw Wool Spinning' }
  ];

  for (const acct of testAccounts) {
    console.log(`\nTesting login for: ${acct.email} (${acct.region} - ${acct.craft})...`);
    
    // 1. Success login
    const res = await mockApiRequest('/api/auth/login', 'POST', {
      identifier: acct.email,
      password: 'Karigar@123',
      selectedRole: 'ARTISAN'
    });

    if (res.status !== 200 || !res.data.token || !res.data.user) {
      throw new Error(`Login failed for ${acct.email}: Status ${res.status}, Data: ${JSON.stringify(res.data)}`);
    }

    console.log(` ✓ Login successful! Status: ${res.status}`);
    console.log(`   User: ${res.data.user.fullName} | Role: ${res.data.user.role} | Craft: ${res.data.user.craftType}`);
    console.log(`   Token generated (length: ${res.data.token.length})`);
    if (res.data.user.password || res.data.user.passwordHash) {
      throw new Error(`SECURITY LEAK: Password field returned in login response for ${acct.email}!`);
    }
    console.log(`   Security check: Password/hash excluded from response: PASS ✅`);

    // 2. Role mismatch test (logging in as Patron)
    const patronRes = await mockApiRequest('/api/auth/login', 'POST', {
      identifier: acct.email,
      password: 'Karigar@123',
      selectedRole: 'PATRON'
    });
    if (patronRes.status !== 403) {
      throw new Error(`Role mismatch expected 403 but got ${patronRes.status}`);
    }
    console.log(` ✓ Role mismatch enforcement: Rejected with 403 Forbidden ("${patronRes.data.error}") ✅`);

    // 3. Invalid password test
    const wrongPassRes = await mockApiRequest('/api/auth/login', 'POST', {
      identifier: acct.email,
      password: 'IncorrectPassword999',
      selectedRole: 'ARTISAN'
    });
    if (wrongPassRes.status !== 401) {
      throw new Error(`Wrong password expected 401 but got ${wrongPassRes.status}`);
    }
    console.log(` ✓ Invalid password rejection: Rejected with 401 Unauthorized ("${wrongPassRes.data.error}") ✅`);
  }

  // 4. Verify public artisan directory
  console.log('\nTesting Public Artisan Directory (/api/artisans)...');
  const dirRes = await mockApiRequest('/api/artisans', 'GET', null);
  if (dirRes.status !== 200 || !Array.isArray(dirRes.data.artisans)) {
    throw new Error(`Artisan directory request failed: ${dirRes.status}`);
  }
  console.log(` ✓ Public directory active! Total visible active artisans: ${dirRes.data.artisans.length}`);
  const sample = dirRes.data.artisans[0];
  console.log(`   Sample directory entry: ${sample.fullName} (${sample.state} / ${sample.craftType})`);
  if (sample.email || sample.password || sample.mobile) {
    throw new Error('SECURITY LEAK: Private fields leaked in public directory!');
  }
  console.log(`   Privacy check: No emails, passwords, or mobiles leaked: PASS ✅`);

  console.log('\nALL AUTHENTICATION & DIRECTORY TESTS PASSED 100%! 🎉');
  await prisma.$disconnect();
}

testSeededLogins().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
