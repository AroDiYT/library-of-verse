'use client';

import { useState, useEffect } from 'react';
import { redirect } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import Footer from '@/components/Footer';

interface ContentSection {
  id: number;
  novel_id: number;
  section_key: string;
  title: string;
  content: string;
  content_type: string;
  section_type: string;
  is_published: boolean;
  sort_order: number;
  metadata?: string;
  created_at: string;
  updated_at: string;
}

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
  created_at: string;
  updated_at: string;
}

export default function AdminContentPage() {
  const { user, loading } = useAuth();
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number>(1);
  const [loadingContent, setLoadingContent] = useState(true);
  const [editingSection, setEditingSection] = useState<ContentSection | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filter, setFilter] = useState('all');

  const [newSection, setNewSection] = useState({
    novel_id: 1,
    section_key: '',
    title: '',
    content: '',
    content_type: 'markdown',
    section_type: 'other',
    is_published: true,
    sort_order: 0
  });

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      redirect('/auth');
    }
  }, [user, loading]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchNovels();
      fetchContentSections();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === 'admin' && selectedNovelId) {
      fetchContentSections();
    }
  }, [selectedNovelId, user]);

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    }
  };

  const fetchContentSections = async () => {
    try {
      const response = await fetch(`/api/content?novel_id=${selectedNovelId}`);
      if (response.ok) {
        const data = await response.json();
        setContentSections(data);
      }
    } catch (error) {
      console.error('Error fetching content sections:', error);
    } finally {
      setLoadingContent(false);
    }
  };

  const createSection = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSection),
      });

      if (response.ok) {
        setNewSection({
          novel_id: selectedNovelId,
          section_key: '',
          title: '',
          content: '',
          content_type: 'markdown',
          section_type: 'other',
          is_published: true,
          sort_order: 0
        });
        setShowCreateForm(false);
        fetchContentSections();
      }
    } catch (error) {
      console.error('Error creating content section:', error);
    }
  };

  const updateSection = async (section: ContentSection) => {
    try {
      const response = await fetch(`/api/content/${section.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(section),
      });

      if (response.ok) {
        fetchContentSections();
        setEditingSection(null);
      }
    } catch (error) {
      console.error('Error updating content section:', error);
    }
  };

  const deleteSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchContentSections();
      }
    } catch (error) {
      console.error('Error deleting content section:', error);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'about':
        return 'bg-blue-500';
      case 'world':
        return 'bg-green-500';
      case 'region':
        return 'bg-purple-500';
      case 'home':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredSections = contentSections.filter(section => {
    if (filter === 'all') return true;
    return section.section_type === filter;
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
            <h1 className="text-5xl font-bold text-white mb-6 font-display">Content Management</h1>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Manage all site content including About, World, Regions, and Home page sections for your novels.
            </p>
          </div>

          {/* Novel Selector */}
          <div className="mb-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-bold text-white mb-4 font-display">Select Novel</h2>
              <div className="flex items-center gap-4">
                <select
                  value={selectedNovelId}
                  onChange={(e) => setSelectedNovelId(parseInt(e.target.value))}
                  className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                >
                  {novels.map((novel) => (
                    <option key={novel.id} value={novel.id}>
                      {novel.title} ({novel.status})
                    </option>
                  ))}
                </select>
                <span className="text-gray-400">
                  Managing content for the selected novel
                </span>
              </div>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex justify-between items-center mb-8">
            <div className="flex gap-2">
              {['all', 'home', 'about', 'world', 'region', 'other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === type
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
                  {type !== 'all' && ` (${contentSections.filter(s => s.section_type === type).length})`}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Add New Section
            </button>
          </div>

          {/* Content Sections List */}
          {loadingContent ? (
            <div className="text-center text-gray-400 py-8">
              Loading content sections...
            </div>
          ) : filteredSections.length > 0 ? (
            <div className="grid gap-6">
              {filteredSections.map((section) => (
                <div key={section.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold text-white">{section.title}</h3>
                        <span className={`px-2 py-1 text-xs font-medium text-white rounded-full ${getTypeColor(section.section_type)}`}>
                          {section.section_type}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-gray-700 text-gray-300 rounded">
                          {section.content_type}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-600 text-white rounded">
                          Novel {section.novel_id}
                        </span>
                        {!section.is_published && (
                          <span className="px-2 py-1 text-xs font-medium bg-red-600 text-white rounded">
                            Unpublished
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-sm mb-2">Key: {section.section_key}</p>
                      <p className="text-gray-300 mb-3 line-clamp-3">
                        {section.content.length > 200 
                          ? section.content.substring(0, 200) + '...' 
                          : section.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span>Sort Order: {section.sort_order}</span>
                        <span>Updated: {new Date(section.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-400 py-8">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-lg">No content sections found</p>
              <p className="text-sm">Create your first content section to get started.</p>
            </div>
          )}

          {/* Create Form Modal */}
          {showCreateForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Create New Content Section</h2>
                
                <form onSubmit={createSection} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Novel
                      </label>
                      <select
                        value={newSection.novel_id}
                        onChange={(e) => setNewSection({ ...newSection, novel_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        {novels.map((novel) => (
                          <option key={novel.id} value={novel.id}>
                            {novel.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Section Key *
                      </label>
                      <input
                        type="text"
                        value={newSection.section_key}
                        onChange={(e) => setNewSection({ ...newSection, section_key: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                        placeholder="e.g., about_intro, world_overview"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={newSection.title}
                      onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Section Type *
                      </label>
                      <select
                        value={newSection.section_type}
                        onChange={(e) => setNewSection({ ...newSection, section_type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="about">About</option>
                        <option value="world">World</option>
                        <option value="region">Region</option>
                        <option value="home">Home</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Content Type
                      </label>
                      <select
                        value={newSection.content_type}
                        onChange={(e) => setNewSection({ ...newSection, content_type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                        <option value="text">Plain Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={newSection.sort_order}
                        onChange={(e) => setNewSection({ ...newSection, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Content *
                    </label>
                    <textarea
                      value={newSection.content}
                      onChange={(e) => setNewSection({ ...newSection, content: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-64"
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newSection.is_published}
                        onChange={(e) => setNewSection({ ...newSection, is_published: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-white text-sm">Published</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Create Section
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
          {editingSection && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-900 rounded-lg p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-white mb-6">Edit Content Section</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Novel
                      </label>
                      <select
                        value={editingSection.novel_id}
                        onChange={(e) => setEditingSection({ ...editingSection, novel_id: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        {novels.map((novel) => (
                          <option key={novel.id} value={novel.id}>
                            {novel.title}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Section Key
                      </label>
                      <input
                        type="text"
                        value={editingSection.section_key}
                        onChange={(e) => setEditingSection({ ...editingSection, section_key: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingSection.title}
                      onChange={(e) => setEditingSection({ ...editingSection, title: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Section Type
                      </label>
                      <select
                        value={editingSection.section_type}
                        onChange={(e) => setEditingSection({ ...editingSection, section_type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="about">About</option>
                        <option value="world">World</option>
                        <option value="region">Region</option>
                        <option value="home">Home</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Content Type
                      </label>
                      <select
                        value={editingSection.content_type}
                        onChange={(e) => setEditingSection({ ...editingSection, content_type: e.target.value })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="markdown">Markdown</option>
                        <option value="html">HTML</option>
                        <option value="text">Plain Text</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Sort Order
                      </label>
                      <input
                        type="number"
                        value={editingSection.sort_order}
                        onChange={(e) => setEditingSection({ ...editingSection, sort_order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Content
                    </label>
                    <textarea
                      value={editingSection.content}
                      onChange={(e) => setEditingSection({ ...editingSection, content: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500 h-64"
                    />
                  </div>

                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingSection.is_published}
                        onChange={(e) => setEditingSection({ ...editingSection, is_published: e.target.checked })}
                        className="mr-2"
                      />
                      <span className="text-white text-sm">Published</span>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={() => updateSection(editingSection)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => setEditingSection(null)}
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
