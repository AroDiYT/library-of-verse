async function testChapterAccess() {
  try {
    console.log('=== Testing Chapter Access ===');
    
    // Login first
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
    const cookies = loginResponse.headers.get('set-cookie');
    const sessionMatch = cookies.match(/session=([^;]+)/);
    const sessionId = sessionMatch[1];
    
    console.log('✓ Login successful, session:', sessionId.substring(0, 20) + '...');
    
    // Test each chapter
    for (let chapterId = 1; chapterId <= 3; chapterId++) {
      console.log(`\n--- Testing Chapter ${chapterId} ---`);
      
      const chapterResponse = await fetch(`http://localhost:3000/api/chapters/${chapterId}`, {
        headers: {
          'Cookie': `session=${sessionId}`
        }
      });
      
      console.log(`Status: ${chapterResponse.status}`);
      
      if (chapterResponse.status === 200) {
        const chapterData = await chapterResponse.json();
        console.log(`✓ Chapter loaded: ${chapterData.chapter.title}`);
        console.log(`  Content length: ${chapterData.chapter.content.length} chars`);
        console.log(`  Next chapter: ${chapterData.nextChapter?.title || 'None'}`);
        console.log(`  Prev chapter: ${chapterData.prevChapter?.title || 'None'}`);
      } else {
        const errorData = await chapterResponse.json();
        console.log(`✗ Error: ${JSON.stringify(errorData)}`);
      }
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testChapterAccess();
