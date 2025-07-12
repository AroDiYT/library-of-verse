'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';

interface Suggestion {
  id: number;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  user_id: number;
  username: string;
  created_at: string;
  votes: number;
  user_voted?: boolean;
}

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'planned' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  estimated_completion?: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: '1',
    title: 'Mobile Reading Experience',
    description: 'Optimize chapter reading for mobile devices with better typography, touch navigation, and responsive design',
    category: 'UI/UX',
    status: 'planned',
    priority: 'high',
    estimated_completion: 'Q1 2025'
  },
  {
    id: '2',
    title: 'Reading Progress Sync',
    description: 'Sync reading progress across devices and browsers with real-time updates',
    category: 'Feature',
    status: 'in_progress',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Comment System',
    description: 'Allow readers to leave comments on chapters and character profiles with threaded discussions',
    category: 'Community',
    status: 'planned',
    priority: 'high',
    estimated_completion: 'Q2 2025'
  },
  {
    id: '4',
    title: 'Dark/Light Theme Toggle',
    description: 'Add option to switch between dark and light themes with system preference detection',
    category: 'UI/UX',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q1 2025'
  },
  {
    id: '5',
    title: 'Advanced Search',
    description: 'Search through chapters, characters, and world content with filters and autocomplete',
    category: 'Feature',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q2 2025'
  },
  {
    id: '6',
    title: 'Reading Statistics Dashboard',
    description: 'Personal reading statistics and achievements for users with progress tracking',
    category: 'Analytics',
    status: 'completed',
    priority: 'medium'
  },
  {
    id: '7',
    title: 'Bookmark System',
    description: 'Allow users to bookmark favorite chapters, characters, and quotes for quick access',
    category: 'Feature',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q2 2025'
  },
  {
    id: '8',
    title: 'Email Notifications',
    description: 'Notify users about new chapters, character updates, and important announcements',
    category: 'Feature',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q3 2025'
  },
  {
    id: '9',
    title: 'Social Sharing',
    description: 'Share favorite chapters and characters on social media with custom graphics',
    category: 'Community',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q3 2025'
  },
  {
    id: '10',
    title: 'Reader Profile Customization',
    description: 'Allow users to customize their profiles with avatars, bio, reading preferences, and favorite characters',
    category: 'Feature',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q2 2025'
  },
  {
    id: '11',
    title: 'Chapter Rating System',
    description: 'Let readers rate chapters and see average ratings with detailed feedback',
    category: 'Community',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q2 2025'
  },
  {
    id: '12',
    title: 'Interactive Timeline',
    description: 'Visual timeline of story events, character arcs, and world history with clickable elements',
    category: 'Content',
    status: 'planned',
    priority: 'high',
    estimated_completion: 'Q3 2025'
  },
  {
    id: '13',
    title: 'Audio Narration',
    description: 'Add text-to-speech or professional audio narration for chapters',
    category: 'Feature',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q4 2025'
  },
  {
    id: '14',
    title: 'Character Relationship Map',
    description: 'Interactive visualization of character relationships and connections',
    category: 'Content',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q3 2025'
  },
  {
    id: '15',
    title: 'Reading Streaks & Achievements',
    description: 'Gamification with reading streaks, badges, and achievements to encourage engagement',
    category: 'Gamification',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q3 2025'
  },
  {
    id: '16',
    title: 'Offline Reading Mode',
    description: 'Download chapters for offline reading with Progressive Web App capabilities',
    category: 'Feature',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q4 2025'
  },
  {
    id: '17',
    title: 'Multi-language Support',
    description: 'Internationalization support for multiple languages with translation management',
    category: 'Feature',
    status: 'planned',
    priority: 'low',
    estimated_completion: 'Q4 2025'
  },
  {
    id: '18',
    title: 'Reading Groups & Clubs',
    description: 'Create reading groups where users can discuss chapters together with scheduled reading sessions',
    category: 'Community',
    status: 'planned',
    priority: 'medium',
    estimated_completion: 'Q4 2025'
  }
];

