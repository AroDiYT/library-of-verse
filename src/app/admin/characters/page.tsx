'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminCharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [formData, setFormData] = useState({
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
    is_published: false,
    sort_order: 0,
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const [filterRole, setFilterRole] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const router = useRouter();

  const roleTypes = ['MC', 'Antagonist', 'Supporting', 'Side'];
  const characterTypes = ['human', 'demon', 'fae', 'hybrid', 'other'];

  useEffect(() => {
    checkAuth();
    fetchCharacters();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        cache: 'no-store',
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        if (data.user.role !== 'admin') {
          router.push('/');
          return;
        }
        setUser(data.user);
      } else {
        router.push('/auth');
      }
    } catch (error) {
      router.push('/auth');
    }
  };

  const fetchCharacters = async () => {
    try {
      const response = await fetch('/api/admin/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacters(data.characters || []);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingCharacter 
        ? `/api/admin/characters/${editingCharacter.id}`
        : '/api/admin/characters';
      
      const method = editingCharacter ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingCharacter ? 'Character updated successfully!' : 'Character created successfully!');
        setShowEditor(false);
        setEditingCharacter(null);
        resetForm();
        fetchCharacters();
      } else {
        setMessage(data.error || 'Failed to save character');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (character: Character) => {
    setEditingCharacter(character);
    setFormData({
      name: character.name,
      description: character.description || '',
      bio: character.bio || '',
      role_type: character.role_type,
      character_type: character.character_type,
      age: character.age || '',
      occupation: character.occupation || '',
      location: character.location || '',
      personality_traits: character.personality_traits || '',
      abilities: character.abilities || '',
      relationships: character.relationships || '',
      appearance: character.appearance || '',
      backstory: character.backstory || '',
      motivation: character.motivation || '',
      theme_color: character.theme_color,
      image_url: character.image_url || '',
      is_published: character.is_published,
      sort_order: character.sort_order,
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this character?')) return;

    try {
      const response = await fetch(`/api/admin/characters/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Character deleted successfully!');
        fetchCharacters();
      } else {
        setMessage('Failed to delete character');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const togglePublished = async (character: Character) => {
    try {
      const response = await fetch(`/api/admin/characters/${character.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...character,
          is_published: !character.is_published,
        }),
      });

      if (response.ok) {
        setMessage(`Character ${!character.is_published ? 'published' : 'unpublished'} successfully!`);
        fetchCharacters();
      }
    } catch (error) {
      setMessage('Failed to update character status');
    }
  };

  const resetForm = () => {
    setFormData({
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
      is_published: false,
      sort_order: characters.length,
    });
  };

  // Helper function to insert markdown formatting
  const insertMarkdown = (before: string, after: string = '') => {
    const textarea = document.querySelector('textarea[name="content"]') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = textarea.value.substring(start, end);
      const newText = before + selectedText + after;
      const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
      
      // Update the correct field based on which textarea is focused
      const fieldName = textarea.getAttribute('data-field') || 'bio';
      setFormData({...formData, [fieldName]: newValue});
      
      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      }, 0);
    }
  };

  const filteredCharacters = characters.filter(character => {
    const roleMatch = filterRole === 'All' || character.role_type === filterRole;
    const typeMatch = filterType === 'All' || character.character_type === filterType;
    return roleMatch && typeMatch;
  });

  if (loading && !characters.length) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-red-400 mb-2">Character Management</h1>
            <p className="text-gray-300">Create, edit, and manage novel characters</p>
          </div>
          <button
            onClick={() => {
              setShowEditor(true);
              setEditingCharacter(null);
              resetForm();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Character
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') || message.includes('published') || message.includes('unpublished') ? 'bg-green-800/20 border border-green-600/20 text-green-300' : 'bg-red-800/20 border border-red-600/20 text-red-300'}`}>
            {message}
          </div>
        )}

        {showEditor ? (
          /* Character Editor */
          <div className="bg-gray-800 rounded-lg border border-red-900/20 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-red-400">
                {editingCharacter ? 'Edit Character' : 'Create New Character'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingCharacter(null);
                  setMessage('');
                }}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Character Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter character name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Role Type
                  </label>
                  <select
                    value={formData.role_type}
                    onChange={(e) => setFormData({...formData, role_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {roleTypes.map(role => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Character Type
                  </label>
                  <select
                    value={formData.character_type}
                    onChange={(e) => setFormData({...formData, character_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    {characterTypes.map(type => (
                      <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Theme Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.theme_color}
                      onChange={(e) => setFormData({...formData, theme_color: e.target.value})}
                      className="w-12 h-10 border border-gray-600 rounded bg-gray-700"
                    />
                    <input
                      type="text"
                      value={formData.theme_color}
                      onChange={(e) => setFormData({...formData, theme_color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="#ef4444"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Age
                  </label>
                  <input
                    type="text"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="e.g., 25, Ancient, Unknown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Occupation
                  </label>
                  <input
                    type="text"
                    value={formData.occupation}
                    onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter occupation or title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Where they're from or currently located"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Sort Order
                  </label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Character Image URL
                </label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="https://example.com/character-image.jpg"
                />
              </div>

              {/* Short Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Short Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Brief character description or tagline"
                />
              </div>

              {/* Continue with more detailed fields... */}
              {/* Bio/Backstory with Markdown Support */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Biography & Backstory
                  </label>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-400">Rich Text</span>
                    <button
                      type="button"
                      onClick={() => setIsMarkdownMode(!isMarkdownMode)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isMarkdownMode ? 'bg-red-600' : 'bg-gray-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isMarkdownMode ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-sm text-gray-400">Markdown</span>
                  </div>
                </div>
                
                {isMarkdownMode ? (
                  <textarea
                    name="content"
                    data-field="bio"
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                    rows={8}
                    placeholder="Write character biography in Markdown...

## Background
Character's history and origins...

## Personality
Key traits and characteristics...

**Bold text** and *italic text*
> Important quotes or dialogue"
                  />
                ) : (
                  <div className="space-y-4">
                    {/* Markdown Toolbar */}
                    <div className="bg-gray-800 p-3 rounded-t-lg border-b border-gray-600 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => insertMarkdown('**', '**')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm font-bold text-white transition-colors"
                        title="Bold"
                      >
                        <strong>B</strong>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('*', '*')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm italic text-white transition-colors"
                        title="Italic"
                      >
                        <em>I</em>
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="Heading"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('> ', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="Quote"
                      >
                        Quote
                      </button>
                    </div>
                    
                    <textarea
                      name="content"
                      data-field="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      rows={8}
                      className="w-full p-4 border border-gray-600 rounded-b-lg font-mono text-sm leading-relaxed resize-vertical bg-gray-900 text-gray-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      placeholder="Character biography, backstory, and detailed information..."
                    />
                  </div>
                )}
              </div>

              {/* Additional Character Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Personality Traits
                  </label>
                  <textarea
                    value={formData.personality_traits}
                    onChange={(e) => setFormData({...formData, personality_traits: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Key personality traits, quirks, behaviors..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Abilities & Powers
                  </label>
                  <textarea
                    value={formData.abilities}
                    onChange={(e) => setFormData({...formData, abilities: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Special abilities, magical powers, skills..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Physical Appearance
                  </label>
                  <textarea
                    value={formData.appearance}
                    onChange={(e) => setFormData({...formData, appearance: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="Physical description, clothing, distinguishing features..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Motivation & Goals
                  </label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => setFormData({...formData, motivation: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    rows={3}
                    placeholder="What drives this character, their goals and desires..."
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Relationships
                </label>
                <textarea
                  value={formData.relationships}
                  onChange={(e) => setFormData({...formData, relationships: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={4}
                  placeholder="Relationships with other characters, family, friends, enemies..."
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.is_published}
                    onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                    className="rounded border-gray-600 text-red-600 focus:ring-red-500"
                  />
                  <span className="ml-2 text-gray-300">Publish immediately</span>
                </label>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  {loading ? 'Saving...' : editingCharacter ? 'Update Character' : 'Create Character'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingCharacter(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Characters List */
          <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Role:</label>
                <select
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="All">All Roles</option>
                  {roleTypes.map(role => (
                    <option key={role} value={role}>{role}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Type:</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="All">All Types</option>
                  {characterTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg border border-red-900/20 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h2 className="text-xl font-semibold text-white">
                  All Characters ({filteredCharacters.length})
                </h2>
              </div>

              {filteredCharacters.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2m5-8a3 3 0 110-6 3 3 0 010 6m4 6c0-.656.126-1.283.356-1.857a3 3 0 00-7.12 0A1.984 1.984 0 007 18" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-300">No characters found</h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {filterRole !== 'All' || filterType !== 'All' 
                      ? 'Try adjusting your filters or create a new character.'
                      : 'Get started by creating your first character.'
                    }
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {filteredCharacters.map((character) => (
                    <div key={character.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-600"
                              style={{ backgroundColor: character.theme_color }}
                            ></div>
                            <h3 className="text-lg font-medium text-white">{character.name}</h3>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              character.role_type === 'MC' ? 'bg-red-100 text-red-800' :
                              character.role_type === 'Antagonist' ? 'bg-purple-100 text-purple-800' :
                              character.role_type === 'Supporting' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {character.role_type}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {character.character_type.charAt(0).toUpperCase() + character.character_type.slice(1)}
                            </span>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              character.is_published 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {character.is_published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          
                          {character.description && (
                            <p className="text-sm text-gray-400 mb-2">{character.description}</p>
                          )}
                          
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            {character.age && <span>Age: {character.age}</span>}
                            {character.occupation && <span>Occupation: {character.occupation}</span>}
                            {character.location && <span>Location: {character.location}</span>}
                            <span>Sort: {character.sort_order}</span>
                            <span>Created: {new Date(character.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => togglePublished(character)}
                            className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                              character.is_published
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {character.is_published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleEdit(character)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(character.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
