async function testLogin() {
  try {
    console.log('Testing login...');
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@forgedpacts.com',
        password: 'admin123'
      }),
    });

    console.log('Response status:', response.status);
    const data = await response.json();
    console.log('Response data:', data);
    
    // Check if we got a session cookie
    const cookies = response.headers.get('set-cookie');
    console.log('Cookies:', cookies);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testLogin();
