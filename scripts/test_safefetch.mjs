import http from 'http';

// Create a mock server that returns various faulty responses
const server = http.createServer((req, res) => {
  if (req.url === '/html-response') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end('<!DOCTYPE html><html><body>Error page</body></html>');
    return;
  }
  if (req.url === '/empty-response') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');
    res.end('');
    return;
  }
  if (req.url === '/valid-json') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ success: true, user: { role: 'PATRON' } }));
    return;
  }
});

const PORT = 5098;

async function testSafeFetchBehaviors() {
  await new Promise(r => server.listen(PORT, r));

  // Dynamic import of safeFetch logic or test directly
  const { safeFetch } = await import('../src/utils/api.js');

  console.log('Testing HTML response handling:');
  try {
    await safeFetch(`http://localhost:${PORT}/html-response`);
    console.error('FAILED: HTML response should have thrown');
    process.exit(1);
  } catch (err) {
    console.log('PASS: HTML error handled cleanly ->', err.message);
  }

  console.log('Testing Empty response handling:');
  try {
    await safeFetch(`http://localhost:${PORT}/empty-response`);
    console.error('FAILED: Empty response should have thrown');
    process.exit(1);
  } catch (err) {
    console.log('PASS: Empty response handled cleanly ->', err.message);
  }

  console.log('Testing Valid JSON handling:');
  const valid = await safeFetch(`http://localhost:${PORT}/valid-json`);
  if (valid && valid.success && valid.user.role === 'PATRON') {
    console.log('PASS: Valid JSON parsed cleanly ->', valid);
  } else {
    console.error('FAILED: Valid JSON did not parse correctly');
    process.exit(1);
  }

  server.close();
  console.log('\nAll frontend safeFetch tests PASSED successfully!');
}

testSafeFetchBehaviors().catch(e => {
  console.error(e);
  server.close();
  process.exit(1);
});
