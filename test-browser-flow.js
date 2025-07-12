const https = require('https');
const http = require('http');

// Simple cookie jar to store cookies between requests
class CookieJar {
  constructor() {
    this.cookies = new Map();
  }
  
  extractCookies(cookieHeader) {
    if (!cookieHeader) return;
    
    const cookies = Array.isArray(cookieHeader) ? cookieHeader : [cookieHeader];
    cookies.forEach(cookie => {
      const [nameValue] = cookie.split(';');
      const [name, value] = nameValue.split('=');
      this.cookies.set(name.trim(), value.trim());
    });
  }
  
  getCookieHeader() {
    const cookieArray = [];
    for (const [name, value] of this.cookies) {
      cookieArray.push(`${name}=${value}`);
    }
    return cookieArray.join('; ');
  }
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const reqOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        ...options.headers
      }
    };
    
    const req = lib.request(reqOptions, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonData
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testBrowserFlow() {
  const cookieJar = new CookieJar();
  
  try {
    console.log('=== Testing Browser-like Flow ===\n');
    
    // Step 1: Login
    console.log('1. Logging in...');
    const loginResponse = await makeRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@forgedpacts.com',
        password: 'admin123'
      }
    });
    
    console.log(`   Login Status: ${loginResponse.status}`);
    console.log(`   Login Success: ${loginResponse.data.success}`);
    
    // Extract cookies
    cookieJar.extractCookies(loginResponse.headers['set-cookie']);
    console.log(`   Cookies extracted: ${cookieJar.getCookieHeader()}\n`);
    
    // Step 2: Check auth/me
    console.log('2. Checking auth/me...');
    const meResponse = await makeRequest('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': cookieJar.getCookieHeader()
      }
    });
    
    console.log(`   Auth/me Status: ${meResponse.status}`);
    console.log(`   Auth/me Success: ${meResponse.data.success}`);
    console.log(`   User: ${meResponse.data.user?.username}\n`);
    
    // Step 3: List chapters
    console.log('3. Listing chapters...');
    const chaptersResponse = await makeRequest('http://localhost:3000/api/chapters', {
      headers: {
        'Cookie': cookieJar.getCookieHeader()
      }
    });
    
    console.log(`   Chapters Status: ${chaptersResponse.status}`);
    console.log(`   Chapters Count: ${chaptersResponse.data.chapters?.length || 0}\n`);
    
    // Step 4: Get specific chapter
    if (chaptersResponse.data.chapters && chaptersResponse.data.chapters.length > 0) {
      const firstChapter = chaptersResponse.data.chapters[0];
      console.log(`4. Getting chapter ${firstChapter.id}...`);
      
      const chapterResponse = await makeRequest(`http://localhost:3000/api/chapters/${firstChapter.id}`, {
        headers: {
          'Cookie': cookieJar.getCookieHeader()
        }
      });
      
      console.log(`   Chapter Status: ${chapterResponse.status}`);
      console.log(`   Chapter Title: ${chapterResponse.data.chapter?.title || 'N/A'}`);
      
      if (chapterResponse.status !== 200) {
        console.log(`   Chapter Error: ${JSON.stringify(chapterResponse.data)}`);
      }
    }
    
    // Step 5: Test auth/me again after chapter access
    console.log('\n5. Re-checking auth/me after chapter access...');
    const meResponse2 = await makeRequest('http://localhost:3000/api/auth/me', {
      headers: {
        'Cookie': cookieJar.getCookieHeader()
      }
    });
    
    console.log(`   Auth/me Status: ${meResponse2.status}`);
    console.log(`   Auth/me Success: ${meResponse2.data.success}`);
    console.log(`   User: ${meResponse2.data.user?.username}\n`);
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testBrowserFlow();
