'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

interface Message {
  id: number;
  user_id: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  admin_response: string;
  username: string;
  email: string;
  created_at: string;
}

interface WriterApplication {
  id: number;
  user_id: number;
  pen_name: string;
  writing_experience: string;
  genre_interests: string;
  sample_work: string;
  why_verse: string;
  status: string;
  username: string;
  email: string;
  created_at: string;
}

export default function AdminMessagesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [applications, setApplications] = useState<WriterApplication[]>([]);
  const [selectedTab, setSelectedTab] = useState<'messages' | 'applications'>('messages');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<WriterApplication | null>(null);
  const [response, setResponse] = useState('');
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [user, loading, router]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      
      // Fetch messages
      const messagesRes = await fetch('/api/messages', {
        credentials: 'include'
      });
      if (messagesRes.ok) {
        const messagesData = await messagesRes.json();
        setMessages(messagesData);
      }

      // Fetch writer applications
      const appsRes = await fetch('/api/writer-applications', {
        credentials: 'include'
      });
      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApplications(appsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleMarkAsRead = async (messageId: number) => {
    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: 'read' })
      });

      if (res.ok) {
        fetchData();
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleRespondToMessage = async (messageId: number) => {
    if (!response.trim()) return;

    try {
      const res = await fetch(`/api/messages/${messageId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'responded',
          admin_response: response
        })
      });

      if (res.ok) {
        setResponse('');
        setSelectedMessage(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error responding to message:', error);
    }
  };

  const handleApplicationAction = async (applicationId: number, action: 'approved' | 'rejected', notes?: string) => {
    try {
      const res = await fetch(`/api/writer-applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          status: action,
          admin_notes: notes
        })
      });

      if (res.ok) {
        setSelectedApplication(null);
        fetchData();
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  if (loading || loadingData) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <h1 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-purple-600 bg-clip-text text-transparent">
          Admin Message Board
        </h1>

        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-700">
          <button
            onClick={() => setSelectedTab('messages')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              selectedTab === 'messages'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Messages ({messages.filter(m => m.status === 'unread').length} unread)
          </button>
          <button
            onClick={() => setSelectedTab('applications')}
            className={`px-6 py-3 font-medium border-b-2 transition-colors ${
              selectedTab === 'applications'
                ? 'border-purple-500 text-purple-400'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Writer Applications ({applications.filter(a => a.status === 'pending').length} pending)
          </button>
        </div>

        {/* Messages Tab */}
        {selectedTab === 'messages' && (
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No messages yet.
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                    message.status === 'unread' 
                      ? 'border-purple-500' 
                      : message.status === 'responded' 
                        ? 'border-green-500' 
                        : 'border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{message.subject}</h3>
                      <p className="text-sm text-gray-400">
                        From: {message.username} ({message.email}) • {formatDate(message.created_at)}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded mt-2 ${
                        message.type === 'writer_application' 
                          ? 'bg-purple-600 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}>
                        {message.type.replace('_', ' ')}
                      </span>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      message.status === 'unread' 
                        ? 'bg-red-600 text-white' 
                        : message.status === 'responded' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-gray-600 text-white'
                    }`}>
                      {message.status}
                    </span>
                  </div>
                  
                  <div className="bg-gray-700 p-4 rounded mb-4">
                    <p className="text-gray-300 whitespace-pre-wrap">{message.message}</p>
                  </div>

                  {message.admin_response && (
                    <div className="bg-green-900/20 border border-green-500/30 p-4 rounded mb-4">
                      <h4 className="text-green-400 font-semibold mb-2">Admin Response:</h4>
                      <p className="text-gray-300 whitespace-pre-wrap">{message.admin_response}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {message.status === 'unread' && (
                      <button
                        onClick={() => handleMarkAsRead(message.id)}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                      >
                        Mark as Read
                      </button>
                    )}
                    
                    {message.status !== 'responded' && (
                      <button
                        onClick={() => setSelectedMessage(message)}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Writer Applications Tab */}
        {selectedTab === 'applications' && (
          <div className="space-y-4">
            {applications.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                No writer applications yet.
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app.id}
                  className={`bg-gray-800 rounded-lg p-6 border-l-4 ${
                    app.status === 'pending' 
                      ? 'border-yellow-500' 
                      : app.status === 'approved' 
                        ? 'border-green-500' 
                        : 'border-red-500'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">Writer Application: {app.pen_name}</h3>
                      <p className="text-sm text-gray-400">
                        From: {app.username} ({app.email}) • {formatDate(app.created_at)}
                      </p>
                    </div>
                    <span className={`px-3 py-1 text-xs rounded-full ${
                      app.status === 'pending' 
                        ? 'bg-yellow-600 text-white' 
                        : app.status === 'approved' 
                          ? 'bg-green-600 text-white' 
                          : 'bg-red-600 text-white'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="text-purple-400 font-semibold mb-2">Writing Experience:</h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.writing_experience}</p>
                    </div>
                    
                    <div className="bg-gray-700 p-4 rounded">
                      <h4 className="text-purple-400 font-semibold mb-2">Why Verse:</h4>
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.why_verse}</p>
                    </div>
                    
                    {app.genre_interests && (
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-purple-400 font-semibold mb-2">Genre Interests:</h4>
                        <p className="text-gray-300 text-sm">{app.genre_interests}</p>
                      </div>
                    )}
                    
                    {app.sample_work && (
                      <div className="bg-gray-700 p-4 rounded">
                        <h4 className="text-purple-400 font-semibold mb-2">Sample Work:</h4>
                        <p className="text-gray-300 text-sm whitespace-pre-wrap">{app.sample_work}</p>
                      </div>
                    )}
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApplicationAction(app.id, 'approved', 'Welcome to Verse! Your writer account has been approved.')}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => setSelectedApplication(app)}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Response Modal */}
        {selectedMessage && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Respond to: {selectedMessage.subject}</h3>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Type your response..."
                className="w-full h-32 bg-gray-700 text-white rounded p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRespondToMessage(selectedMessage.id)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
                >
                  Send Response
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reject Application Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl">
              <h3 className="text-lg font-semibold mb-4">Reject Application: {selectedApplication.pen_name}</h3>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Reason for rejection (optional)..."
                className="w-full h-32 bg-gray-700 text-white rounded p-3 mb-4 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => {
                    setSelectedApplication(null);
                    setResponse('');
                  }}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleApplicationAction(selectedApplication.id, 'rejected', response || 'Application not approved at this time.');
                    setResponse('');
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                >
                  Reject Application
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
