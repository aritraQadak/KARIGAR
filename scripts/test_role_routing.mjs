import assert from 'assert';
import { getHomeRouteForRole, navigateByRole, redirectByRole, EXISTING_PATRON_ROUTE, EXISTING_ARTISAN_ROUTE } from '../src/utils/navigation.js';

console.log('--- STARTING ROLE ROUTING TEST MATRIX ---');

// Test 1: Route Constants
assert.strictEqual(EXISTING_PATRON_ROUTE, '/patron', 'Patron route must be "/patron"');
assert.strictEqual(EXISTING_ARTISAN_ROUTE, '/seller/dashboard', 'Artisan route must be "/seller/dashboard"');
console.log('✓ Test 1 Passed: Route Constants verified.');

// Test 2: getHomeRouteForRole
assert.strictEqual(getHomeRouteForRole('ARTISAN'), '/seller/dashboard');
assert.strictEqual(getHomeRouteForRole({ role: 'ARTISAN' }), '/seller/dashboard');
assert.strictEqual(getHomeRouteForRole('PATRON'), '/patron');
assert.strictEqual(getHomeRouteForRole({ role: 'PATRON' }), '/patron');
assert.strictEqual(getHomeRouteForRole(null), '/login');
console.log('✓ Test 2 Passed: getHomeRouteForRole verified for both roles.');

// Test 3: navigateByRole for ARTISAN with no deep-link
let destination = null;
let options = null;
const mockNavigate = (dest, opts) => {
  destination = dest;
  options = opts;
};

navigateByRole(mockNavigate, { role: 'ARTISAN' });
assert.strictEqual(destination, '/seller/dashboard');
assert.strictEqual(options?.replace, true);
console.log('✓ Test 3 Passed: ARTISAN with no deep-link routes to /seller/dashboard.');

// Test 4: navigateByRole for ARTISAN with invalid/patron deep-link (e.g. "/" or "/patron" or "/buyer/orders")
navigateByRole(mockNavigate, { role: 'ARTISAN' }, '/');
assert.strictEqual(destination, '/seller/dashboard', 'ARTISAN must NOT be redirected to "/"');

navigateByRole(mockNavigate, { role: 'ARTISAN' }, '/patron');
assert.strictEqual(destination, '/seller/dashboard', 'ARTISAN must NOT be redirected to "/patron"');

navigateByRole(mockNavigate, { role: 'ARTISAN' }, '/buyer/orders');
assert.strictEqual(destination, '/seller/dashboard', 'ARTISAN must NOT be redirected to "/buyer/orders"');

navigateByRole(mockNavigate, { role: 'ARTISAN' }, { pathname: '/' });
assert.strictEqual(destination, '/seller/dashboard', 'ARTISAN with location object "{ pathname: "/" }" must NOT be redirected to "/"');
console.log('✓ Test 4 Passed: ARTISAN discards Patron deep-links and routes to /seller/dashboard.');

// Test 5: navigateByRole for ARTISAN with valid seller deep-link (e.g. "/seller/products" or "/seller/orders")
navigateByRole(mockNavigate, { role: 'ARTISAN' }, '/seller/products');
assert.strictEqual(destination, '/seller/products');

navigateByRole(mockNavigate, { role: 'ARTISAN' }, { pathname: '/seller/orders' });
assert.strictEqual(destination, '/seller/orders');
console.log('✓ Test 5 Passed: ARTISAN preserves valid seller deep-links.');

// Test 6: navigateByRole for PATRON with no deep-link
navigateByRole(mockNavigate, { role: 'PATRON' });
assert.strictEqual(destination, '/patron');
assert.strictEqual(options?.replace, true);
console.log('✓ Test 6 Passed: PATRON with no deep-link routes to "/patron".');

// Test 7: navigateByRole for PATRON with invalid/seller deep-link (e.g. "/seller/dashboard")
navigateByRole(mockNavigate, { role: 'PATRON' }, '/seller/dashboard');
assert.strictEqual(destination, '/patron', 'PATRON must NOT be redirected to "/seller/dashboard"');

navigateByRole(mockNavigate, { role: 'PATRON' }, { pathname: '/seller/orders' });
assert.strictEqual(destination, '/patron', 'PATRON with location object must NOT be redirected to seller path');
console.log('✓ Test 7 Passed: PATRON discards Seller deep-links and routes to "/patron".');

// Test 8: navigateByRole for PATRON with valid patron deep-link (e.g. "/buyer/orders" or "/cart")
navigateByRole(mockNavigate, { role: 'PATRON' }, '/buyer/orders');
assert.strictEqual(destination, '/buyer/orders');

navigateByRole(mockNavigate, { role: 'PATRON' }, { pathname: '/cart' });
assert.strictEqual(destination, '/cart');
console.log('✓ Test 8 Passed: PATRON preserves valid patron deep-links.');

// Test 9: redirectByRole aliases
redirectByRole(mockNavigate, { role: 'ARTISAN' });
assert.strictEqual(destination, '/seller/dashboard');

redirectByRole({ role: 'PATRON' }, mockNavigate);
assert.strictEqual(destination, '/patron');
console.log('✓ Test 9 Passed: redirectByRole helper supports flexible argument ordering.');

// Test 10: Unauthenticated user handling
navigateByRole(mockNavigate, null);
assert.strictEqual(destination, '/login');
console.log('✓ Test 10 Passed: Unauthenticated user routes to /login.');

console.log('\n>>> ALL 10 ROLE ROUTING UNIT & INTEGRATION TESTS PASSED! <<<');
