'use client';

import { useState, useRef, useEffect } from 'react';

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  genre: string;
  status: string;
}

interface NovelSelectorProps {
  novels: Novel[];
  selectedNovel: Novel | null;
  onSelectNovel: (novel: Novel) => void;
  className?: string;
}

export default function NovelSelector({ novels, selectedNovel, onSelectNovel, className = '' }: NovelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredNovels = novels.filter(novel =>
    novel.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (novel.description && novel.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    novel.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (novel: Novel) => {
    onSelectNovel(novel);
    setIsOpen(false);
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ongoing':
        return 'text-green-400';
      case 'completed':
        return 'text-blue-400';
      case 'hiatus':
        return 'text-yellow-400';
      case 'upcoming':
        return 'text-purple-400';
      default:
        return 'text-gray-400';
    }
  };

  if (novels.length <= 1) {
    return null;
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Novel Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-left focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors hover:bg-gray-750"
      >
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <div className="font-medium text-white truncate">
                {selectedNovel?.title || 'Select a novel'}
              </div>
              {selectedNovel && (
                <span className={`text-xs px-2 py-1 rounded-full bg-gray-700 ${getStatusColor(selectedNovel.status)}`}>
                  {selectedNovel.status}
                </span>
              )}
            </div>
            {selectedNovel?.description && (
              <div className="text-sm text-gray-400 truncate mt-1">
                {selectedNovel.description}
              </div>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-gray-700">
            <div className="relative">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search novels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                autoFocus
              />
            </div>
          </div>

          {/* Novel List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredNovels.length > 0 ? (
              filteredNovels.map((novel) => (
                <button
                  key={novel.id}
                  onClick={() => handleSelect(novel)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0 ${
                    selectedNovel?.id === novel.id ? 'bg-gray-700' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3">
                        <div className="font-medium text-white truncate">
                          {novel.title}
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full bg-gray-600 ${getStatusColor(novel.status)}`}>
                          {novel.status}
                        </span>
                      </div>
                      {novel.description && (
                        <div className="text-sm text-gray-400 mt-1 line-clamp-2">
                          {novel.description}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Genre: {novel.genre}
                      </div>
                    </div>
                    {selectedNovel?.id === novel.id && (
                      <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-gray-400">
                No novels found matching "{searchQuery}"
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
