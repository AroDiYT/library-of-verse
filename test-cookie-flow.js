async function testCookieFlow() {
  console.log('=== Testing Cookie Flow ===\n');
  
  try {
    // Step 1: Login and get session cookie
    console.log('1. Logging in...');
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forgedpacts.com',
        password: 'admin123'
      }),
    });

    const loginData = await loginResponse.json();
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    console.log('✓ Login successful');
    console.log('✓ Set-Cookie header:', setCookieHeader);
    
    if (!setCookieHeader) {
      console.error('✗ No Set-Cookie header received!');
      return;
    }
    
    // Extract session cookie value
    const sessionMatch = setCookieHeader.match(/session=([^;]+)/);
    if (!sessionMatch) {
      console.error('✗ No session value found in cookie!');
      return;
    }
    
    const sessionValue = sessionMatch[1];
    console.log('✓ Extracted session value:', sessionValue.substring(0, 20) + '...');
    
    // Wait a bit to simulate real browser timing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 2: Test auth/me with the session cookie
    console.log('\n2. Testing auth/me with session cookie...');
    const authResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `session=${sessionValue}`
      }
    });
    
    const authData = await authResponse.json();
    console.log('✓ Auth response status:', authResponse.status);
    console.log('✓ Auth response:', authData.success ? 'SUCCESS' : 'FAILED');
    
    if (!authData.success) {
      console.error('✗ Auth failed:', authData);
      return;
    }
    
    // Wait a bit more
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 3: Test chapter access with the same session cookie
    console.log('\n3. Testing chapter access with session cookie...');
    const chapterResponse = await fetch('http://localhost:3000/api/chapters/1', {
      headers: {
        'Cookie': `session=${sessionValue}`
      }
    });
    
    const chapterData = await chapterResponse.json();
    console.log('✓ Chapter response status:', chapterResponse.status);
    
    if (chapterResponse.status === 200) {
      console.log('✓ Chapter loaded successfully:', chapterData.chapter?.title);
    } else {
      console.error('✗ Chapter load failed:', chapterData);
    }
    
    // Wait again
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Step 4: Test auth/me again with the same session cookie
    console.log('\n4. Testing auth/me again with same session cookie...');
    const authResponse2 = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `session=${sessionValue}`
      }
    });
    
    const authData2 = await authResponse2.json();
    console.log('✓ Second auth response status:', authResponse2.status);
    console.log('✓ Second auth response:', authData2.success ? 'SUCCESS' : 'FAILED');
    
    if (!authData2.success) {
      console.error('✗ Second auth failed:', authData2);
    }
    
  } catch (error) {
    console.error('✗ Test error:', error);
  }
}

testCookieFlow();
