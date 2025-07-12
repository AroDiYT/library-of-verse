'use client';

import { useState, useEffect } from 'react';
import Footer from "@/components/Footer";
import NovelSelector from "@/components/NovelSelector";
import RegionCardGallery from "@/components/RegionCardGallery";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/lib/auth-context';
import Link from 'next/link';

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
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  genre: string;
  status: string;
}

interface RegionCard {
  id: number;
  novel_id: number;
  name: string;
  description: string;
  image_url?: string;
  sort_order: number;
  continent: string;
  theme_color: string;
  border_color: string;
  background_color: string;
  hover_color: string;
  icon: string;
  layout_style: string;
}

export default function World() {
  const { user } = useAuth();
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number>(1);
  const [worldContent, setWorldContent] = useState<ContentSection[]>([]);
  const [regionContent, setRegionContent] = useState<ContentSection[]>([]);
  const [regionCards, setRegionCards] = useState<RegionCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showComingSoon, setShowComingSoon] = useState(true);

  const isWriter = user?.role === 'writer' || user?.role === 'admin';

  useEffect(() => {
    fetchNovels();
  }, []);

  useEffect(() => {
    fetchContent();
  }, [selectedNovelId]);

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

  const fetchContent = async () => {
    setLoading(true);
    try {
      const [worldResponse, regionResponse, regionCardsResponse] = await Promise.all([
        fetch(`/api/content?type=world&novel_id=${selectedNovelId}`),
        fetch(`/api/content?type=region&novel_id=${selectedNovelId}`),
        fetch(`/api/region-cards?novel_id=${selectedNovelId}`)
      ]);

      if (worldResponse.ok) {
        const worldData = await worldResponse.json();
        setWorldContent(worldData);
      }

      if (regionResponse.ok) {
        const regionData = await regionResponse.json();
        setRegionContent(regionData);
      }

      if (regionCardsResponse.ok) {
        const regionCardsData = await regionCardsResponse.json();
        setRegionCards(regionCardsData);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectedNovel = novels.find(n => n.id === selectedNovelId);

  const getNovelSpecificContent = () => {
    // All content is now dynamic - no static content
    return {
      title: selectedNovel?.title ? `World of ${selectedNovel.title}` : "World",
      subtitle: "Explore the world and locations that shape this story",
      continents: []
    };
  };

  const novelContent = getNovelSpecificContent();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '🌍' },
    { id: 'regions', label: 'Regions', icon: '🗺️' },
    { id: 'lore', label: 'Lore', icon: '📜' }
  ];

  if (loading && novels.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 pb-32">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-between mb-6">
            <div></div>
            <h1 className="text-5xl font-bold text-white font-display">{novelContent.title}</h1>
            {isWriter && (
              <div className="flex gap-2">
                <Link 
                  href={`${user?.role === 'admin' ? '/admin' : '/writer'}/content?type=world&novel_id=${selectedNovelId}`}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  ✏️ Edit World
                </Link>
                <button
                  onClick={() => setShowComingSoon(!showComingSoon)}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {showComingSoon ? '👁️ Hide' : '👁️ Show'} Coming Soon
                </button>
              </div>
            )}
          </div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            {novelContent.subtitle}
          </p>

          {/* Novel Selector */}
          {novels.length > 1 && (
            <div className="max-w-md mx-auto mb-8">
              <NovelSelector
                novels={novels}
                selectedNovel={novels.find(n => n.id === selectedNovelId) || null}
                onSelectNovel={(novel) => setSelectedNovelId(novel.id)}
              />
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="selector-group">
          <div className="tab-group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`tab-button ${activeTab === tab.id ? 'active' : 'inactive'}`}
              >
                <span className="tab-icon">{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <>
            {/* World Overview */}
            {worldContent.length > 0 && (
              <section className="mb-16">
                {worldContent.map((section) => (
                  <div key={section.id} className="bg-gray-900 rounded-lg p-8 border border-gray-700 mb-8 hover:border-red-700/50 transition-colors">
                    <h2 className="text-3xl font-bold text-white mb-6 font-display">{section.title}</h2>
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
              </section>
            )}

            {/* Show "World Building in Progress" only if no static continents AND no dynamic world content */}
            {worldContent.length === 0 && (
              <section className="mb-16">
                <div className="text-center py-12">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <h3 className="text-2xl font-bold text-white">World Building in Progress</h3>
                    {isWriter && (
                      <Link 
                        href={`${user?.role === 'admin' ? '/admin' : '/writer'}/content/new?type=world&novel_id=${selectedNovelId}`}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                      >
                        + Add World Content
                      </Link>
                    )}
                  </div>
                  <p className="text-gray-400 max-w-md mx-auto">
                    The world details for {selectedNovel?.title} will be revealed as the story unfolds. Check back as new chapters are published!
                  </p>
                </div>
              </section>
            )}

            {/* Region Cards Gallery */}
            {(regionCards.length > 0 || isWriter) && (
              <section className="mb-16">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-4xl font-bold text-white font-display">Regions & Locations</h2>
                  {isWriter && (
                    <Link 
                      href={`${user?.role === 'admin' ? '/admin' : '/writer'}/region-cards/new?novel_id=${selectedNovelId}`}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                    >
                      + Add Region
                    </Link>
                  )}
                </div>
                
                <RegionCardGallery 
                  cards={regionCards}
                  isWriter={isWriter}
                  userRole={user?.role}
                  selectedNovelId={selectedNovelId}
                />
              </section>
            )}
          </>
        )}

        {activeTab === 'regions' && (
          <section>
            <h2 className="text-4xl font-bold text-white mb-8 font-display text-center">Regional Details</h2>
            {regionContent.length > 0 ? (
              <div className="space-y-8">
                {regionContent.map((region) => (
                  <div key={region.id} className="bg-gray-900 rounded-lg p-8 border border-gray-700 hover:border-red-700/50 transition-colors">
                    <h3 className="text-2xl font-bold text-white mb-4 font-display">{region.title}</h3>
                    <div className="prose prose-lg text-gray-300 max-w-none prose-headings:text-white prose-strong:text-white prose-em:text-gray-300">
                      {region.content_type === 'markdown' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {region.content}
                        </ReactMarkdown>
                      ) : (
                        <div dangerouslySetInnerHTML={{ __html: region.content }} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">Regional details for {selectedNovel?.title || 'this world'} will be added as the story expands.</p>
              </div>
            )}
          </section>
        )}

        {activeTab === 'lore' && (
          <section>
            <h2 className="text-4xl font-bold text-white mb-8 font-display text-center">Lore & Legends</h2>
            
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <div className="flex items-center justify-center gap-4 mb-4">
                <h3 className="text-2xl font-bold text-white">Lore Coming Soon</h3>
                {isWriter && (
                  <Link 
                    href={`${user?.role === 'admin' ? '/admin' : '/writer'}/content/new?type=lore&novel_id=${selectedNovelId}`}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                  >
                    + Add Lore Content
                  </Link>
                )}
              </div>
              <p className="text-gray-400 max-w-md mx-auto">
                The legends and lore for {selectedNovel?.title} will be unveiled as the narrative progresses. 
                Each chapter will add depth to this world's mythology.
              </p>
            </div>
          </section>
        )}

        {/* Coming Soon Section */}
        {showComingSoon && (
          <section className="text-center mt-16">
            <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-8 border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-white font-display">Expanding World</h3>
                {isWriter && (
                  <button
                    onClick={() => setShowComingSoon(false)}
                    className="text-gray-400 hover:text-gray-300 text-sm"
                  >
                    ✕ Hide
                  </button>
                )}
              </div>
              <p className="text-gray-300 font-serif mb-6">
                As the story progresses, detailed maps, cultural information, and historical timelines 
                will be added to bring each continent to life. 
                Discover the intricate relationships between regions and the hidden connections that span continents.
              </p>
              <div className="inline-flex items-center space-x-2 bg-gray-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-700">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-300">World details expand with each chapter</span>
              </div>
            </div>
          </section>
        )}
      </div>
      <Footer />
    </div>
  );
}