export default function RoadmapPage() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);
  const [newSuggestion, setNewSuggestion] = useState({
    title: '',
    description: '',
    category: 'Feature'
  });

  useEffect(() => {
    fetchSuggestions();
  }, []);

  const fetchSuggestions = async () => {
    try {
      const response = await fetch('/api/suggestions');
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSuggestion),
      });

      if (response.ok) {
        setNewSuggestion({ title: '', description: '', category: 'Feature' });
        setShowSuggestionForm(false);
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Error submitting suggestion:', error);
    }
  };

  const voteForSuggestion = async (suggestionId: number) => {
    if (!user) return;

    try {
      const response = await fetch(`/api/suggestions/${suggestionId}/vote`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchSuggestions();
      }
    } catch (error) {
      console.error('Error voting for suggestion:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-yellow-500';
      case 'planned':
        return 'bg-blue-500';
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

  return (
    <>
      <div className="min-h-screen pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold text-white mb-6 font-display">Feature Roadmap</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See what's coming next and suggest features you'd like to see. Your feedback helps shape the future of this platform.
            </p>
          </div>

          {/* Roadmap Items */}
          <section className="mb-16">
            <h2 className="text-3xl font-bold text-white mb-8 font-display">Development Roadmap</h2>
            <div className="grid gap-6">
              {roadmapItems.map((item) => (
                <div key={item.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{item.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(item.status)}`}>
                          {item.status.replace('_', ' ')}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{item.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority.toUpperCase()} PRIORITY
                        </span>
                        {item.estimated_completion && (
                          <span className="text-gray-400">
                            Est. completion: {item.estimated_completion}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* User Suggestions */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-white font-display">Community Suggestions</h2>
              {user && (
                <button
                  onClick={() => setShowSuggestionForm(!showSuggestionForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Suggest Feature
                </button>
              )}
            </div>

            {/* Suggestion Form */}
            {showSuggestionForm && user && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-8">
                <form onSubmit={submitSuggestion}>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={newSuggestion.title}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newSuggestion.description}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                      required
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-white text-sm font-medium mb-2">
                      Category
                    </label>
                    <select
                      value={newSuggestion.category}
                      onChange={(e) => setNewSuggestion({ ...newSuggestion, category: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Feature">Feature</option>
                      <option value="UI/UX">UI/UX</option>
                      <option value="Community">Community</option>
                      <option value="Analytics">Analytics</option>
                      <option value="Performance">Performance</option>
                      <option value="Content">Content</option>
                      <option value="Gamification">Gamification</option>
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Submit Suggestion
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSuggestionForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Login prompt for non-users */}
            {!user && (
              <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 mb-8 text-center">
                <p className="text-gray-300 mb-4">Want to suggest a feature?</p>
                <a
                  href="/auth"
                  className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Login to Suggest Features
                </a>
              </div>
            )}

            {/* Suggestions List */}
            {loading ? (
              <div className="text-center text-gray-400 py-8">
                Loading suggestions...
              </div>
            ) : suggestions.length > 0 ? (
              <div className="grid gap-4">
                {suggestions.map((suggestion) => (
                  <div key={suggestion.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-grow">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{suggestion.title}</h3>
                          <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                            {suggestion.category}
                          </span>
                          <span className={`px-2 py-1 text-xs font-medium text-white rounded ${getStatusColor(suggestion.status)}`}>
                            {suggestion.status}
                          </span>
                        </div>
                        <p className="text-gray-300 mb-3">{suggestion.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span>By {suggestion.username}</span>
                          <span>{new Date(suggestion.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        {user && (
                          <button
                            onClick={() => voteForSuggestion(suggestion.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                              suggestion.user_voted
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                            }`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            {suggestion.votes}
                          </button>
                        )}
                        {!user && (
                          <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                            {suggestion.votes}
                          </div>
                        )}
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
                <p className="text-lg">No suggestions yet</p>
                <p className="text-sm">Be the first to suggest a feature!</p>
              </div>
            )}
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
}
