'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  is_published: boolean;
  novel_id: number;
  word_count: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  excerpt?: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
}

function WriterChaptersContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const novelId = searchParams.get('novel_id');
  
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<string>(novelId || '');
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth');
        return;
      }
      if (user.role !== 'writer' && !user.is_admin) {
        router.push('/');
        return;
      }
      fetchData();
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (selectedNovelId) {
      fetchChapters();
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
        
        // If no novel is selected but we have novels, select the first one
        if (!selectedNovelId && novelsData.length > 0) {
          setSelectedNovelId(novelsData[0].id.toString());
        }
      }
      
      // Fetch chapters if we have a selected novel
      if (selectedNovelId) {
        await fetchChapters();
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChapters = async () => {
    if (!selectedNovelId) return;
    
    try {
      const response = await fetch(`/api/chapters?novel_id=${selectedNovelId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setChapters(data.chapters);
        }
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/chapters/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setChapters(chapters.filter(chapter => chapter.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  const togglePublishStatus = async (chapter: Chapter) => {
    try {
      const response = await fetch(`/api/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...chapter,
          is_published: !chapter.is_published,
          published_at: !chapter.is_published ? new Date().toISOString() : null
        }),
      });
      
      if (response.ok) {
        await fetchChapters(); // Refresh the list
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading chapters...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Chapters</h1>
            <p className="text-gray-300">Manage your story chapters</p>
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
                href={`/writer/chapters/new?novel_id=${selectedNovelId}`}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
              >
                Write Chapter
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

        {/* Chapters List */}
        {selectedNovelId ? (
          <>
            {chapters.length === 0 ? (
              <div className="text-center py-16">
                <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="text-2xl font-semibold text-gray-300 mb-2">No chapters yet</h3>
                <p className="text-gray-400 mb-6">Start writing your first chapter</p>
                <Link 
                  href={`/writer/chapters/new?novel_id=${selectedNovelId}`}
                  className="inline-flex items-center px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg transition-colors font-semibold"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Write First Chapter
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white">
                            Chapter {chapter.chapter_number}: {chapter.title}
                          </h3>
                          <div className="flex gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              chapter.is_published
                                ? 'bg-green-600 text-white'
                                : 'bg-gray-600 text-gray-300'
                            }`}>
                              {chapter.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                        </div>
                        
                        {chapter.excerpt && (
                          <p className="text-gray-300 mb-3 line-clamp-2">{chapter.excerpt}</p>
                        )}
                        
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                          <span>{chapter.word_count || 0} words</span>
                          <span>Created: {new Date(chapter.created_at).toLocaleDateString()}</span>
                          <span>Updated: {new Date(chapter.updated_at).toLocaleDateString()}</span>
                          {chapter.published_at && (
                            <span>Published: {new Date(chapter.published_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={() => togglePublishStatus(chapter)}
                          className={`px-3 py-2 rounded text-sm font-medium transition-colors ${
                            chapter.is_published
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {chapter.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link 
                          href={`/writer/chapters/${chapter.id}`}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => setDeleteConfirm(chapter.id)}
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
            <p className="text-gray-400 mb-6">Create a novel first before adding chapters</p>
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
              <h3 className="text-xl font-semibold text-white mb-4">Delete Chapter</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this chapter? This action cannot be undone.
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

export default function WriterChaptersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>}>
      <WriterChaptersContent />
    </Suspense>
  );
}
