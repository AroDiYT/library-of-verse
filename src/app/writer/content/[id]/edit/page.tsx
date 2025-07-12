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

export default function EditContentPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const contentId = params.id as string;
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [contentSection, setContentSection] = useState<ContentSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    novel_id: '',
    section_type: 'about',
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

    if (user && contentId) {
      fetchContentSection();
      fetchNovels();
    }
  }, [user, loading, router, contentId]);

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

  const fetchContentSection = async () => {
    try {
      const response = await fetch(`/api/content/${contentId}`);
      if (response.ok) {
        const data = await response.json();
        setContentSection(data);
        setFormData({
          novel_id: data.novel_id.toString(),
          section_type: data.section_type,
          section_key: data.section_key,
          title: data.title,
          content: data.content,
          content_type: data.content_type,
          is_published: data.is_published,
          sort_order: data.sort_order
        });
      } else {
        alert('Content section not found or you do not have permission to edit it');
        router.push('/writer/content');
      }
    } catch (error) {
      console.error('Error fetching content section:', error);
      alert('Failed to load content section');
      router.push('/writer/content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/content/${contentId}`, {
        method: 'PUT',
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
        alert(errorData.error || 'Failed to update content section');
      }
    } catch (error) {
      console.error('Error updating content section:', error);
      alert('Failed to update content section');
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
            <p className="mt-4 text-gray-400">Loading content section...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!contentSection) {
    return (
      <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl text-red-400 mb-4">Content Section Not Found</h1>
            <Link
              href="/writer/content"
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Content Management
            </Link>
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
              <h1 className="text-3xl font-bold text-white mb-2">Edit Content Section</h1>
              <p className="text-gray-400">Modify your world-building or about section</p>
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
                {isSubmitting ? 'Updating...' : 'Update Section'}
              </button>
            </div>
          </form>
        </div>

        {/* Metadata */}
        <div className="mt-6 bg-gray-800 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Section Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Created:</span>
              <span className="text-gray-300 ml-2">
                {new Date(contentSection.created_at).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Last Updated:</span>
              <span className="text-gray-300 ml-2">
                {new Date(contentSection.updated_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
