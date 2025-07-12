'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface Character {
  id: number;
  name: string;
  description?: string;
  bio?: string;
  role_type: string;
  character_type: string;
  age?: string;
  occupation?: string;
  location?: string;
  personality_traits?: string;
  abilities?: string;
  relationships?: string;
  appearance?: string;
  backstory?: string;
  motivation?: string;
  theme_color: string;
  image_url?: string;
  is_published: boolean;
  novel_id: number;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
}

export default function EditCharacterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const characterId = params.id as string;
  
  const [character, setCharacter] = useState<Character | null>(null);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    novel_id: '',
    name: '',
    description: '',
    bio: '',
    role_type: 'Side',
    character_type: 'human',
    age: '',
    occupation: '',
    location: '',
    personality_traits: '',
    abilities: '',
    relationships: '',
    appearance: '',
    backstory: '',
    motivation: '',
    theme_color: '#ef4444',
    image_url: '',
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
  }, [user, loading, router, characterId]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch character and novels in parallel
      const [characterResponse, novelsResponse] = await Promise.all([
        fetch(`/api/characters/${characterId}`),
        fetch('/api/novels')
      ]);

      if (characterResponse.ok) {
        const characterData = await characterResponse.json();
        setCharacter(characterData);
        setFormData({
          novel_id: characterData.novel_id?.toString() || '',
          name: characterData.name || '',
          description: characterData.description || '',
          bio: characterData.bio || '',
          role_type: characterData.role_type || 'Side',
          character_type: characterData.character_type || 'human',
          age: characterData.age || '',
          occupation: characterData.occupation || '',
          location: characterData.location || '',
          personality_traits: characterData.personality_traits || '',
          abilities: characterData.abilities || '',
          relationships: characterData.relationships || '',
          appearance: characterData.appearance || '',
          backstory: characterData.backstory || '',
          motivation: characterData.motivation || '',
          theme_color: characterData.theme_color || '#ef4444',
          image_url: characterData.image_url || '',
          is_published: characterData.is_published || false
        });
      } else if (characterResponse.status === 404) {
        router.push('/writer/characters');
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
      const response = await fetch(`/api/characters/${characterId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          novel_id: parseInt(formData.novel_id)
        }),
      });

      if (response.ok) {
        router.push('/writer/characters');
      } else {
        const error = await response.json();
        if (error.error) {
          setErrors({ general: error.error });
        }
      }
    } catch (error) {
      console.error('Error updating character:', error);
      setErrors({ general: 'Failed to update character. Please try again.' });
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
          <p className="text-gray-300">Loading character...</p>
        </div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Character not found</h1>
          <Link href="/writer/characters" className="text-purple-400 hover:text-purple-300">
            ← Back to Characters
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
            <h1 className="text-4xl font-bold text-white mb-2 font-display">Edit Character</h1>
            <p className="text-gray-300">Update character details and information</p>
          </div>
          <Link 
            href="/writer/characters"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back to Characters
          </Link>
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
                  Character Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Enter character name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role Type
                </label>
                <select
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="MC">Main Character</option>
                  <option value="Antagonist">Antagonist</option>
                  <option value="Supporting">Supporting</option>
                  <option value="Side">Side Character</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Character Type
                </label>
                <select
                  name="character_type"
                  value={formData.character_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="human">Human</option>
                  <option value="demon">Demon</option>
                  <option value="fae">Fae</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Age
                </label>
                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., 25, Unknown, Ancient"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Occupation
                </label>
                <input
                  type="text"
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Warrior, Mage, Scholar"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Brief description of the character..."
              />
            </div>
          </div>

          {/* Appearance & Personality */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Appearance & Personality</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    className="w-12 h-10 rounded border border-gray-600"
                  />
                  <input
                    type="text"
                    name="theme_color"
                    value={formData.theme_color}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Image URL
                </label>
                <input
                  type="url"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://example.com/character.jpg"
                />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Physical Appearance
              </label>
              <textarea
                name="appearance"
                value={formData.appearance}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the character's physical appearance..."
              />
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Personality Traits
              </label>
              <textarea
                name="personality_traits"
                value={formData.personality_traits}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="List personality traits, quirks, habits..."
              />
            </div>
          </div>

          {/* Background & Story */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Background & Story</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Biography
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Character's full biography and background..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Backstory
                </label>
                <textarea
                  name="backstory"
                  value={formData.backstory}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Character's history and past events..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Motivation
                </label>
                <textarea
                  name="motivation"
                  value={formData.motivation}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="What drives this character? Goals, desires, fears..."
                />
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Additional Details</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Where does this character live or originate from?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Abilities & Powers
                </label>
                <textarea
                  name="abilities"
                  value={formData.abilities}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Special abilities, magical powers, skills..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationships
                </label>
                <textarea
                  name="relationships"
                  value={formData.relationships}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Relationships with other characters..."
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
          </div>

          {/* Character Info */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-semibold text-white mb-6">Character Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div>
                <p className="text-gray-400">Created</p>
                <p className="text-white">{new Date(character.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-gray-400">Last Updated</p>
                <p className="text-white">{new Date(character.updated_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <Link 
              href="/writer/characters"
              className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors font-semibold"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed rounded-lg transition-colors font-semibold"
            >
              {isSubmitting ? 'Updating Character...' : 'Update Character'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
