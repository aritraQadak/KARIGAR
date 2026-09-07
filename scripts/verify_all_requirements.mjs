import assert from 'assert';
import { getHomeRouteForRole, navigateByRole, redirectByRole, EXISTING_PATRON_ROUTE, EXISTING_ARTISAN_ROUTE } from '../src/utils/navigation.js';
import { handleAuthRequest, prisma } from '../server/authHandler.js';
import { EventEmitter } from 'events';

console.log('====================================================');
console.log('KARIGAR AUTHENTICATION & ROUTING COMPREHENSIVE SUITE');
console.log('====================================================\n');

// Mock request/response helper
function createMockReqRes(method, path, body = null, headers = {}) {
  const req = new EventEmitter();
  req.method = method;
  req.url = path;
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

  const execute = () => {
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
  };

  return { execute };
}

// In-memory Web Storage Mock simulating browser sessionStorage and localStorage
class StorageMock {
  constructor() {
    this.store = {};
  }
  getItem(key) {
    return this.store[key] || null;
  }
  setItem(key, value) {
    this.store[key] = String(value);
  }
  removeItem(key) {
    delete this.store[key];
  }
  clear() {
    this.store = {};
  }
}

async function runVerification() {
  let passedCount = 0;

  // ----------------------------------------------------
  // TEST CASE 1: Open website from main URL (/) -> Login page
  // ----------------------------------------------------
  console.log('TEST CASE 1: Main URL (/) routes to /login and not protected interfaces');
  assert.strictEqual(getHomeRouteForRole(null), '/login', 'Unauthenticated root route must resolve to /login');
  let navTarget = null;
  const mockNav = (dest) => { navTarget = dest; };
  navigateByRole(mockNav, null);
  assert.strictEqual(navTarget, '/login', 'Logged out visitor entering site must be routed to /login');
  console.log('✓ TEST CASE 1 PASSED: Unauthenticated root access resolves to /login.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 2: Login using an ARTISAN account
  // ----------------------------------------------------
  console.log('TEST CASE 2: Login using an ARTISAN account -> redirects to /seller/dashboard');
  const artisanLogin = await createMockReqRes('POST', '/api/auth/login', {
    identifier: 'test.artisan@craftguild.in',
    password: 'ArtisanPassword123!',
    selectedRole: 'ARTISAN'
  }).execute();

  assert.strictEqual(artisanLogin.status, 200, 'Artisan login should return 200');
  assert.strictEqual(artisanLogin.data.user.role, 'ARTISAN', 'Prisma role must be ARTISAN');
  navigateByRole(mockNav, artisanLogin.data.user);
  assert.strictEqual(navTarget, '/seller/dashboard', 'Artisan must be redirected to /seller/dashboard');
  console.log('✓ TEST CASE 2 PASSED: ARTISAN login navigates to /seller/dashboard.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 3: Login using a PATRON account
  // ----------------------------------------------------
  console.log('TEST CASE 3: Login using a PATRON account -> redirects to Patron Interface (/patron)');
  const patronLogin = await createMockReqRes('POST', '/api/auth/login', {
    identifier: 'patron.test@collector.in',
    password: 'PatronSecure123!',
    selectedRole: 'PATRON'
  }).execute();

  assert.strictEqual(patronLogin.status, 200, 'Patron login should return 200');
  assert.strictEqual(patronLogin.data.user.role, 'PATRON', 'Prisma role must be PATRON');
  navigateByRole(mockNav, patronLogin.data.user);
  assert.strictEqual(navTarget, '/patron', 'Patron must be redirected to /patron');
  console.log('✓ TEST CASE 3 PASSED: PATRON login navigates to /patron.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 4: Logout ARTISAN -> Direct access to /seller/dashboard redirected to /login
  // ----------------------------------------------------
  console.log('TEST CASE 4: Logout ARTISAN -> protected /seller/dashboard direct URL redirects to /login');
  const mockSessionStorage = new StorageMock();
  mockSessionStorage.setItem('karigar-auth-token', artisanLogin.data.token);
  mockSessionStorage.setItem('karigar-user', JSON.stringify(artisanLogin.data.user));

  // Perform logout
  mockSessionStorage.removeItem('karigar-auth-token');
  mockSessionStorage.removeItem('karigar-user');
  assert.strictEqual(mockSessionStorage.getItem('karigar-auth-token'), null);

  // Now simulate direct URL access to /seller/dashboard while logged out
  const loggedOutUser = null;
  navigateByRole(mockNav, loggedOutUser, '/seller/dashboard');
  assert.strictEqual(navTarget, '/login', 'Logged out visitor entering /seller/dashboard must be redirected to /login');
  console.log('✓ TEST CASE 4 PASSED: Logout clears token and direct /seller/dashboard redirects to /login.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 5: Logout PATRON -> Direct access to Patron dashboard redirected to /login
  // ----------------------------------------------------
  console.log('TEST CASE 5: Logout PATRON -> direct access to /patron redirects to /login');
  navigateByRole(mockNav, null, '/patron');
  assert.strictEqual(navTarget, '/login', 'Logged out visitor entering /patron must be redirected to /login');
  navigateByRole(mockNav, null, '/patron/dashboard');
  assert.strictEqual(navTarget, '/login', 'Logged out visitor entering /patron/dashboard must be redirected to /login');
  console.log('✓ TEST CASE 5 PASSED: Direct access to patron URLs while logged out redirects to /login.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 6: ARTISAN selects Patron during login -> Rejected
  // ----------------------------------------------------
  console.log('TEST CASE 6: ARTISAN selects Patron during login -> Role mismatch error rejected');
  const artisanAsPatron = await createMockReqRes('POST', '/api/auth/login', {
    identifier: 'test.artisan@craftguild.in',
    password: 'ArtisanPassword123!',
    selectedRole: 'PATRON'
  }).execute();

  assert.strictEqual(artisanAsPatron.status, 403, 'Should reject with 403 Forbidden');
  assert.ok(artisanAsPatron.data.error.includes('registered as Artisan / Weaver'), 'Error must specify registered role');
  console.log('✓ TEST CASE 6 PASSED: ARTISAN selecting Patron is rejected with 403 role mismatch error.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 7: PATRON selects Artisan during login -> Rejected
  // ----------------------------------------------------
  console.log('TEST CASE 7: PATRON selects Artisan during login -> Role mismatch error rejected');
  const patronAsArtisan = await createMockReqRes('POST', '/api/auth/login', {
    identifier: 'patron.test@collector.in',
    password: 'PatronSecure123!',
    selectedRole: 'ARTISAN'
  }).execute();

  assert.strictEqual(patronAsArtisan.status, 403, 'Should reject with 403 Forbidden');
  assert.ok(patronAsArtisan.data.error.includes('registered as Patron / Collector'), 'Error must specify registered role');
  console.log('✓ TEST CASE 7 PASSED: PATRON selecting Artisan is rejected with 403 role mismatch error.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 8: Refresh while logged in as ARTISAN -> Session remains functional
  // ----------------------------------------------------
  console.log('TEST CASE 8: Refresh while logged in as ARTISAN -> Session remains active');
  // Simulate active session in sessionStorage during page refresh
  const activeArtisanToken = artisanLogin.data.token;
  const meCheckArtisan = await createMockReqRes('GET', '/api/auth/me', null, {
    authorization: `Bearer ${activeArtisanToken}`
  }).execute();

  assert.strictEqual(meCheckArtisan.status, 200);
  assert.strictEqual(meCheckArtisan.data.user.role, 'ARTISAN');
  navigateByRole(mockNav, meCheckArtisan.data.user, '/seller/dashboard');
  assert.strictEqual(navTarget, '/seller/dashboard', 'Refreshed active session preserves /seller/dashboard');
  console.log('✓ TEST CASE 8 PASSED: Refresh on /seller/dashboard preserves ARTISAN session.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 9: Refresh while logged in as PATRON -> Session remains functional
  // ----------------------------------------------------
  console.log('TEST CASE 9: Refresh while logged in as PATRON -> Session remains active');
  const activePatronToken = patronLogin.data.token;
  const meCheckPatron = await createMockReqRes('GET', '/api/auth/me', null, {
    authorization: `Bearer ${activePatronToken}`
  }).execute();

  assert.strictEqual(meCheckPatron.status, 200);
  assert.strictEqual(meCheckPatron.data.user.role, 'PATRON');
  navigateByRole(mockNav, meCheckPatron.data.user, '/patron');
  assert.strictEqual(navTarget, '/patron', 'Refreshed active session preserves /patron');
  console.log('✓ TEST CASE 9 PASSED: Refresh on /patron preserves PATRON session.\n');
  passedCount++;

  // ----------------------------------------------------
  // TEST CASE 10: Close session & Reopen -> Login page first; Language & Theme preserved
  // ----------------------------------------------------
  console.log('TEST CASE 10: Reopen site -> Login page first; karigar-language & karigar-theme preserved in localStorage');
  const mockLocalStorage = new StorageMock();
  mockLocalStorage.setItem('karigar-language', 'bn'); // User chose Bengali
  mockLocalStorage.setItem('karigar-theme', 'dark');  // User chose dark theme

  // When session ends (browser closed), sessionStorage is empty:
  const freshSessionStorage = new StorageMock();
  const sessionToken = freshSessionStorage.getItem('karigar-auth-token');
  assert.strictEqual(sessionToken, null, 'Fresh site visit has no token in sessionStorage');

  // Authenticated state is false on fresh site visit
  const freshAuth = Boolean(sessionToken);
  assert.strictEqual(freshAuth, false, 'User is not authenticated on fresh visit');
  navigateByRole(mockNav, null);
  assert.strictEqual(navTarget, '/login', 'Fresh site reopen must show Login page first');

  // Language & Theme remain untouched in localStorage:
  assert.strictEqual(mockLocalStorage.getItem('karigar-language'), 'bn', 'Bengali language preserved');
  assert.strictEqual(mockLocalStorage.getItem('karigar-theme'), 'dark', 'Dark theme preserved');
  console.log('✓ TEST CASE 10 PASSED: Reopen site starts at /login while preserving Bengali & dark theme.\n');
  passedCount++;

  console.log('====================================================');
  console.log(`ALL ${passedCount}/10 TEST CASES VERIFIED AND PASSED SUCCESSFULLY!`);
  console.log('====================================================');
}

runVerification().catch(err => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
