'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  id: number;
  title: string;
  slug: string;
  description: string;
  genre: string;
  status: string;
  cover_image_url?: string;
  is_featured: boolean;
  sort_order: number;
  theme_primary_color: string;
  theme_secondary_color: string;
  theme_accent_color: string;
  theme_background_color: string;
  theme_text_color: string;
  author: string;
  author_id: number;
  created_at: string;
  updated_at: string;
}

export default function EditNovelPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const novelId = params.id as string;
  
  const [novel, setNovel] = useState<Novel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    genre: 'Dark Fantasy',
    status: 'draft',
    cover_image_url: '',
    is_featured: false,
    sort_order: 0,
    theme_primary_color: '#8b5cf6',
    theme_secondary_color: '#c084fc',
    theme_accent_color: '#a855f7',
    theme_background_color: '#1e1b4b',
    theme_text_color: '#e2e8f0'
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
      fetchNovel();
    }
  }, [user, loading, router, novelId]);

  const fetchNovel = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/novels/${novelId}`);
      if (response.ok) {
        const novelData = await response.json();
        setNovel(novelData);
        setFormData({
          title: novelData.title || '',
          slug: novelData.slug || '',
          description: novelData.description || '',
          genre: novelData.genre || 'Dark Fantasy',
          status: novelData.status || 'draft',
          cover_image_url: novelData.cover_image_url || '',
          is_featured: novelData.is_featured || false,
          sort_order: novelData.sort_order || 0,
          theme_primary_color: novelData.theme_primary_color || '#8b5cf6',
          theme_secondary_color: novelData.theme_secondary_color || '#c084fc',
          theme_accent_color: novelData.theme_accent_color || '#a855f7',
          theme_background_color: novelData.theme_background_color || '#1e1b4b',
          theme_text_color: novelData.theme_text_color || '#e2e8f0'
        });
      } else if (response.status === 404) {
        router.push('/writer/novels');
      }
    } catch (error) {
      console.error('Error fetching novel:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/writer/novels');
      } else {
        const error = await response.json();
        if (error.error) {
          setErrors({ general: error.error });
        }
      }
    } catch (error) {
      console.error('Error updating novel:', error);
      setErrors({ general: 'Failed to update novel. Please try again.' });
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
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-gray-300">Loading novel...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Novel not found</h1>
          <Link href="/writer/novels" className="text-purple-400 hover:text-purple-300">
            ← Back to Novels
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Edit Novel</h1>
            <p className="text-gray-300">Update your story settings and theme</p>
          </div>
          <div className="flex gap-4">
            <Link 
              href="/writer/novels"
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
            >
              ← Back to Novels
            </Link>
            <Link 
              href={`/writer/chapters?novel_id=${novelId}`}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition-colors"
            >
              Manage Chapters
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

          {/* Basic Information */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter novel title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  URL Slug *
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="novel-url-slug"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Genre
                </label>
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="Dark Fantasy">Dark Fantasy</option>
                  <option value="Fantasy">Fantasy</option>
                  <option value="Romance">Romance</option>
                  <option value="Sci-Fi">Sci-Fi</option>
                  <option value="Mystery">Mystery</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Horror">Horror</option>
                  <option value="Urban Fantasy">Urban Fantasy</option>
                  <option value="Historical Fiction">Historical Fiction</option>
                  <option value="Literary Fiction">Literary Fiction</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="hiatus">Hiatus</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of your novel..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Cover Image URL
              </label>
              <input
                type="url"
                name="cover_image_url"
                value={formData.cover_image_url}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com/cover.jpg"
              />
            </div>
          </div>

          {/* Theme Colors */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Theme Colors</h2>
            <p className="text-gray-300 mb-6">Customize the color scheme for your novel pages</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Primary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="theme_primary_color"
                    value={formData.theme_primary_color}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_primary_color"
                    value={formData.theme_primary_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Secondary Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="theme_secondary_color"
                    value={formData.theme_secondary_color}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_secondary_color"
                    value={formData.theme_secondary_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Accent Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="theme_accent_color"
                    value={formData.theme_accent_color}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_accent_color"
                    value={formData.theme_accent_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="theme_background_color"
                    value={formData.theme_background_color}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_background_color"
                    value={formData.theme_background_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Text Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    name="theme_text_color"
                    value={formData.theme_text_color}
                    onChange={handleChange}
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_text_color"
                    value={formData.theme_text_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Options */}
          {user?.is_admin && (
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-2xl font-semibold text-white mb-6">Advanced Options</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleChange}
                    className="w-4 h-4 text-purple-600 bg-gray-700 border-gray-600 rounded focus:ring-purple-500"
                  />
                  <label className="ml-2 text-sm text-gray-300">
                    Featured Novel
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    name="sort_order"
                    value={formData.sort_order}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Novel Stats */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Novel Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-400">Author</p>
                <p className="text-white">{novel.author}</p>
              </div>
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{new Date(novel.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">{new Date(novel.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link 
              href="/writer/novels"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
            >
              {isSubmitting ? 'Updating Novel...' : 'Update Novel'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
