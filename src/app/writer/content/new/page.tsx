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

function NewContentForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    novel_id: searchParams.get('novel_id') || '',
    section_type: searchParams.get('section_type') || 'about',
    section_key: '',
    title: '',
    content: '',
    content_type: 'text',
    is_published: false,
    sort_order: 0
  });

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
        if (data.length > 0 && !formData.novel_id) {
          setFormData(prev => ({ ...prev, novel_id: data[0].id.toString() }));
        }
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          novel_id: parseInt(formData.novel_id),
          sort_order: parseInt(formData.sort_order.toString()) || 0,
        }),
      });

      if (response.ok) {
        router.push('/writer/content');
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create content section');
      }
    } catch (error) {
      console.error('Error creating content section:', error);
      alert('Failed to create content section');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Content Section</h1>
              <p className="text-gray-400">Add a new world-building or about section</p>
            </div>
            <Link
              href="/writer/content"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to Content
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Novel Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Novel *
              </label>
              <select
                name="novel_id"
                value={formData.novel_id}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Select a novel</option>
                {novels.map((novel) => (
                  <option key={novel.id} value={novel.id}>
                    {novel.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Section Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Type *
              </label>
              <select
                name="section_type"
                value={formData.section_type}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="about">About</option>
                <option value="world">World</option>
                <option value="region">Region</option>
              </select>
            </div>

            {/* Section Key */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Section Key *
              </label>
              <input
                type="text"
                name="section_key"
                value={formData.section_key}
                onChange={handleChange}
                required
                placeholder="e.g., main-character, magic-system, northern-kingdom"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                A unique identifier for this section (use lowercase letters, numbers, and hyphens)
              </p>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g., The Magic System, Main Character Background"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content *
              </label>
              <div className="markdown-editor">
                <MDEditor
                  value={formData.content}
                  onChange={(val) => setFormData(prev => ({ ...prev, content: val || '' }))}
                  height={400}
                  data-color-mode="dark"
                  visibleDragbar={false}
                  textareaProps={{
                    placeholder: 'Enter your content here. You can use markdown formatting...',
                  }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Supports markdown formatting for rich content
              </p>
            </div>

            {/* Content Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Content Type
              </label>
              <select
                name="content_type"
                value={formData.content_type}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="text">Text</option>
                <option value="markdown">Markdown</option>
                <option value="html">HTML</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Sort Order
              </label>
              <input
                type="number"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleChange}
                min="0"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Lower numbers appear first (0 = first)
              </p>
            </div>

            {/* Published Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                name="is_published"
                checked={formData.is_published}
                onChange={handleChange}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-600 rounded bg-gray-700"
              />
              <label className="ml-2 block text-sm text-gray-300">
                Publish this section (make it visible to readers)
              </label>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <Link
                href="/writer/content"
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Section'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewContentPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>}>
      <NewContentForm />
    </Suspense>
  );
}
