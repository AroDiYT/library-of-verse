'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from "@/components/Footer";
import NovelSelector from "@/components/NovelSelector";

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
  sort_order: number;
  novel_id: number;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  genre: string;
  status: string;
}

export default function Characters() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [activeView, setActiveView] = useState('grid'); // 'grid' or 'cards'

  useEffect(() => {
    fetchNovels();
  }, []);

  useEffect(() => {
    if (selectedNovel) {
      fetchCharacters();
    }
  }, [selectedNovel]);

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
        if (data.length > 0) {
          setSelectedNovel(data[0]); // Select first novel by default
        }
      }
    } catch (error) {
      console.error('Error fetching novels:', error);
    }
  };

  const fetchCharacters = async () => {
    if (!selectedNovel) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/characters?novel_id=${selectedNovel.id}`);
      if (response.ok) {
        const data = await response.json();
        setCharacters(data || []);
      }
    } catch (error) {
      console.error('Failed to fetch characters:', error);
    } finally {
      setLoading(false);
    }
  };

  const characterTypes = [
    {
      type: "Demons",
      description: "Ancient beings of immense power, bound by contracts and driven by complex motivations.",
      color: "text-red-400",
      bgColor: "bg-red-900/20",
      borderColor: "border-red-700"
    },
    {
      type: "Fae",
      description: "Ethereal creatures of magic and mystery, masters of illusion and otherworldly wisdom.",
      color: "text-purple-400",
      bgColor: "bg-purple-900/20",
      borderColor: "border-purple-700"
    },
    {
      type: "Humans",
      description: "Mortal beings caught between realms, wielding determination and adaptability as their greatest weapons.",
      color: "text-blue-400",
      bgColor: "bg-blue-900/20",
      borderColor: "border-blue-700"
    },
    {
      type: "Hybrids",
      description: "Rare beings of mixed heritage, carrying the strengths and burdens of multiple realms.",
      color: "text-green-400",
      bgColor: "bg-green-900/20",
      borderColor: "border-green-700"
    }
  ];

  const roleTypes = ['MC', 'Antagonist', 'Supporting', 'Side'];
  const types = ['human', 'demon', 'fae', 'hybrid', 'other'];

  const filteredCharacters = characters.filter(character => {
    const roleMatch = selectedRole === 'All' || character.role_type === selectedRole;
    const typeMatch = selectedType === 'All' || character.character_type === selectedType;
    return roleMatch && typeMatch;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'MC': return 'bg-red-100 text-red-800';
      case 'Antagonist': return 'bg-purple-100 text-purple-800';
      case 'Supporting': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'demon': return 'bg-red-200 text-red-900';
      case 'fae': return 'bg-purple-200 text-purple-900';
      case 'human': return 'bg-blue-200 text-blue-900';
      case 'hybrid': return 'bg-green-200 text-green-900';
      default: return 'bg-gray-200 text-gray-900';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 font-display">Characters</h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Meet the complex beings who navigate between realms, each with their own motivations, secrets, and destinies intertwined.
          </p>
        </div>

        {/* Novel Selector */}
        {novels.length > 1 && (
          <div className="max-w-md mx-auto mb-8">
            <NovelSelector
              novels={novels}
              selectedNovel={selectedNovel}
              onSelectNovel={setSelectedNovel}
            />
          </div>
        )}

        {/* Character Types Overview - Only show for Forged Pacts */}
        {selectedNovel?.id === 1 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {characterTypes.map((type, index) => (
              <div 
                key={index} 
                className={`bg-gray-900 rounded-lg p-6 border ${type.borderColor} ${type.bgColor} hover:scale-105 transition-transform duration-200 cursor-pointer`}
                onClick={() => setSelectedType(type.type.toLowerCase())}
              >
                <h3 className={`text-2xl font-bold mb-3 font-display ${type.color}`}>{type.type}</h3>
                <p className="text-gray-300 font-serif">{type.description}</p>
                <div className="mt-4 text-sm text-gray-400">
                  {characters.filter(char => char.character_type === type.type.toLowerCase()).length} characters
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Controls */}
        {characters.length > 0 && (
          <div className="flex flex-wrap gap-4 items-center justify-between mb-8">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Filter by Role:</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="px-3 py-2 border border-gray-600 rounded-lg bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="All">All Types</option>
                  {types.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* View Toggle */}
            <div className="tab-group view-toggle">
              <button
                onClick={() => setActiveView('grid')}
                className={`tab-button ${activeView === 'grid' ? 'active' : 'inactive'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setActiveView('cards')}
                className={`tab-button ${activeView === 'cards' ? 'active' : 'inactive'}`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Characters Display */}
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2m5-8a3 3 0 110-6 3 3 0 010 6m4 6c0-.656.126-1.283.356-1.857a3 3 0 00-7.12 0A1.984 1.984 0 007 18" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-300">
              {characters.length === 0 ? 'Characters Coming Soon' : 'No characters found'}
            </h3>
            <p className="mt-1 text-gray-400">
              {characters.length === 0 
                ? `Character profiles for ${selectedNovel?.title || 'this novel'} will be revealed as the story unfolds.`
                : selectedRole !== 'All' || selectedType !== 'All' 
                  ? 'Try adjusting your filters.'
                  : 'Characters will appear here once they are published.'
              }
            </p>
          </div>
        ) : activeView === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCharacters.map((character) => (
              <div 
                key={character.id} 
                className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-red-700 hover:scale-105 transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedCharacter(character)}
                style={{ 
                  borderTopColor: character.theme_color,
                  borderTopWidth: '4px'
                }}
              >
                {character.image_url && (
                  <div className="aspect-w-16 aspect-h-9 overflow-hidden">
                    <img
                      src={character.image_url}
                      alt={character.name}
                      className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <div 
                      className="w-3 h-3 rounded-full animate-pulse"
                      style={{ backgroundColor: character.theme_color }}
                    ></div>
                    <h3 className="text-xl font-bold text-white group-hover:text-red-300 transition-colors">{character.name}</h3>
                  </div>
                  
                  <div className="flex gap-2 mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(character.role_type)}`}>
                      {character.role_type}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(character.character_type)}`}>
                      {character.character_type.charAt(0).toUpperCase() + character.character_type.slice(1)}
                    </span>
                  </div>

                  {character.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">{character.description}</p>
                  )}

                  <div className="space-y-1 text-xs text-gray-500">
                    {character.age && <div><strong>Age:</strong> {character.age}</div>}
                    {character.occupation && <div><strong>Occupation:</strong> {character.occupation}</div>}
                    {character.location && <div><strong>Location:</strong> {character.location}</div>}
                  </div>

                  <div className="mt-4 text-sm text-gray-400 group-hover:text-red-300 transition-colors">
                    Click to view full profile →
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List/Cards View
          <div className="space-y-6">
            {filteredCharacters.map((character) => (
              <div 
                key={character.id}
                className="bg-gray-900 rounded-lg border border-gray-700 overflow-hidden hover:border-red-700 transition-colors cursor-pointer"
                onClick={() => setSelectedCharacter(character)}
              >
                <div className="flex">
                  {character.image_url && (
                    <div className="w-32 h-32 flex-shrink-0">
                      <img
                        src={character.image_url}
                        alt={character.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: character.theme_color }}
                          ></div>
                          <h3 className="text-xl font-bold text-white">{character.name}</h3>
                        </div>
                        
                        <div className="flex gap-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(character.role_type)}`}>
                            {character.role_type}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(character.character_type)}`}>
                            {character.character_type.charAt(0).toUpperCase() + character.character_type.slice(1)}
                          </span>
                        </div>

                        {character.description && (
                          <p className="text-gray-400 text-sm mb-3">{character.description}</p>
                        )}
                      </div>
                      
                      <div className="text-right text-sm text-gray-500">
                        {character.age && <div>Age: {character.age}</div>}
                        {character.occupation && <div>{character.occupation}</div>}
                        {character.location && <div>{character.location}</div>}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Character Detail Modal */}
        {selectedCharacter && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 p-6 border-b border-gray-700 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-white">{selectedCharacter.name}</h2>
                <button
                  onClick={() => setSelectedCharacter(null)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="p-6">
                {selectedCharacter.image_url && (
                  <div className="mb-6">
                    <img
                      src={selectedCharacter.image_url}
                      alt={selectedCharacter.name}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="md:col-span-2">
                    <div className="flex gap-2 mb-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(selectedCharacter.role_type)}`}>
                        {selectedCharacter.role_type}
                      </span>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(selectedCharacter.character_type)}`}>
                        {selectedCharacter.character_type.charAt(0).toUpperCase() + selectedCharacter.character_type.slice(1)}
                      </span>
                    </div>

                    {selectedCharacter.description && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                        <p className="text-gray-300">{selectedCharacter.description}</p>
                      </div>
                    )}

                    {selectedCharacter.bio && (
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-white mb-2">Biography</h3>
                        <div className="prose prose-invert max-w-none">
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {selectedCharacter.bio}
                          </ReactMarkdown>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    {selectedCharacter.age && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300">Age</h4>
                        <p className="text-white">{selectedCharacter.age}</p>
                      </div>
                    )}
                    {selectedCharacter.occupation && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300">Occupation</h4>
                        <p className="text-white">{selectedCharacter.occupation}</p>
                      </div>
                    )}
                    {selectedCharacter.location && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-300">Location</h4>
                        <p className="text-white">{selectedCharacter.location}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {selectedCharacter.personality_traits && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Personality</h4>
                      <p className="text-gray-300">{selectedCharacter.personality_traits}</p>
                    </div>
                  )}
                  {selectedCharacter.abilities && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Abilities</h4>
                      <p className="text-gray-300">{selectedCharacter.abilities}</p>
                    </div>
                  )}
                  {selectedCharacter.appearance && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Appearance</h4>
                      <p className="text-gray-300">{selectedCharacter.appearance}</p>
                    </div>
                  )}
                  {selectedCharacter.motivation && (
                    <div>
                      <h4 className="text-lg font-semibold text-white mb-2">Motivation</h4>
                      <p className="text-gray-300">{selectedCharacter.motivation}</p>
                    </div>
                  )}
                  {selectedCharacter.relationships && (
                    <div className="md:col-span-2">
                      <h4 className="text-lg font-semibold text-white mb-2">Relationships</h4>
                      <p className="text-gray-300">{selectedCharacter.relationships}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
