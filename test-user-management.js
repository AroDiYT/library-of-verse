const baseUrl = 'http://localhost:3002';

async function testUserManagement() {
  console.log('🔧 Testing User Management Functionality...\n');

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
  console.log('Login response:', loginData);

  if (!loginData.success) {
    console.error('❌ Admin login failed');
    return;
  }

  // Extract session cookie
  const setCookieHeader = loginResponse.headers.get('set-cookie');
  const sessionCookie = setCookieHeader ? setCookieHeader.split(';')[0] : '';
  console.log('Session cookie:', sessionCookie);

  // 2. Get current users
  console.log('\n2. Fetching current users...');
  const usersResponse = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { 'Cookie': sessionCookie }
  });

  const usersData = await usersResponse.json();
  console.log('Current users:', usersData);

  // 3. Create a test user
  console.log('\n3. Creating a test user...');
  const createUserResponse = await fetch(`${baseUrl}/api/admin/users`, {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Cookie': sessionCookie 
    },
    body: JSON.stringify({
      email: 'testuser@example.com',
      username: 'testuser',
      password: 'testpass123',
      is_admin: false,
      is_active: true
    })
  });

  const createUserData = await createUserResponse.json();
  console.log('Create user response:', createUserData);

  if (createUserData.success) {
    const newUserId = createUserData.user.id;
    
    // 4. Update the user
    console.log('\n4. Updating the test user...');
    const updateUserResponse = await fetch(`${baseUrl}/api/admin/users/${newUserId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify({
        username: 'updateduser',
        is_admin: true
      })
    });

    const updateUserData = await updateUserResponse.json();
    console.log('Update user response:', updateUserData);

    // 5. Get single user details
    console.log('\n5. Getting single user details...');
    const singleUserResponse = await fetch(`${baseUrl}/api/admin/users/${newUserId}`, {
      headers: { 'Cookie': sessionCookie }
    });

    const singleUserData = await singleUserResponse.json();
    console.log('Single user details:', singleUserData);

    // 6. Demote user back to regular user
    console.log('\n6. Demoting user back to regular user...');
    const demoteResponse = await fetch(`${baseUrl}/api/admin/users/${newUserId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify({
        is_admin: false
      })
    });

    const demoteData = await demoteResponse.json();
    console.log('Demote user response:', demoteData);

    // 7. Deactivate user
    console.log('\n7. Deactivating user...');
    const deactivateResponse = await fetch(`${baseUrl}/api/admin/users/${newUserId}`, {
      method: 'PUT',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': sessionCookie 
      },
      body: JSON.stringify({
        is_active: false
      })
    });

    const deactivateData = await deactivateResponse.json();
    console.log('Deactivate user response:', deactivateData);

    // 8. Delete the test user
    console.log('\n8. Deleting the test user...');
    const deleteUserResponse = await fetch(`${baseUrl}/api/admin/users/${newUserId}`, {
      method: 'DELETE',
      headers: { 'Cookie': sessionCookie }
    });

    const deleteUserData = await deleteUserResponse.json();
    console.log('Delete user response:', deleteUserData);
  }

  // 9. Final users list
  console.log('\n9. Final users list...');
  const finalUsersResponse = await fetch(`${baseUrl}/api/admin/users`, {
    headers: { 'Cookie': sessionCookie }
  });

  const finalUsersData = await finalUsersResponse.json();
  console.log('Final users:', finalUsersData);

  console.log('\n✅ User management testing completed!');
}

testUserManagement().catch(console.error);
