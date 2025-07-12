'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  content: string;
  excerpt?: string;
  word_count: number;
  is_published: boolean;
  novel_id: number;
  author_id: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
}

export default function EditChapterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const chapterId = params.id as string;
  
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    novel_id: '',
    title: '',
    chapter_number: 1,
    content: '',
    excerpt: '',
    is_published: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

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
  }, [user, loading, router, chapterId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch chapter and novels in parallel
      const [chapterResponse, novelsResponse] = await Promise.all([
        fetch(`/api/chapters/${chapterId}`),
        fetch('/api/novels')
      ]);

      if (chapterResponse.ok) {
        const chapterData = await chapterResponse.json();
        if (chapterData.success) {
          setChapter(chapterData.chapter);
          setFormData({
            novel_id: chapterData.chapter.novel_id.toString(),
            title: chapterData.chapter.title || '',
            chapter_number: chapterData.chapter.chapter_number || 1,
            content: chapterData.chapter.content || '',
            excerpt: chapterData.chapter.excerpt || '',
            is_published: chapterData.chapter.is_published || false
          });
        }
      } else if (chapterResponse.status === 404) {
        router.push('/writer/chapters');
        return;
      }

      if (novelsResponse.ok) {
        const novelsData = await novelsResponse.json();
        setNovels(novelsData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      // Calculate word count
      const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;

      const response = await fetch(`/api/chapters/${chapterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          word_count: wordCount,
          novel_id: parseInt(formData.novel_id),
          published_at: formData.is_published ? (chapter?.published_at || new Date().toISOString()) : null
        }),
      });

      if (response.ok) {
        router.push('/writer/chapters');
      } else {
        const error = await response.json();
        if (error.error) {
          setErrors({ general: error.error });
        }
      }
    } catch (error) {
      console.error('Error updating chapter:', error);
      setErrors({ general: 'Failed to update chapter. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Chapter not found</h1>
          <Link href="/writer/chapters" className="text-purple-400 hover:text-purple-300">
            ← Back to Chapters
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Edit Chapter</h1>
            <p className="text-gray-300">Update your chapter content and settings</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/writer/chapters"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Chapters
            </Link>
            <Link 
              href={`/writer/chapters?novel_id=${formData.novel_id}`}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
            >
              View Novel Chapters
            </Link>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {errors.general && (
            <div className="bg-red-900 border border-red-600 rounded-lg p-4">
              <p className="text-red-200">{errors.general}</p>
            </div>
          )}

          {/* Chapter Details */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Chapter Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Novel *
                </label>
                <select
                  name="novel_id"
                  value={formData.novel_id}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">Select a novel</option>
                  {novels.map((novel) => (
                    <option key={novel.id} value={novel.id}>
                      {novel.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chapter Number *
                </label>
                <input
                  type="number"
                  name="chapter_number"
                  value={formData.chapter_number}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                />
                <label className="ml-2 text-sm text-gray-300">
                  Published
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Chapter Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter chapter title"
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Excerpt (Optional)
              </label>
              <textarea
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief excerpt or summary for readers..."
              />
            </div>
          </div>

          {/* Chapter Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Chapter Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{new Date(chapter.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">{new Date(chapter.updated_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Current Word Count</p>
                <p className="text-white">{chapter.word_count || 0} words</p>
              </div>
              <div>
                <p className="text-gray-400">Status</p>
                <p className="text-white">{chapter.is_published ? 'Published' : 'Draft'}</p>
              </div>
              {chapter.published_at && (
                <div>
                  <p className="text-gray-400">Published</p>
                  <p className="text-white">{new Date(chapter.published_at).toLocaleDateString()}</p>
                </div>
              )}
            </div>
          </div>

          {/* Chapter Content */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Chapter Content</h2>
              <div className="text-sm text-gray-400">
                Word count: <span className="text-white font-semibold">{wordCount}</span>
                {wordCount !== chapter.word_count && (
                  <span className="ml-2 text-yellow-400">
                    ({wordCount > chapter.word_count ? '+' : ''}{wordCount - chapter.word_count})
                  </span>
                )}
              </div>
            </div>
            
            <div className="chapter-editor">
              <MDEditor
                value={formData.content}
                onChange={(val) => setFormData(prev => ({ ...prev, content: val || '' }))}
                height={500}
                data-color-mode="dark"
                visibleDragbar={false}
                textareaProps={{
                  placeholder: 'Edit your chapter content... You can use markdown formatting!',
                }}
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link 
              href="/writer/chapters"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-green-800 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
            >
              {isSubmitting ? 'Updating Chapter...' : 'Update Chapter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
