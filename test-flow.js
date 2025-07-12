async function testFullFlow() {
  try {
    console.log('=== Testing Full Authentication Flow ===');
    
    // First login to get session
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

    console.log('✓ Login status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('✓ Login data:', loginData.success ? 'SUCCESS' : 'FAILED');
    
    // Get session cookie
    const cookies = loginResponse.headers.get('set-cookie');
    
    if (!cookies) {
      console.error('✗ No session cookie received!');
      return;
    }
    
    // Extract session ID from cookie
    const sessionMatch = cookies.match(/session=([^;]+)/);
    if (!sessionMatch) {
      console.error('✗ No session ID found in cookie!');
      return;
    }
    
    const sessionId = sessionMatch[1];
    console.log('✓ Session ID extracted');
    
    // Test auth/me endpoint
    console.log('\n=== Testing Auth/Me Endpoint ===');
    const meResponse = await fetch('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': `session=${sessionId}`
      }
    });
    
    console.log('✓ Auth/me status:', meResponse.status);
    const meData = await meResponse.json();
    console.log('✓ Auth/me success:', meData.success);
    
    // Test chapters list endpoint
    console.log('\n=== Testing Chapters List Endpoint ===');
    const chaptersResponse = await fetch('http://localhost:3000/api/chapters', {
      headers: {
        'Cookie': `session=${sessionId}`
      }
    });
    
    console.log('✓ Chapters list status:', chaptersResponse.status);
    const chaptersData = await chaptersResponse.json();
    console.log('✓ Chapters count:', chaptersData.chapters ? chaptersData.chapters.length : 'NONE');
    
    // Test specific chapter endpoint
    if (chaptersData.chapters && chaptersData.chapters.length > 0) {
      console.log('\n=== Testing Specific Chapter Endpoint ===');
      const firstChapter = chaptersData.chapters[0];
      console.log('✓ Testing chapter ID:', firstChapter.id);
      
      const chapterResponse = await fetch(`http://localhost:3000/api/chapters/${firstChapter.id}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      });
      
      console.log('✓ Chapter status:', chapterResponse.status);
      const chapterData = await chapterResponse.json();
      
      if (chapterResponse.status === 200) {
        console.log('✓ Chapter loaded successfully');
        console.log('✓ Chapter title:', chapterData.chapter?.title);
      } else {
        console.log('✗ Chapter failed to load:', chapterData);
      }
    }
    
  } catch (error) {
    console.error('✗ Test error:', error);
  }
}

testFullFlow();
