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
  created_at: string;
}

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  is_published: boolean;
  novel_id: number;
  word_count: number;
  created_at: string;
}

export default function WriterDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [recentChapters, setRecentChapters] = useState<Chapter[]>([]);
  const [stats, setStats] = useState({
    totalNovels: 0,
    totalChapters: 0,
    totalWords: 0,
    publishedChapters: 0
  });
  const [isLoading, setIsLoading] = useState(true);

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
      fetchDashboardData();
    }
  }, [user, loading, router]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      
      let novelsData: Novel[] = [];
      
      // Fetch novels
      const novelsResponse = await fetch('/api/novels');
      if (novelsResponse.ok) {
        novelsData = await novelsResponse.json();
        setNovels(novelsData);
      }

      // Fetch recent chapters
      const chaptersResponse = await fetch('/api/chapters');
      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json();
        if (chaptersData.success) {
          const chapters = chaptersData.chapters;
          setRecentChapters(chapters.slice(0, 5)); // Latest 5 chapters
          
          // Calculate stats
          const totalWords = chapters.reduce((sum: number, chapter: Chapter) => sum + (chapter.word_count || 0), 0);
          const publishedChapters = chapters.filter((chapter: Chapter) => chapter.is_published).length;
          
          setStats({
            totalNovels: novelsData.length,
            totalChapters: chapters.length,
            totalWords,
            publishedChapters
          });
        }
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4 font-display">Writer Dashboard</h1>
          <p className="text-xl text-gray-300">
            Welcome back, {user?.username}! Manage your novels and chapters.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalNovels}</p>
                <p className="text-gray-400 text-sm">Novels</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalChapters}</p>
                <p className="text-gray-400 text-sm">Total Chapters</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.publishedChapters}</p>
                <p className="text-gray-400 text-sm">Published</p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold text-white">{stats.totalWords.toLocaleString()}</p>
                <p className="text-gray-400 text-sm">Total Words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/writer/novels/new" className="bg-purple-600 hover:bg-purple-700 rounded-lg p-6 text-center transition-colors group">
            <svg className="w-12 h-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Create Novel</h3>
            <p className="text-purple-200">Start a new story</p>
          </Link>
          
          <Link href="/writer/chapters/new" className="bg-green-600 hover:bg-green-700 rounded-lg p-6 text-center transition-colors group">
            <svg className="w-12 h-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Write Chapter</h3>
            <p className="text-green-200">Add new content</p>
          </Link>
          
          <Link href="/writer/content" className="bg-orange-600 hover:bg-orange-700 rounded-lg p-6 text-center transition-colors group">
            <svg className="w-12 h-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Manage Content</h3>
            <p className="text-orange-200">World & about sections</p>
          </Link>
          
          <Link href="/writer/characters" className="bg-blue-600 hover:bg-blue-700 rounded-lg p-6 text-center transition-colors group">
            <svg className="w-12 h-12 text-white mx-auto mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h3 className="text-xl font-semibold text-white mb-2">Manage Characters</h3>
            <p className="text-blue-200">Create &amp; edit characters</p>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Your Novels */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Your Novels</h2>
              <Link href="/writer/novels" className="text-purple-400 hover:text-purple-300">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {novels.length > 0 ? (
                novels.slice(0, 3).map((novel) => (
                  <div key={novel.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">{novel.title}</h3>
                      <p className="text-sm text-gray-400">
                        Status: <span className="capitalize">{novel.status}</span>
                      </p>
                    </div>
                    <Link 
                      href={`/writer/novels/${novel.id}`}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No novels yet. Create your first novel!</p>
              )}
            </div>
          </div>

          {/* Recent Chapters */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Chapters</h2>
              <Link href="/writer/chapters" className="text-purple-400 hover:text-purple-300">
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentChapters.length > 0 ? (
                recentChapters.map((chapter) => (
                  <div key={chapter.id} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-semibold text-white">Chapter {chapter.chapter_number}: {chapter.title}</h3>
                      <p className="text-sm text-gray-400">
                        {chapter.word_count} words • {chapter.is_published ? 'Published' : 'Draft'}
                      </p>
                    </div>
                    <Link 
                      href={`/writer/chapters/${chapter.id}`}
                      className="text-purple-400 hover:text-purple-300"
                    >
                      Edit
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-8">No chapters yet. Start writing!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
