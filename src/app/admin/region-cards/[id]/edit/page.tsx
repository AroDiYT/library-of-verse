'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Novel {
  id: number;
  title: string;
  slug: string;
}

interface RegionCard {
  id: number;
  novel_id: number;
  name: string;
  description: string;
  image_url?: string;
  continent?: string;
  sort_order: number;
  theme_color: string;
  border_color: string;
  background_color: string;
  hover_color: string;
  icon: string;
  layout_style: string;
}

export default function EditRegionCardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const cardId = params.id as string;
  
  const [novels, setNovels] = useState<Novel[]>([]);
  const [regionCard, setRegionCard] = useState<RegionCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    novel_id: '',
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

    if (!loading && user?.role !== 'admin') {
      router.push('/');
      return;
    }

    if (user && cardId) {
      fetchRegionCard();
      fetchNovels();
    }
  }, [user, loading, router, cardId]);

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

  const fetchRegionCard = async () => {
    try {
      const response = await fetch(`/api/region-cards/${cardId}`);
      if (response.ok) {
        const data = await response.json();
        setRegionCard(data);
        setFormData({
          novel_id: data.novel_id.toString(),
          name: data.name,
          description: data.description,
          image_url: data.image_url || '',
          continent: data.continent || '',
          sort_order: data.sort_order || 0,
          theme_color: data.theme_color || '#ef4444',
          border_color: data.border_color || 'border-gray-700',
          background_color: data.background_color || 'bg-gray-900',
          hover_color: data.hover_color || 'hover:border-red-700/50',
          icon: data.icon || '🏔️',
          layout_style: data.layout_style || 'vertical',
        });
      }
    } catch (error) {
      console.error('Error fetching region card:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/region-cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          novel_id: parseInt(formData.novel_id),
          sort_order: parseInt(formData.sort_order.toString()) || 0
        }),
      });

      if (response.ok) {
        router.push(`/world?novel=${formData.novel_id}`);
      } else {
        alert('Failed to update region card');
      }
    } catch (error) {
      console.error('Error updating region card:', error);
      alert('Error updating region card');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this region card? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/region-cards/${cardId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push(`/world?novel=${formData.novel_id}`);
      } else {
        alert('Failed to delete region card');
      }
    } catch (error) {
      console.error('Error deleting region card:', error);
      alert('Error deleting region card');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
      </div>
    );
  }

  if (!regionCard) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Region Card Not Found</h1>
            <Link href="/admin" className="text-red-400 hover:text-red-300">
              ← Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white font-display">Edit Region Card</h1>
            <p className="text-gray-300 mt-2">Update region or location details</p>
          </div>
          <Link 
            href="/admin"
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Form */}
        <div className="bg-gray-900 rounded-lg border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Novel Selection */}
            <div>
              <label htmlFor="novel_id" className="block text-sm font-medium text-white mb-2">
                Novel *
              </label>
              <select
                id="novel_id"
                name="novel_id"
                value={formData.novel_id}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select a novel</option>
                {novels.map((novel) => (
                  <option key={novel.id} value={novel.id}>
                    {novel.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white mb-2">
                Region/Location Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                placeholder="e.g., The Shadowlands, Crimson Harbor"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Continent */}
            <div>
              <label htmlFor="continent" className="block text-sm font-medium text-white mb-2">
                Continent/Area
              </label>
              <input
                type="text"
                id="continent"
                name="continent"
                value={formData.continent}
                onChange={handleInputChange}
                placeholder="e.g., Aurenhal, Eastern Territories"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                placeholder="Describe this region, its characteristics, culture, notable features..."
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
            </div>

            {/* Image URL */}
            <div>
              <label htmlFor="image_url" className="block text-sm font-medium text-white mb-2">
                Image URL (Optional)
              </label>
              <input
                type="url"
                id="image_url"
                name="image_url"
                value={formData.image_url}
                onChange={handleInputChange}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Sort Order */}
            <div>
              <label htmlFor="sort_order" className="block text-sm font-medium text-white mb-2">
                Sort Order
              </label>
              <input
                type="number"
                id="sort_order"
                name="sort_order"
                value={formData.sort_order}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <p className="text-sm text-gray-400 mt-1">Lower numbers appear first</p>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handleDelete}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Region Card
              </button>
              
              <div className="flex space-x-4">
                <Link
                  href="/admin"
                  className="px-6 py-2 border border-gray-600 text-gray-300 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? 'Updating...' : 'Update Region Card'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
