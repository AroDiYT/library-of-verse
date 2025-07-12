import { cookies } from 'next/headers';

export default async function DebugPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session');
  
  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
      
      <div className="space-y-6">
        <section className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Server-side Cookie Info</h2>
          <div className="space-y-2">
            <div>
              <strong>Session Cookie Present:</strong> {sessionCookie ? 'Yes' : 'No'}
            </div>
            {sessionCookie && (
              <>
                <div>
                  <strong>Session Value:</strong> {sessionCookie.value.substring(0, 20)}...
                </div>
                <div>
                  <strong>Cookie Name:</strong> {sessionCookie.name}
                </div>
              </>
            )}
          </div>
        </section>
        
        <section className="bg-gray-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Client-side Tests</h2>
          <div id="client-tests">
            <div>JavaScript tests will appear here...</div>
          </div>
        </section>
      </div>
      
      <script dangerouslySetInnerHTML={{
        __html: `
          async function runClientTests() {
            const testDiv = document.getElementById('client-tests');
            let html = '';
            
            try {
              // Test 1: Check document.cookie
              html += '<div><strong>Document Cookie:</strong> ' + (document.cookie || 'Empty') + '</div>';
              
              // Test 2: Test auth API
              html += '<div><strong>Testing auth API...</strong></div>';
              const authResponse = await fetch('/api/auth/me', { credentials: 'include' });
              const authData = await authResponse.json();
              html += '<div><strong>Auth API Status:</strong> ' + authResponse.status + '</div>';
              html += '<div><strong>Auth API Response:</strong> ' + JSON.stringify(authData) + '</div>';
              
              // Test 3: Test chapter API
              html += '<div><strong>Testing chapter API...</strong></div>';
              const chapterResponse = await fetch('/api/chapters/1', { credentials: 'include' });
              html += '<div><strong>Chapter API Status:</strong> ' + chapterResponse.status + '</div>';
              
              if (chapterResponse.status !== 200) {
                const chapterError = await chapterResponse.json();
                html += '<div><strong>Chapter API Error:</strong> ' + JSON.stringify(chapterError) + '</div>';
              } else {
                html += '<div><strong>Chapter API:</strong> Success</div>';
              }
              
            } catch (error) {
              html += '<div><strong>Error:</strong> ' + error.message + '</div>';
            }
            
            testDiv.innerHTML = html;
          }
          
          // Run tests when page loads
          if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', runClientTests);
          } else {
            runClientTests();
          }
        `
      }} />
    </div>
  );
}
