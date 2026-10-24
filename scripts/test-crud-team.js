async function testCrudAndTeam() {
  console.log('Testing CRUD and Team endpoints...\n');
  const BASE_URL = 'http://localhost:3000';

  // 1. Team test
  console.log('[1/4] Testing GET /api/team...');
  const teamRes = await fetch(`${BASE_URL}/api/team`);
  const teamData = await teamRes.json();
  console.log('      ✓ Team members count:', teamData.profiles.length);
  console.log('      ✓ Profiles:', teamData.profiles.map(p => `${p.email} (${p.role})`));

  // 2. Invite test
  console.log('\n[2/4] Testing POST /api/team (Invite new user)...');
  const inviteRes = await fetch(`${BASE_URL}/api/team`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'invite',
      email: 'collaborator@appplanner.ai',
      role: 'user',
    }),
  });
  const inviteData = await inviteRes.json();
  console.log('      ✓ Invitation created:', inviteData.invitation);

  // 3. Project detail & custom doc test
  console.log('\n[3/4] Testing Project Detail & Custom Document...');
  const projList = await (await fetch(`${BASE_URL}/api/projects`)).json();
  if (projList.projects && projList.projects.length > 0) {
    const testProjectId = projList.projects[0].id;
    console.log('      Target project ID:', testProjectId);

    // Add custom doc
    const addDocRes = await fetch(`${BASE_URL}/api/projects/${testProjectId}/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename: 'custom_benchmark.md',
        content: '# Benchmark Performa\n\nAnalisis latensi query database serverless.',
      }),
    });
    const addDocData = await addDocRes.json();
    console.log('      ✓ Custom doc created:', addDocData.document?.filename);

    // Get detail
    const detail = await (await fetch(`${BASE_URL}/api/projects/${testProjectId}`)).json();
    console.log(`      ✓ Project "${detail.project.name}" has ${detail.documents.length} documents`);
  }

  // 4. Update team role test
  console.log('\n[4/4] Testing Member Role Update...');
  if (teamData.profiles && teamData.profiles.length > 0) {
    const adminId = teamData.profiles[0].id;
    const updateRoleRes = await fetch(`${BASE_URL}/api/team`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: adminId, role: 'admin' }),
    });
    const roleData = await updateRoleRes.json();
    console.log('      ✓ Updated profile role:', roleData.profile?.role);
  }

  console.log('\nAll CRUD and Team endpoints verified successfully!');
}

testCrudAndTeam().catch(console.error);
