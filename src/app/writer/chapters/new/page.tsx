'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

// Dynamically import the markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
);

interface Novel {
  id: number;
  title: string;
  slug: string;
}

function CreateChapterForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedNovelId = searchParams.get('novel_id');
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    novel_id: preselectedNovelId || '',
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
        
        // If a novel was preselected and exists, set it
        if (preselectedNovelId && data.some((n: Novel) => n.id.toString() === preselectedNovelId)) {
          setFormData(prev => ({ ...prev, novel_id: preselectedNovelId }));
          
          // Get the next chapter number for this novel
          fetchNextChapterNumber(preselectedNovelId);
        } else if (data.length > 0) {
          // Set first novel as default
          setFormData(prev => ({ ...prev, novel_id: data[0].id.toString() }));
          fetchNextChapterNumber(data[0].id.toString());
        }
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextChapterNumber = async (novelId: string) => {
    try {
      const response = await fetch(`/api/chapters?novel_id=${novelId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.chapters.length > 0) {
          const maxChapterNumber = Math.max(...data.chapters.map((c: any) => c.chapter_number));
          setFormData(prev => ({ ...prev, chapter_number: maxChapterNumber + 1 }));
        }
      }
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    if (!formData.novel_id) {
      setErrors({ novel_id: 'Please select a novel' });
      setIsSubmitting(false);
      return;
    }

    try {
      // Calculate word count
      const wordCount = formData.content.trim().split(/\s+/).length;

      const response = await fetch('/api/chapters', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          word_count: wordCount,
          novel_id: parseInt(formData.novel_id)
        }),
      });

      if (response.ok) {
        const chapter = await response.json();
        // Redirect to the writer chapters list instead of trying to edit the new chapter
        router.push('/writer/chapters?success=Chapter created successfully');
      } else {
        const error = await response.json();
        if (error.error) {
          setErrors({ general: error.error });
        }
      }
    } catch (error) {
      console.error('Error creating chapter:', error);
      setErrors({ general: 'Failed to create chapter. Please try again.' });
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

    // If novel changes, update chapter number
    if (name === 'novel_id' && value) {
      fetchNextChapterNumber(value);
    }
  };

  const wordCount = formData.content.trim().split(/\s+/).filter(word => word.length > 0).length;

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  if (novels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 text-white pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-2xl font-semibold text-gray-300 mb-2">No novels found</h3>
            <p className="text-gray-400 mb-6">You need to create a novel before you can write chapters</p>
            <Link 
              href="/writer/novels/new"
              className="inline-flex items-center px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold"
            >
              Create Novel First
            </Link>
          </div>
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
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Write New Chapter</h1>
            <p className="text-gray-300">Add a new chapter to your story</p>
          </div>
          <Link 
            href="/writer/chapters"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Chapters
          </Link>
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
                {errors.novel_id && (
                  <p className="text-red-400 text-sm mt-1">{errors.novel_id}</p>
                )}
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
                  Publish immediately
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

          {/* Chapter Content */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">Chapter Content</h2>
              <div className="text-sm text-gray-400">
                Word count: <span className="text-white font-semibold">{wordCount}</span>
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
                  placeholder: 'Start writing your chapter here... You can use markdown formatting!',
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
              {isSubmitting ? 'Creating Chapter...' : formData.is_published ? 'Create & Publish' : 'Save as Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateChapterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>}>
      <CreateChapterForm />
    </Suspense>
  );
}
