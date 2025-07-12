const baseUrl = 'http://localhost:3002';

async function testCharacterAPI() {
  console.log('🔧 Testing Character API...\n');

  // First login as admin
  console.log('1. Logging in as admin...');
  const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'admin@forgedpacts.com',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  console.log('Login success:', loginData.success);

  if (!loginData.success) {
    console.error('❌ Admin login failed');
    return;
  }

  // Extract session cookie
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  const sessionCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';

  // 2. Test character creation
  console.log('\n2. Creating a test character...');
  const createResponse = await fetch(`${baseUrl}/api/admin/characters`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie 
    },
    body: JSON.stringify({
      name: 'Test Character',
      description: 'A test character for API testing',
      bio: 'This is a test bio',
      role_type: 'Main',
      character_type: 'human',
      age: 25,
      is_published: true,
      theme_color: '#ff0000'
    })
  });

  const createData = await createResponse.json();
  console.log('Create character response:', createData);

  if (createData.success) {
    const characterId = createData.character.id;
    
    // 3. Test character update
    console.log('\n3. Updating the test character...');
    const updateResponse = await fetch(`${baseUrl}/api/admin/characters/${characterId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify({
        name: 'Updated Test Character',
        description: 'An updated test character',
        is_published: false
      })
    });

    const updateData = await updateResponse.json();
    console.log('Update character response:', updateData);

    // 4. Delete the test character
    console.log('\n4. Deleting the test character...');
    const deleteResponse = await fetch(`${baseUrl}/api/admin/characters/${characterId}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });

    const deleteData = await deleteResponse.json();
    console.log('Delete character response:', deleteData);
  }

  console.log('\n✅ Character API testing completed!');
}

testCharacterAPI().catch(console.error);
