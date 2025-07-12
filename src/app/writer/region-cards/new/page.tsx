'use client';

import { useState, useEffect, Suspense } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  id: number;
  title: string;
  slug: string;
}

function NewRegionCardForm() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const novelIdParam = searchParams.get('novel_id');
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    novel_id: novelIdParam || '',
    name: '',
    description: '',
    image_url: '',
    continent: '',
    sort_order: 0,
    theme_color: '#ef4444',
    border_color: 'border-gray-700',
    background_color: 'bg-gray-900',
    hover_color: 'hover:border-red-700/50',
    icon: '🏔️',
    layout_style: 'vertical'
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
      const response = await fetch('/api/region-cards', {
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
        router.push(`/world?novel=${formData.novel_id}`);
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Failed to create region card');
      }
    } catch (error) {
      console.error('Error creating region card:', error);
      alert('Failed to create region card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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
    <div className="min-h-screen bg-gray-900 pt-20 px-4 sm:px-6 lg:px-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Create Region Card</h1>
              <p className="text-gray-400">Add a new region or location to your world</p>
            </div>
            <Link
              href="/world"
              className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg transition-colors"
            >
              ← Back to World
            </Link>
          </div>
        </div>

        {/* Form */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
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

            {/* Region Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Region Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="e.g., Kingdom of Khonrud, The Silver Reach"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Continent */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Continent/Region Group
              </label>
              <input
                type="text"
                name="continent"
                value={formData.continent}
                onChange={handleChange}
                placeholder="e.g., Aurenhal, Venaroth"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Optional: Group this region under a larger continent or area
              </p>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={4}
                placeholder="Describe this region, its culture, geography, politics, or any notable features..."
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Image URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                name="image_url"
                value={formData.image_url}
                onChange={handleChange}
                placeholder="https://example.com/region-image.jpg"
                className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="text-sm text-gray-400 mt-1">
                Optional: Add an image to showcase this region
              </p>
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

            {/* Styling Section */}
            <div className="border-t border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">Visual Styling</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Icon
                  </label>
                  <input
                    type="text"
                    name="icon"
                    value={formData.icon}
                    onChange={handleChange}
                    placeholder="🏔️"
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Emoji or symbol to represent this region
                  </p>
                </div>

                {/* Theme Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="color"
                      name="theme_color"
                      value={formData.theme_color}
                      onChange={handleChange}
                      className="w-16 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      name="theme_color"
                      value={formData.theme_color}
                      onChange={handleChange}
                      placeholder="#ef4444"
                      className="flex-1 bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    Primary color for accents and highlights
                  </p>
                </div>

                {/* Border Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Border Style
                  </label>
                  <select
                    name="border_color"
                    value={formData.border_color}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="border-gray-700">Default Gray</option>
                    <option value="border-red-500/30">Red</option>
                    <option value="border-blue-500/30">Blue</option>
                    <option value="border-green-500/30">Green</option>
                    <option value="border-purple-500/30">Purple</option>
                    <option value="border-yellow-500/30">Yellow</option>
                    <option value="border-cyan-500/30">Cyan</option>
                  </select>
                </div>

                {/* Background Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Background Style
                  </label>
                  <select
                    name="background_color"
                    value={formData.background_color}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="bg-gray-900">Default Dark</option>
                    <option value="bg-red-900/20">Red Tint</option>
                    <option value="bg-blue-900/20">Blue Tint</option>
                    <option value="bg-green-900/20">Green Tint</option>
                    <option value="bg-purple-900/20">Purple Tint</option>
                    <option value="bg-yellow-900/20">Yellow Tint</option>
                    <option value="bg-cyan-900/20">Cyan Tint</option>
                  </select>
                </div>

                {/* Hover Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Hover Effect
                  </label>
                  <select
                    name="hover_color"
                    value={formData.hover_color}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="hover:border-red-700/50">Red Glow</option>
                    <option value="hover:border-blue-400/60">Blue Glow</option>
                    <option value="hover:border-green-400/60">Green Glow</option>
                    <option value="hover:border-purple-400/60">Purple Glow</option>
                    <option value="hover:border-yellow-400/60">Yellow Glow</option>
                    <option value="hover:border-cyan-400/60">Cyan Glow</option>
                  </select>
                </div>

                {/* Layout Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Layout Style
                  </label>
                  <select
                    name="layout_style"
                    value={formData.layout_style}
                    onChange={handleChange}
                    className="w-full bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="vertical">Vertical (Recommended)</option>
                    <option value="horizontal">Horizontal</option>
                  </select>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
                <h4 className="text-sm font-medium text-gray-300 mb-3">Preview</h4>
                <div className={`${formData.background_color} rounded-lg border ${formData.border_color} ${formData.hover_color} transition-all duration-300 p-4 max-w-sm`}>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{formData.icon}</span>
                    <h5 className="text-white font-semibold">{formData.name || 'Region Name'}</h5>
                  </div>
                  {formData.continent && (
                    <p className="text-sm text-gray-400 mb-2">{formData.continent}</p>
                  )}
                  <p className="text-gray-300 text-sm">{formData.description || 'Region description...'}</p>
                  <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-700">
                    <div 
                      className="w-8 h-1 rounded-full opacity-60"
                      style={{ backgroundColor: formData.theme_color }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-700">
              <Link
                href="/world"
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 px-6 py-2 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-purple-800 text-white px-6 py-2 rounded-lg transition-colors"
              >
                {isSubmitting ? 'Creating...' : 'Create Region Card'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function NewRegionCardPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
        <p className="mt-4 text-gray-400">Loading...</p>
      </div>
    </div>}>
      <NewRegionCardForm />
    </Suspense>
  );
}
