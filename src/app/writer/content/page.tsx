'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  id: number;
  title: string;
  slug: string;
}

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
  created_at: string;
  updated_at: string;
}

export default function WriterContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth');
      return;
    }

    if (!loading && user?.role !== 'writer' && user?.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user) {
      fetchNovels();
    }
  }, [user, loading, router]);

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
        if (data.length > 0) {
          setSelectedNovelId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchContentSections = async (novelId: number) => {
    try {
      const response = await fetch(`/api/content?novel_id=${novelId}`);
      if (response.ok) {
        const data = await response.json();
        setContentSections(data);
      }
    } catch (error) {
      console.error('Error fetching content sections:', error);
    }
  };

  useEffect(() => {
    if (selectedNovelId) {
      fetchContentSections(selectedNovelId);
    }
  }, [selectedNovelId]);

  const deleteContentSection = async (id: number) => {
    if (!confirm('Are you sure you want to delete this content section?')) {
      return;
    }

    try {
      const response = await fetch(`/api/content/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setContentSections(prev => prev.filter(section => section.id !== id));
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to delete content section');
      }
    } catch (error) {
      console.error('Error deleting content section:', error);
      alert('Failed to delete content section');
    }
  };

  const groupedSections = contentSections.reduce((acc, section) => {
    if (!acc[section.section_type]) {
      acc[section.section_type] = [];
    }
    acc[section.section_type].push(section);
    return acc;
  }, {} as Record<string, ContentSection[]>);

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading content...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Content Management</h1>
              <p className="text-gray-400">Manage world-building and about sections for your novels</p>
            </div>
            <Link
              href="/writer"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>
        </div>

        {/* Novel Selection */}
        {novels.length > 0 && (
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Novel
            </label>
            <select
              value={selectedNovelId || ''}
              onChange={(e) => setSelectedNovelId(parseInt(e.target.value))}
              className="bg-gray-800 border border-gray-700 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {novels.map((novel) => (
                <option key={novel.id} value={novel.id}>
                  {novel.title}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Content Sections */}
        {selectedNovelId && (
          <div className="space-y-8">
            {/* About Sections */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">About Sections</h2>
                <Link
                  href={`/writer/content/new?novel_id=${selectedNovelId}&section_type=about`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  + Add About Section
                </Link>
              </div>
              
              {groupedSections.about?.length > 0 ? (
                <div className="space-y-4">
                  {groupedSections.about.map((section) => (
                    <div key={section.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{section.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Key: {section.section_key} • {section.is_published ? 'Published' : 'Draft'}
                          </p>
                          <p className="text-gray-300 mt-2 line-clamp-3">
                            {section.content.substring(0, 200)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/writer/content/${section.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteContentSection(section.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No about sections found. Create your first about section to get started.
                </p>
              )}
            </div>

            {/* World Sections */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">World Sections</h2>
                <Link
                  href={`/writer/content/new?novel_id=${selectedNovelId}&section_type=world`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  + Add World Section
                </Link>
              </div>
              
              {groupedSections.world?.length > 0 ? (
                <div className="space-y-4">
                  {groupedSections.world.map((section) => (
                    <div key={section.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{section.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Key: {section.section_key} • {section.is_published ? 'Published' : 'Draft'}
                          </p>
                          <p className="text-gray-300 mt-2 line-clamp-3">
                            {section.content.substring(0, 200)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/writer/content/${section.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteContentSection(section.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No world sections found. Create your first world section to get started.
                </p>
              )}
            </div>

            {/* Region Sections */}
            <div className="bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Region Sections</h2>
                <Link
                  href={`/writer/content/new?novel_id=${selectedNovelId}&section_type=region`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
                >
                  + Add Region Section
                </Link>
              </div>
              
              {groupedSections.region?.length > 0 ? (
                <div className="space-y-4">
                  {groupedSections.region.map((section) => (
                    <div key={section.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-white">{section.title}</h3>
                          <p className="text-sm text-gray-400 mt-1">
                            Key: {section.section_key} • {section.is_published ? 'Published' : 'Draft'}
                          </p>
                          <p className="text-gray-300 mt-2 line-clamp-3">
                            {section.content.substring(0, 200)}...
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            href={`/writer/content/${section.id}/edit`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteContentSection(section.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-8">
                  No region sections found. Create your first region section to get started.
                </p>
              )}
            </div>
          </div>
        )}

        {novels.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-xl text-gray-400 mb-4">No novels found</h2>
            <p className="text-gray-500 mb-6">Create your first novel to start managing content.</p>
            <Link
              href="/writer/novels/new"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-colors"
            >
              Create Your First Novel
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
