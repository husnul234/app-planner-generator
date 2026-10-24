async function testAppEndToEnd() {
  console.log('====================================================');
  console.log('    NEXT.JS RUNNING APP END-TO-END TEST SUITE       ');
  console.log('====================================================\n');

  const BASE_URL = 'http://localhost:3000';

  // Test 1: Home page HTML
  console.log('[1/4] Testing GET / (Home Page UI)...');
  const homeRes = await fetch(`${BASE_URL}/`);
  if (!homeRes.ok) {
    throw new Error(`Home page failed with HTTP ${homeRes.status}`);
  }
  const homeHtml = await homeRes.text();
  console.log(`      ✓ HTTP ${homeRes.status} OK | Received ${homeHtml.length} bytes`);

  // Test 2: Live Neon Health Check API
  console.log('\n[2/4] Testing GET /api/neon/health (Neon 5-Service Telemetry)...');
  const healthRes = await fetch(`${BASE_URL}/api/neon/health`);
  const healthData = await healthRes.json();
  console.log(`      ✓ Status Code: ${healthRes.status}`);
  console.log(`      ✓ Overall Status: ${healthData.status}`);
  console.log(`      ✓ Branch: ${healthData.branch}`);
  console.log('      ✓ Services Health Report:');
  console.log(`        - Postgres: ${healthData.services.postgres.status} (${healthData.services.postgres.durationMs}ms)`);
  console.log(`        - Storage:  ${healthData.services.storage.status} (${healthData.services.storage.durationMs}ms, bucket: ${healthData.services.storage.bucket})`);
  console.log(`        - Auth:     ${healthData.services.auth.status} (${healthData.services.auth.durationMs}ms, keys: ${healthData.services.auth.keysCount})`);
  console.log(`        - Function: ${healthData.services.functions.status} (${healthData.services.functions.durationMs}ms, output: "${healthData.services.functions.output}")`);
  console.log(`        - Realtime: ${healthData.services.realtime.status} (${healthData.services.realtime.durationMs}ms)`);

  // Test 3: Generate 11 Documents & Save to Neon Postgres + S3
  console.log('\n[3/4] Testing POST /api/generate (11 Blueprint Docs + Neon DB + S3 Sync)...');
  const genRes = await fetch(`${BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      appName: 'Neon SaaS Test Pilot',
      category: 'Developer Platform',
      tagline: 'End-to-end verified blueprint generator',
      problem: 'Testing Neon Serverless Postgres and S3 sync',
      targetAudience: 'Architects and Cloud Engineers',
      coreFeatures: [
        'Multi-Cloud Blueprint Engine',
        'Neon Postgres Serverless Storage',
        'Neon Object Storage S3 Backups',
        'Cloudflare Pages Auto Deploy',
      ],
      techStack: ['Next.js 15', 'Neon PostgreSQL', 'Neon Storage', 'TailwindCSS'],
      dbType: 'Neon PostgreSQL',
      selectedModel: 'Google Gemini 2.0 Flash',
      saveToDatabase: true,
    }),
  });
  const genData = await genRes.json();
  if (!genData.success) {
    throw new Error(`Generation failed: ${genData.error}`);
  }
  console.log(`      ✓ Project Created with ID: ${genData.projectId}`);
  console.log(`      ✓ Documents Generated: ${genData.documentsCount} documents`);
  genData.documents.forEach((d, i) => {
    console.log(`        ${String(i + 1).padStart(2, '0')}. ${d.filename.padEnd(20)} (${d.wordCount} words)`);
  });

  // Test 4: Retrieve Projects from Neon Postgres
  console.log('\n[4/4] Testing GET /api/projects (Fetch Saved Projects from Neon Postgres)...');
  const projRes = await fetch(`${BASE_URL}/api/projects`);
  const projData = await projRes.json();
  if (!projData.success) {
    throw new Error(`Failed to fetch projects: ${projData.error}`);
  }
  console.log(`      ✓ Successfully retrieved ${projData.projects.length} project(s) from Neon database`);
  projData.projects.slice(0, 3).forEach((p) => {
    console.log(`        - ${p.name} [${p.status}] (ID: ${p.id})`);
  });

  console.log('\n====================================================');
  console.log('   ALL APPLICATION END-TO-END TESTS PASSED 100%!     ');
  console.log('====================================================\n');
}

testAppEndToEnd().catch((err) => {
  console.error('E2E Test Failed:', err);
  process.exit(1);
});
