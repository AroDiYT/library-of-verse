'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';

interface Suggestion {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  user_id: number;
  username: string;
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  votes: number;
}

export default function AdminSuggestionsPage() {
  const { user, loading } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchSuggestions();
    }
  }, [user]);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/admin/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const updateSuggestion = async (suggestion: Suggestion) => {
    try {
      const response = await fetch('/api/admin/suggestions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: suggestion.id,
          status: suggestion.status,
          priority: suggestion.priority,
          admin_notes: suggestion.admin_notes,
        }),
      });

      if (response.ok) {
        fetchSuggestions();
        setEditingSuggestion(null);
      }
    } catch (error) {
      console.error('Error updating suggestion:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-500';
      case 'under_review':
        return 'bg-blue-500';
      case 'approved':
        return 'bg-green-500';
      case 'implemented':
        return 'bg-purple-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const filteredSuggestions = suggestions.filter(suggestion => {
    if (filter === 'all') return true;
    return suggestion.status === filter;
  });

  if (loading || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6 font-display">Manage Suggestions</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Review and manage user feature suggestions. Update statuses, priorities, and add admin notes.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'under_review', 'approved', 'implemented', 'rejected'].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === status
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  {status !== 'all' && ` (${suggestions.filter(s => s.status === status).length})`}
                </button>
              ))}
            </div>
          </div>

          {/* Suggestions List */}
          {loadingSuggestions ? (
            <div className="text-center text-gray-400 py-8">
              Loading suggestions...
            </div>
          ) : filteredSuggestions.length > 0 ? (
            <div className="grid gap-6">
              {filteredSuggestions.map((suggestion) => (
                <div key={suggestion.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{suggestion.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(suggestion.status)}`}>
                          {suggestion.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                          {suggestion.category}
                        </span>
                        <span className={`font-medium text-sm ${getPriorityColor(suggestion.priority)}`}>
                          {suggestion.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{suggestion.description}</p>
                      {suggestion.admin_notes && (
                        <div className="bg-gray-800 p-3 rounded-lg mb-3">
                          <p className="text-sm text-gray-400 mb-1">Admin Notes:</p>
                          <p className="text-gray-300 text-sm">{suggestion.admin_notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>By {suggestion.username}</span>
                        <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                          {suggestion.votes} votes
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <button
                        onClick={() => setEditingSuggestion(suggestion)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-lg">No suggestions found</p>
              <p className="text-sm">No suggestions match the current filter.</p>
            </div>
          )}

          {/* Edit Modal */}
          {editingSuggestion && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 max-w-2xl w-full mx-4">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Suggestion</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Status
                    </label>
                    <select
                      value={editingSuggestion.status}
                      onChange={(e) => setEditingSuggestion({ ...editingSuggestion, status: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="under_review">Under Review</option>
                      <option value="approved">Approved</option>
                      <option value="implemented">Implemented</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Priority
                    </label>
                    <select
                      value={editingSuggestion.priority}
                      onChange={(e) => setEditingSuggestion({ ...editingSuggestion, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Admin Notes
                    </label>
                    <textarea
                      value={editingSuggestion.admin_notes || ''}
                      onChange={(e) => setEditingSuggestion({ ...editingSuggestion, admin_notes: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                      placeholder="Add notes about this suggestion..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => updateSuggestion(editingSuggestion)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => setEditingSuggestion(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
