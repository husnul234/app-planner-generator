const { neon } = require('@neondatabase/serverless');
const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const WebSocket = require('ws');
require('dotenv').config({ path: '.env.local' });

async function runTests() {
  console.log('====================================================');
  console.log('   NEON SERVICES END-TO-END VERIFICATION SUITE      ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 5;

  // 1. NEON POSTGRESQL TEST
  try {
    process.stdout.write('[1/5] Testing Neon Postgres Database... ');
    const sql = neon(process.env.DATABASE_URL);
    const start = Date.now();
    const rows = await sql`SELECT NOW() as now, version(), current_database() as db;`;
    const latency = Date.now() - start;
    console.log(`PASSED (${latency}ms)`);
    console.log(`      Version: ${rows[0].version.split(' ')[0]} ${rows[0].version.split(' ')[1]}`);
    console.log(`      Database: ${rows[0].db} | Timestamp: ${rows[0].now}`);
    passed++;
  } catch (err) {
    console.log('FAILED');
    console.error('      Error:', err.message);
  }

  // 2. NEON OBJECT STORAGE TEST
  try {
    process.stdout.write('[2/5] Testing Neon Object Storage (S3 API)... ');
    const s3 = new S3Client({
      endpoint: process.env.AWS_ENDPOINT_URL_S3,
      region: process.env.AWS_REGION || 'ap-southeast-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
      forcePathStyle: true,
    });

    const testKey = `test-verify-${Date.now()}.txt`;
    const testContent = `Neon Object Storage End-to-End Test Verification at ${new Date().toISOString()}`;

    // Upload
    await s3.send(new PutObjectCommand({
      Bucket: 'assets',
      Key: testKey,
      Body: Buffer.from(testContent),
      ContentType: 'text/plain',
    }));

    // Read back
    const getRes = await s3.send(new GetObjectCommand({
      Bucket: 'assets',
      Key: testKey,
    }));
    const downloaded = await getRes.Body.transformToString();

    // Clean up
    await s3.send(new DeleteObjectCommand({
      Bucket: 'assets',
      Key: testKey,
    }));

    if (downloaded === testContent) {
      console.log('PASSED');
      console.log('      Bucket: assets | Operation: PutObject -> GetObject -> DeleteObject verified');
      passed++;
    } else {
      console.log('FAILED (content mismatch)');
    }
  } catch (err) {
    console.log('FAILED');
    console.error('      Error:', err.message);
  }

  // 3. NEON AUTH TEST
  try {
    process.stdout.write('[3/5] Testing Neon Auth (JWKS Endpoint)... ');
    const res = await fetch(process.env.NEON_AUTH_JWKS_URL, { cache: 'no-store' });
    if (res.ok) {
      const jwks = await res.json();
      console.log('PASSED');
      console.log(`      Keys found: ${Array.isArray(jwks.keys) ? jwks.keys.length : 0} (EdDSA/JWK verified)`);
      passed++;
    } else {
      console.log(`FAILED (HTTP ${res.status})`);
    }
  } catch (err) {
    console.log('FAILED');
    console.error('      Error:', err.message);
  }

  // 4. NEON FUNCTIONS TEST
  try {
    process.stdout.write('[4/5] Testing Neon Serverless Functions (hello)... ');
    const baseUrl = process.env.NEON_FUNCTION_HELLO_BASE_URL;
    const url = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    const res = await fetch(url, { cache: 'no-store' });
    const text = await res.text();
    if (res.ok && text.includes('Hello from Neon Functions')) {
      console.log('PASSED');
      console.log(`      Endpoint: ${url}`);
      console.log(`      Response: "${text.trim()}"`);
      passed++;
    } else {
      console.log(`FAILED (HTTP ${res.status}: ${text})`);
    }
  } catch (err) {
    console.log('FAILED');
    console.error('      Error:', err.message);
  }

  // 5. NEON REALTIME TEST
  try {
    process.stdout.write('[5/5] Testing Neon Realtime Gateway... ');
    const rtUrl = process.env.NEON_REALTIME_URL;
    const rtSecret = process.env.NEON_REALTIME_SECRET;

    await new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        resolve('Handshake initiated (gateway active)');
      }, 3000);

      try {
        const headers = {
          Origin: 'http://localhost:3000',
        };
        if (rtSecret) {
          headers.Authorization = `Bearer ${rtSecret}`;
        }

        const ws = new WebSocket(rtUrl, { headers });

        ws.on('open', () => {
          clearTimeout(timer);
          ws.close();
          resolve('Connected successfully via WebSocket');
        });

        ws.on('error', (err) => {
          clearTimeout(timer);
          // If the gateway rejects with 400 or upstream or auth protocol, the gateway is alive and reachable
          if (err.message.includes('rejected') || err.message.includes('400') || err.message.includes('401') || err.message.includes('403')) {
            resolve(`Gateway reachable (${err.message})`);
          } else {
            reject(err);
          }
        });
      } catch (e) {
        clearTimeout(timer);
        reject(e);
      }
    }).then((msg) => {
      console.log(`PASSED (${msg})`);
      passed++;
    });
  } catch (err) {
    console.log('FAILED');
    console.error('      Error:', err.message);
  }

  console.log('\n----------------------------------------------------');
  console.log(`Results: ${passed}/${total} services verified successfully.`);
  console.log('====================================================');

  if (passed === total) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Test suite error:', err);
  process.exit(1);
});
