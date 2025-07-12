'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  id: number;
  title: string;
  slug: string;
  description: string;
  status: string;
  author: string;
  genre: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export default function WriterNovelsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
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
      fetchNovels();
    }
  }, [user, loading, router]);

  const fetchNovels = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/novels/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setNovels(novels.filter(novel => novel.id !== id));
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting novel:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'hiatus': return 'bg-yellow-500';
      case 'draft': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading novels...</p>
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
            <h1 className="text-4xl font-bold text-white mb-2 font-display">My Novels</h1>
            <p className="text-gray-300">Manage your stories and their settings</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/writer"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Dashboard
            </Link>
            <Link 
              href="/writer/novels/new"
              className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              Create Novel
            </Link>
          </div>
        </div>

        {/* Novels Grid */}
        {novels.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No novels yet</h3>
            <p className="text-gray-400 mb-6">Create your first novel to start writing your story</p>
            <Link 
              href="/writer/novels/new"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create First Novel
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {novels.map((novel) => (
              <div key={novel.id} className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                {/* Novel Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">{novel.title}</h3>
                      <p className="text-sm text-gray-400">/{novel.slug}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs text-white ${getStatusColor(novel.status)}`}>
                        {novel.status}
                      </span>
                      {novel.is_featured && (
                        <span className="px-2 py-1 rounded-full text-xs bg-yellow-600 text-white">
                          Featured
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {novel.description && (
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{novel.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-400 mb-4">
                    <p>Genre: {novel.genre}</p>
                    <p>Created: {new Date(novel.created_at).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="px-6 py-4 bg-gray-750 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Link 
                      href={`/writer/novels/${novel.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-center text-sm font-medium transition-colors"
                    >
                      Edit
                    </Link>
                    <Link 
                      href={`/writer/chapters?novel_id=${novel.id}`}
                      className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-center text-sm font-medium transition-colors"
                    >
                      Chapters
                    </Link>
                    <button
                      onClick={() => setDeleteConfirm(novel.id)}
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

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-xl font-semibold text-white mb-4">Delete Novel</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete this novel? This action cannot be undone and will also delete all associated chapters and characters.
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
