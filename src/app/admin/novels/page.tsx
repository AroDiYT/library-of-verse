'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  genre: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  author?: string;
  theme_primary_color?: string;
  theme_secondary_color?: string;
  theme_accent_color?: string;
  theme_background_color?: string;
  theme_text_color?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminNovelsPage() {
  const { user, loading } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loadingNovels, setLoadingNovels] = useState(true);
  const [editingNovel, setEditingNovel] = useState<Novel | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sortBy, setSortBy] = useState<'title' | 'sort_order' | 'created_at' | 'status'>('sort_order');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [newNovel, setNewNovel] = useState({
    title: '',
    slug: '',
    description: '',
    cover_image_url: '',
    genre: 'Dark Fantasy',
    status: 'active',
    is_featured: false,
    sort_order: 0,
    author: 'Verse',
    theme_primary_color: '#ef4444',
    theme_secondary_color: '#f97316',
    theme_accent_color: '#fbbf24',
    theme_background_color: '#0f172a',
    theme_text_color: '#f1f5f9'
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNovels();
    }
  }, [user]);

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setLoadingNovels(false);
    }
  };

  const createNovel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/novels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newNovel),
      });

      if (response.ok) {
        setNewNovel({
          title: '',
          slug: '',
          description: '',
          cover_image_url: '',
          genre: 'Dark Fantasy',
          status: 'active',
          is_featured: false,
          sort_order: 0,
          author: 'Verse',
          theme_primary_color: '#ef4444',
          theme_secondary_color: '#f97316',
          theme_accent_color: '#fbbf24',
          theme_background_color: '#0f172a',
          theme_text_color: '#f1f5f9'
        });
        setShowCreateForm(false);
        fetchNovels();
      }
    } catch (error) {
      console.error('Error creating novel:', error);
    }
  };

  const updateNovel = async (novel: Novel) => {
    try {
      const response = await fetch(`/api/novels/${novel.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(novel),
      });

      if (response.ok) {
        fetchNovels();
        setEditingNovel(null);
      }
    } catch (error) {
      console.error('Error updating novel:', error);
    }
  };

  const deleteNovel = async (id: number) => {
    if (id === 1) {
      alert('Cannot delete the default novel!');
      return;
    }

    if (!confirm('Are you sure you want to delete this novel? This will also delete all associated chapters, characters, and content.')) {
      return;
    }

    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchNovels();
      }
    } catch (error) {
      console.error('Error deleting novel:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'completed':
        return 'bg-blue-500';
      case 'hiatus':
        return 'bg-yellow-500';
      case 'draft':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const sortedNovels = () => {
    return [...novels].sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      
      switch (sortBy) {
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        case 'sort_order':
          aVal = a.sort_order;
          bVal = b.sort_order;
          break;
        case 'created_at':
          aVal = new Date(a.created_at).getTime();
          bVal = new Date(b.created_at).getTime();
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        default:
          aVal = a.sort_order;
          bVal = b.sort_order;
      }
      
      if (sortOrder === 'asc') {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });
  };

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
            <h1 className="text-5xl font-bold text-white mb-6 font-display">Novel Management</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage your novels, their metadata, and publication status.
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div className="flex items-center gap-6">
              <div className="text-white">
                <span className="text-lg">Total Novels: {novels.length}</span>
              </div>
              
              {/* Sorting Controls */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-white text-sm">Sort by:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="sort_order">Sort Order</option>
                    <option value="title">Title</option>
                    <option value="created_at">Created Date</option>
                    <option value="status">Status</option>
                  </select>
                </div>
                
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
            
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add New Novel
            </button>
          </div>

          {/* Novels List */}
          {loadingNovels ? (
            <div className="text-center text-gray-400 py-8">
              Loading novels...
            </div>
          ) : novels.length > 0 ? (
            <div className="grid gap-6">
              {sortedNovels().map((novel) => (
                <div 
                  key={novel.id} 
                  className="bg-gray-900 rounded-lg p-6 border border-gray-700 relative overflow-hidden"
                  style={{
                    background: novel.theme_background_color 
                      ? `linear-gradient(135deg, ${novel.theme_background_color}cc, #111827ee)`
                      : undefined
                  }}
                >
                  {/* Theme Preview Bar */}
                  {novel.theme_primary_color && (
                    <div className="absolute top-0 left-0 right-0 h-1 flex">
                      <div className="flex-1" style={{ backgroundColor: novel.theme_primary_color }}></div>
                      <div className="flex-1" style={{ backgroundColor: novel.theme_secondary_color }}></div>
                      <div className="flex-1" style={{ backgroundColor: novel.theme_accent_color }}></div>
                    </div>
                  )}
                  
                  <div className="flex items-start justify-between pt-2">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 
                          className="text-xl font-semibold"
                          style={{ color: novel.theme_accent_color || '#ffffff' }}
                        >
                          {novel.title}
                        </h3>
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getStatusColor(novel.status)}`}>
                          {novel.status}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded">
                          {novel.genre}
                        </span>
                        {novel.is_featured && (
                          <span className="px-2 py-1 text-xs font-medium bg-yellow-600 text-white rounded">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                        <span>Slug: {novel.slug}</span>
                        {novel.author && <span>Author: {novel.author}</span>}
                      </div>
                      
                      {novel.description && (
                        <p 
                          className="mb-3 line-clamp-2"
                          style={{ color: novel.theme_text_color || '#d1d5db' }}
                        >
                          {novel.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Sort Order: {novel.sort_order}</span>
                        <span>Created: {new Date(novel.created_at).toLocaleDateString()}</span>
                        <span>Updated: {new Date(novel.updated_at).toLocaleDateString()}</span>
                      </div>
                      
                      {/* Theme Colors Preview */}
                      {novel.theme_primary_color && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-xs text-gray-400">Theme:</span>
                          <div className="flex gap-1">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-600" 
                              style={{ backgroundColor: novel.theme_primary_color }}
                              title="Primary"
                            ></div>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-600" 
                              style={{ backgroundColor: novel.theme_secondary_color }}
                              title="Secondary"
                            ></div>
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-600" 
                              style={{ backgroundColor: novel.theme_accent_color }}
                              title="Accent"
                            ></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingNovel(novel)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      {novel.id !== 1 && (
                        <button
                          onClick={() => deleteNovel(novel.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-lg">No novels found</p>
              <p className="text-sm">Create your first novel to get started.</p>
            </div>
          )}

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Novel</h2>
                
                <form onSubmit={createNovel} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={newNovel.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setNewNovel({ 
                            ...newNovel, 
                            title,
                            slug: generateSlug(title)
                          });
                        }}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Slug *
                      </label>
                      <input
                        type="text"
                        value={newNovel.slug}
                        onChange={(e) => setNewNovel({ ...newNovel, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={newNovel.description}
                      onChange={(e) => setNewNovel({ ...newNovel, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Genre
                      </label>
                      <input
                        type="text"
                        value={newNovel.genre}
                        onChange={(e) => setNewNovel({ ...newNovel, genre: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={newNovel.status}
                        onChange={(e) => setNewNovel({ ...newNovel, status: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="hiatus">Hiatus</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={newNovel.sort_order}
                        onChange={(e) => setNewNovel({ ...newNovel, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={newNovel.cover_image_url}
                      onChange={(e) => setNewNovel({ ...newNovel, cover_image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Author
                    </label>
                    <input
                      type="text"
                      value={newNovel.author}
                      onChange={(e) => setNewNovel({ ...newNovel, author: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Theme Colors Section */}
                  <div className="border-t border-gray-700 pt-4">
                    <h3 className="text-lg font-semibold text-white mb-4">Theme Colors</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Primary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newNovel.theme_primary_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_primary_color: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-600 bg-gray-800"
                          />
                          <input
                            type="text"
                            value={newNovel.theme_primary_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_primary_color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Secondary Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newNovel.theme_secondary_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_secondary_color: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-600 bg-gray-800"
                          />
                          <input
                            type="text"
                            value={newNovel.theme_secondary_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_secondary_color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Accent Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newNovel.theme_accent_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_accent_color: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-600 bg-gray-800"
                          />
                          <input
                            type="text"
                            value={newNovel.theme_accent_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_accent_color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Background Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newNovel.theme_background_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_background_color: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-600 bg-gray-800"
                          />
                          <input
                            type="text"
                            value={newNovel.theme_background_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_background_color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">
                          Text Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={newNovel.theme_text_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_text_color: e.target.value })}
                            className="w-10 h-10 rounded border border-gray-600 bg-gray-800"
                          />
                          <input
                            type="text"
                            value={newNovel.theme_text_color}
                            onChange={(e) => setNewNovel({ ...newNovel, theme_text_color: e.target.value })}
                            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newNovel.is_featured}
                        onChange={(e) => setNewNovel({ ...newNovel, is_featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-white text-sm">Featured Novel</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Create Novel
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Edit Modal */}
          {editingNovel && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Novel</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Title
                      </label>
                      <input
                        type="text"
                        value={editingNovel.title}
                        onChange={(e) => setEditingNovel({ ...editingNovel, title: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={editingNovel.slug}
                        onChange={(e) => setEditingNovel({ ...editingNovel, slug: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Description
                    </label>
                    <textarea
                      value={editingNovel.description || ''}
                      onChange={(e) => setEditingNovel({ ...editingNovel, description: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-24"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Genre
                      </label>
                      <input
                        type="text"
                        value={editingNovel.genre}
                        onChange={(e) => setEditingNovel({ ...editingNovel, genre: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Status
                      </label>
                      <select
                        value={editingNovel.status}
                        onChange={(e) => setEditingNovel({ ...editingNovel, status: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="hiatus">Hiatus</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={editingNovel.sort_order}
                        onChange={(e) => setEditingNovel({ ...editingNovel, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Cover Image URL
                    </label>
                    <input
                      type="url"
                      value={editingNovel.cover_image_url || ''}
                      onChange={(e) => setEditingNovel({ ...editingNovel, cover_image_url: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingNovel.is_featured}
                        onChange={(e) => setEditingNovel({ ...editingNovel, is_featured: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-white text-sm">Featured Novel</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateNovel(editingNovel)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingNovel(null)}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
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
