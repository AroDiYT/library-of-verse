'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Footer from "@/components/Footer";

interface Chapter {
  id: number;
  novel_id: number;
  title: string;
  chapter_number: number;
  content: string;
  excerpt?: string;
  word_count?: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: number;
  title: string;
  description: string;
  author: string;
  status: string;
  cover_image?: string;
  created_at: string;
}

export default function Chapters() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Get user info (auth is handled by middleware)
      const authResponse = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (authResponse.ok) {
        const authData = await authResponse.json();
        setUser(authData.user);
      }

      // Fetch novels first
      const novelsResponse = await fetch('/api/novels', {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (novelsResponse.ok) {
        const novelsData = await novelsResponse.json();
        // The API returns novels directly as an array, not wrapped in an object
        const novelsArray = Array.isArray(novelsData) ? novelsData : [];
        setNovels(novelsArray);
        
        // Set default novel if not selected
        if (!selectedNovelId && novelsArray.length > 0) {
          const defaultNovelId = novelsArray[0].id;
          setSelectedNovelId(defaultNovelId);
          await fetchChapters(defaultNovelId);
        } else if (selectedNovelId) {
          await fetchChapters(selectedNovelId);
        }
      } else if (novelsResponse.status === 401) {
        router.push('/auth');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      router.push('/auth');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (novelId: number) => {
    try {
      const chaptersResponse = await fetch(`/api/chapters?novel_id=${novelId}`, {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (chaptersResponse.ok) {
        const chaptersData = await chaptersResponse.json();
        setChapters(chaptersData.chapters);
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleNovelChange = async (novelId: number) => {
    setSelectedNovelId(novelId);
    setLoading(true);
    await fetchChapters(novelId);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'text-green-400 bg-green-900/20 border-green-700';
      case 'draft':
        return 'text-yellow-400 bg-yellow-900/20 border-yellow-700';
      case 'planned':
        return 'text-gray-400 bg-gray-900/20 border-gray-700';
      default:
        return 'text-gray-400 bg-gray-900/20 border-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Available Now';
      case 'draft':
        return 'Writing in Progress';
      case 'planned':
        return 'Coming Soon';
      default:
        return 'Coming Soon';
    }
  };

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 font-display">Chapters</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Welcome back, {user?.username || 'Reader'}! Continue your journey through our dark fantasy worlds.
          </p>
        </div>

        {/* Novel Selector */}
        {novels.length > 1 && (
          <section className="mb-8">
            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center space-x-4">
                <label className="text-white font-semibold whitespace-nowrap">Select Novel:</label>
                <select
                  value={selectedNovelId || ''}
                  onChange={(e) => handleNovelChange(parseInt(e.target.value))}
                  className="flex-1 bg-gray-800 border border-gray-600 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  {novels.map((novel) => (
                    <option key={novel.id} value={novel.id}>
                      {novel.title} - {novel.description.substring(0, 60)}{novel.description.length > 60 ? '...' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {selectedNovelId && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{novels.find(n => n.id === selectedNovelId)?.title}</span>
                    <span className="mx-2">•</span>
                    <span>by {novels.find(n => n.id === selectedNovelId)?.author}</span>
                    <span className="mx-2">•</span>
                    <span className="capitalize">{novels.find(n => n.id === selectedNovelId)?.status}</span>
                  </div>
                  <p className="text-gray-300 text-sm mt-1">
                    {novels.find(n => n.id === selectedNovelId)?.description}
                  </p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Chapter List */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-8 font-display text-center">Available Chapters</h2>
          {chapters.length === 0 ? (
            <div className="bg-gray-900 rounded-lg p-8 border border-gray-700 text-center">
              <h3 className="text-2xl font-bold text-white mb-4 font-display">No Chapters Published Yet</h3>
              <p className="text-gray-300 font-serif">
                The author is currently working on the first chapters. Check back soon for updates!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {chapters.map((chapter) => (
                <div key={chapter.id} className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-red-600 transition-all duration-300">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-2xl font-bold text-white font-display mr-4">
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor('published')}`}>
                          Published
                        </span>
                      </div>
                      {chapter.excerpt && (
                        <p className="text-gray-300 font-serif mb-3 leading-relaxed">
                          {chapter.excerpt}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-400">
                        <span>{chapter.word_count?.toLocaleString() || '0'} words</span>
                        <span>•</span>
                        <span>{new Date(chapter.published_at || chapter.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6">
                      <a
                        href={`/chapters/${chapter.id}`}
                        className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors inline-block"
                      >
                        Read Chapter
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Reading Progress */}
        <section className="mb-16">
          <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white font-display">
                Your Reading Progress
                {selectedNovelId && novels.length > 0 && (
                  <span className="text-red-400 ml-2">
                    • {novels.find(n => n.id === selectedNovelId)?.title}
                  </span>
                )}
              </h2>
              <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-3 py-1 rounded-full border border-gray-700">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">Authenticated Reader</span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-red-400 font-display">{chapters.length}</div>
                <div className="text-sm text-gray-400">Chapters Available</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-yellow-400 font-display">0</div>
                <div className="text-sm text-gray-400">Chapters Read</div>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-400 font-display">
                  {chapters.reduce((total, chapter) => total + (chapter.word_count || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">Total Words</div>
              </div>
            </div>
          </div>
        </section>

        {/* Reading Guide */}
        <section className="mb-16">
          <h2 className="text-4xl font-bold text-white mb-8 font-display text-center">Reader's Guide</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-red-400 mb-4 font-display">Content Warnings</h3>
              <ul className="text-gray-300 font-serif space-y-2 text-sm">
                <li>• Dark fantasy themes and mature content</li>
                <li>• Violence and supernatural elements</li>
                <li>• Complex moral situations</li>
                <li>• Themes of betrayal and sacrifice</li>
              </ul>
            </div>
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-bold text-red-400 mb-4 font-display">Reading Tips</h3>
              <ul className="text-gray-300 font-serif space-y-2 text-sm">
                <li>• Each chapter builds on previous events</li>
                <li>• Pay attention to character motivations</li>
                <li>• The world details expand with each chapter</li>
                <li>• Multiple POVs reveal different perspectives</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}
