'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Character {
  id: number;
  name: string;
  description?: string;
  character_type: string;
  role_type: string;
  novel_id: number;
  is_published: boolean;
  theme_color: string;
  image_url?: string;
  created_at: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
}

export default function WriterCharactersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [characters, setCharacters] = useState<Character[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
        return;
      }
      if (user.role !== 'writer' && user.role !== 'admin') {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedNovelId) {
      fetchCharacters();
    }
  }, [selectedNovelId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch novels first
      const novelsResponse = await fetch('/api/novels');
      if (novelsResponse.ok) {
        const novelsData = await novelsResponse.json();
        setNovels(novelsData);
        
        // Select the first novel by default
        if (novelsData.length > 0) {
          setSelectedNovelId(novelsData[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCharacters = async () => {
    if (!selectedNovelId) return;
    
    try {
      const response = await fetch(`/api/characters?novel_id=${selectedNovelId}`);
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCharacters(data);
        } else {
          console.error('Characters API returned non-array:', data);
          setCharacters([]);
        }
      } else {
        console.error('Failed to fetch characters:', response.status);
        setCharacters([]);
      }
    } catch (error) {
      console.error('Error fetching characters:', error);
      setCharacters([]);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/characters/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setCharacters(characters.filter(character => character.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting character:', error);
    }
  };

  const togglePublishStatus = async (character: Character) => {
    try {
      const response = await fetch(`/api/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          is_published: !character.is_published
        }),
      });
      
      if (response.ok) {
        await fetchCharacters(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating character:', error);
    }
  };

  const getRoleTypeColor = (roleType: string) => {
    switch (roleType) {
      case 'MC': return 'bg-purple-600';
      case 'Antagonist': return 'bg-red-600';
      case 'Supporting': return 'bg-blue-600';
      case 'Side': return 'bg-gray-600';
      default: return 'bg-gray-600';
    }
  };

  const getCharacterTypeIcon = (characterType: string) => {
    switch (characterType) {
      case 'demon':
        return '👹';
      case 'fae':
        return '🧚';
      case 'human':
        return '👤';
      case 'hybrid':
        return '🔮';
      default:
        return '❓';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading characters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Characters</h1>
            <p className="text-gray-300">Manage your story characters</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/writer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
            {selectedNovelId && (
              <Link 
                href={`/writer/characters/new?novel_id=${selectedNovelId}`}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
              >
                Create Character
              </Link>
            )}
          </div>
        </div>

        {/* Novel Selector */}
        {novels.length > 0 && (
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4">Select Novel</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {novels.map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => setSelectedNovelId(novel.id.toString())}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedNovelId === novel.id.toString()
                      ? 'border-purple-500 bg-purple-900/30'
                      : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                  }`}
                >
                  <h3 className="font-semibold text-white">{novel.title}</h3>
                  <p className="text-sm text-gray-400">/{novel.slug}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Characters List */}
        {selectedNovelId ? (
          <>
            {characters.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">No characters yet</h3>
                <p className="text-gray-400 mb-6">Create your first character to bring your story to life</p>
                <Link 
                  href={`/writer/characters/new?novel_id=${selectedNovelId}`}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Create First Character
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {characters.map((character) => (
                  <div key={character.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    {/* Character Header */}
                    <div className="p-6 pb-4">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
                            style={{ backgroundColor: character.theme_color }}
                          >
                            {character.image_url ? (
                              <img 
                                src={character.image_url} 
                                alt={character.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              getCharacterTypeIcon(character.character_type)
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{character.name}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs text-white ${getRoleTypeColor(character.role_type)}`}>
                                {character.role_type}
                              </span>
                              <span className="text-xs text-gray-400 capitalize">
                                {character.character_type}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            character.is_published
                              ? 'bg-green-600 text-white'
                              : 'bg-gray-600 text-gray-300'
                          }`}>
                            {character.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                      
                      {character.description && (
                        <p className="text-gray-300 text-sm mb-4 line-clamp-3">{character.description}</p>
                      )}
                      
                      <div className="text-xs text-gray-400">
                        <p>Created: {new Date(character.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePublishStatus(character)}
                          className={`flex-1 px-3 py-2 rounded text-center text-sm font-medium transition-colors ${
                            character.is_published
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {character.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link 
                          href={`/writer/characters/${character.id}`}
                          className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-center text-sm font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(character.id)}
                          className="px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm font-medium transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No novels found</h3>
            <p className="text-gray-400 mb-6">Create a novel first before adding characters</p>
            <Link 
              href="/writer/novels/new"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Novel
            </Link>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Delete Character</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this character? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
