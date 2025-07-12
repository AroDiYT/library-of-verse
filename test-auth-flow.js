async function testAuthFlow() {
  console.log('=== Testing Authentication Flow ===\n');
  
  try {
    // Step 1: Test accessing protected page without auth
    console.log('1. Testing protected page without authentication...');
    const protectedResponse = await fetch('http://localhost:3000/chapters');
    console.log('   Status:', protectedResponse.status);
    console.log('   Redirected to auth?', protectedResponse.url.includes('/auth'));
    
    // Step 2: Login
    console.log('\n2. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@forgedpacts.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    const cookies = loginResponse.headers.get('set-cookie');
    const sessionMatch = cookies.match(/session=([^;]+)/);
    const sessionId = sessionMatch[1];
    
    console.log('   Login successful:', loginData.success);
    console.log('   Session ID:', sessionId.substring(0, 20) + '...');
    
    // Step 3: Test accessing protected pages with auth
    console.log('\n3. Testing protected pages with authentication...');
    
    // Test chapters list
    const chaptersResponse = await fetch('http://localhost:3000/api/chapters', {
      headers: { 'Cookie': `session=${sessionId}` }
    });
    console.log('   Chapters API:', chaptersResponse.status);
    
    // Test specific chapter
    const chapterResponse = await fetch('http://localhost:3000/api/chapters/1', {
      headers: { 'Cookie': `session=${sessionId}` }
    });
    console.log('   Chapter 1 API:', chapterResponse.status);
    
    // Test auth/me multiple times to check consistency
    console.log('\n4. Testing auth consistency...');
    for (let i = 1; i <= 5; i++) {
      const authResponse = await fetch('http://localhost:3000/api/auth/me', {
        headers: { 'Cookie': `session=${sessionId}` }
      });
      const authData = await authResponse.json();
      console.log(`   Auth check ${i}:`, authResponse.status, authData.success ? 'SUCCESS' : 'FAILED');
      
      // Small delay between requests
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('\n✓ Authentication flow test completed successfully!');
    
  } catch (error) {
    console.error('✗ Test error:', error);
  }
}

testAuthFlow();
