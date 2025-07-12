'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import NovelSelector from "@/components/NovelSelector";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  cover_image_url?: string;
  genre: string;
  status: string;
}

interface ContentSection {
  id: number;
  title: string;
  content: string;
  content_type: string;
  section_type: string;
  sort_order: number;
}

export default function About() {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovel, setSelectedNovel] = useState<Novel | null>(null);
  const [contentSections, setContentSections] = useState<ContentSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    fetchNovels();
  }, []);

  useEffect(() => {
    if (selectedNovel) {
      fetchAboutContent(selectedNovel.id);
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

  const fetchAboutContent = async (novelId: number) => {
    try {
      const response = await fetch(`/api/content?type=about&novel_id=${novelId}`);
      if (response.ok) {
        const data = await response.json();
        setContentSections(data);
      }
    } catch (error) {
      console.error('Error fetching about content:', error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'about', label: 'About the Story', icon: '📖', enabled: true },
    { id: 'author', label: 'About the Author', icon: '✍️', enabled: false },
    { id: 'world', label: 'World Building', icon: '🌍', enabled: false },
    { id: 'inspiration', label: 'Inspiration', icon: '✨', enabled: false }
  ];

  const getContentByType = (type: string) => {
    return contentSections.filter(section => 
      section.section_type === type || 
      section.title.toLowerCase().includes(type) ||
      section.title.toLowerCase().includes(type.replace('_', ' '))
    );
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header with Novel Selector */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6 font-display">About</h1>
          
          {novels.length > 1 && (
            <div className="max-w-md mx-auto mb-8">
              <NovelSelector
                novels={novels}
                selectedNovel={selectedNovel}
                onSelectNovel={setSelectedNovel}
              />
            </div>
          )}

          {selectedNovel && (
            <div className="max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4 font-display">{selectedNovel.title}</h2>
              <p className="text-xl text-gray-300 mb-6">{selectedNovel.description}</p>
              <div className="flex justify-center gap-4 text-sm">
                <span className="bg-red-900/30 text-red-300 px-3 py-1 rounded-full border border-red-700">
                  {selectedNovel.genre}
                </span>
                <span className={`px-3 py-1 rounded-full border ${
                  selectedNovel.status === 'active' 
                    ? 'bg-green-900/30 text-green-300 border-green-700'
                    : 'bg-yellow-900/30 text-yellow-300 border-yellow-700'
                }`}>
                  {selectedNovel.status.charAt(0).toUpperCase() + selectedNovel.status.slice(1)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Interactive Tabs */}
        <div className="selector-group">
          <div className="tab-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => tab.enabled && setActiveTab(tab.id)}
                disabled={!tab.enabled}
                className={`tab-button ${
                  activeTab === tab.id 
                    ? 'active' 
                    : tab.enabled 
                      ? 'inactive' 
                      : 'disabled'
                }`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {contentSections.length > 0 ? (
            <div className="space-y-8">
              {contentSections
                .filter(section => {
                  if (activeTab === 'about') return section.section_type === 'about' || section.title.toLowerCase().includes('story');
                  if (activeTab === 'author') return section.title.toLowerCase().includes('author');
                  if (activeTab === 'world') return section.title.toLowerCase().includes('world');
                  if (activeTab === 'inspiration') return section.title.toLowerCase().includes('inspiration');
                  return false;
                })
                .map((section) => (
                  <div 
                    key={section.id} 
                    className="bg-gray-900 rounded-lg p-8 border border-gray-700 hover:border-red-700/50 transition-colors"
                  >
                    <h3 className="text-2xl font-bold text-white mb-6 font-display">{section.title}</h3>
                    <div className="prose prose-lg text-gray-300 max-w-none prose-headings:text-white prose-strong:text-white prose-em:text-gray-300">
                      {section.content_type === 'markdown' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {section.content}
                        </ReactMarkdown>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: section.content }} />
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            // Fallback content organized by tabs
            <div className="space-y-8">
              {activeTab === 'about' && (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 font-display">The Story</h3>
                  <div className="prose prose-lg text-gray-300 max-w-none">
                    <p className="mb-4">
                      In a world where the ancient pacts between demons, fae, and humans are beginning to fracture, 
                      unlikely alliances must form to prevent chaos from consuming everything. This is a tale of 
                      complex characters navigating a landscape where trust is a luxury and survival demands sacrifice.
                    </p>
                    <p className="mb-4">
                      Forged Pacts explores the intricate relationships between three distinct realms, each with 
                      their own motivations, secrets, and desires. As the old agreements crumble, new bonds must 
                      be forged—but at what cost?
                    </p>
                    <p>
                      Every choice has consequences, and the line between hero and villain is written in shades of gray. 
                      This is a story where power comes with a price, and sometimes the greatest enemies make the 
                      strongest allies.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'author' && (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 font-display">About the Author</h3>
                  <div className="text-gray-300">
                    <p className="mb-4 text-lg">
                      [Author information will be added here - placeholder content for now]
                    </p>
                    <p className="mb-4">
                      A passionate storyteller with a love for dark fantasy and complex world-building, 
                      bringing years of creative writing experience to this ambitious project.
                    </p>
                    <p>
                      Currently writing new chapters weekly, crafting a narrative that explores the 
                      depths of character motivation and the consequences of power.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'world' && (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 font-display">World Building</h3>
                  <div className="text-gray-300">
                    <p className="mb-4">
                      The world of {selectedNovel?.title || 'this story'} is built on a foundation of ancient agreements 
                      and delicate balances between realms. Each domain has its own rules, inhabitants, and mysteries.
                    </p>
                    <p>
                      From the ethereal courts of the Fae to the binding contracts of Demon lords, 
                      every aspect of this world has been carefully crafted to create an immersive experience 
                      that challenges traditional fantasy conventions.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'inspiration' && (
                <div className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                  <h3 className="text-2xl font-bold text-white mb-6 font-display">Inspiration</h3>
                  <div className="text-gray-300">
                    <p className="mb-4">
                      This story draws inspiration from classical mythology, modern urban fantasy, 
                      and the timeless themes of power, responsibility, and the complexity of moral choices.
                    </p>
                    <p>
                      The narrative explores what happens when ancient powers meet modern sensibilities, 
                      and how individuals navigate systems of power that are both alluring and dangerous.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
