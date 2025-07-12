'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Footer from "@/components/Footer";

interface Chapter {
  id: number;
  novel_id: number;
  title: string;
  chapter_number: number;
  content: string;
  excerpt?: string;
  word_count?: number;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  description: string;
  author: string;
  theme_primary_color: string;
  theme_secondary_color: string;
  theme_accent_color: string;
  theme_background_color: string;
  theme_text_color: string;
}

export default function ChapterReadPage() {
  const params = useParams();
  const router = useRouter();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [nextChapter, setNextChapter] = useState<Chapter | null>(null);
  const [prevChapter, setPrevChapter] = useState<Chapter | null>(null);
  const [isMarkdown, setIsMarkdown] = useState(false);
  const [readingWidth, setReadingWidth] = useState<'narrow' | 'medium' | 'wide'>('medium');
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [readingProgress, setReadingProgress] = useState(0);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (params.id) {
      fetchChapter();
    }
  }, [params.id]);

  useEffect(() => {
    // Reading progress bar
    const handleScroll = () => {
      const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
      const progress = Math.min(scrolled, 100);
      setReadingProgress(progress);
      
      const progressBar = document.getElementById('reading-progress');
      if (progressBar) {
        progressBar.style.width = progress + '%';
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load reading preferences from localStorage
  useEffect(() => {
    const savedWidth = localStorage.getItem('readingWidth') as 'narrow' | 'medium' | 'wide';
    const savedFontSize = localStorage.getItem('fontSize') as 'small' | 'medium' | 'large';
    
    if (savedWidth) setReadingWidth(savedWidth);
    if (savedFontSize) setFontSize(savedFontSize);
  }, []);

  const fetchChapter = async () => {
    try {
      // Fetch the chapter (auth is handled by middleware)
      const response = await fetch(`/api/chapters/${params.id}`, {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (response.status === 401) {
        // Session expired, redirect to auth
        router.push('/auth');
        return;
      }
      
      if (response.ok) {
        const data = await response.json();
        setChapter(data.chapter);
        setNextChapter(data.nextChapter);
        setPrevChapter(data.prevChapter);
        
        // Fetch novel data for theming
        if (data.chapter.novel_id) {
          await fetchNovel(data.chapter.novel_id);
        }
        
        // Detect if content is markdown (simple heuristic)
        const content = data.chapter.content;
        const hasMarkdownSyntax = content.includes('# ') || content.includes('## ') || 
                                 content.includes('**') || content.includes('*') ||
                                 content.includes('> ') || content.includes('```');
        setIsMarkdown(hasMarkdownSyntax && !content.includes('<p>') && !content.includes('<div>'));
      } else if (response.status === 404) {
        setError('Chapter not found');
      } else {
        setError('Failed to load chapter');
      }
    } catch (error) {
      setError('Failed to load chapter');
    } finally {
      setLoading(false);
    }
  };

  const fetchNovel = async (novelId: number) => {
    try {
      const response = await fetch(`/api/novels/${novelId}`, {
        cache: 'no-store',
        credentials: 'include'
      });
      
      if (response.ok) {
        const novelData = await response.json();
        setNovel(novelData);
      }
    } catch (error) {
      console.error('Error fetching novel:', error);
    }
  };

  const updateReadingWidth = (width: 'narrow' | 'medium' | 'wide') => {
    setReadingWidth(width);
    localStorage.setItem('readingWidth', width);
  };

  const updateFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
    setForceUpdate(prev => prev + 1); // Force re-render
  };

  const formatReadingTime = (wordCount: number) => {
    const wordsPerMinute = 200;
    const minutes = Math.ceil(wordCount / wordsPerMinute);
    return `${minutes} min read`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get default Verse theme (purple/magic theme)
  const getDefaultTheme = () => ({
    theme_primary_color: '#8b5cf6',
    theme_secondary_color: '#c084fc', 
    theme_accent_color: '#a855f7',
    theme_background_color: '#1e1b4b',
    theme_text_color: '#e2e8f0'
  });

  // Get CSS custom properties for novel theme
  const getThemeStyles = () => {
    const theme = novel || getDefaultTheme();
    
    return {
      '--theme-primary': theme.theme_primary_color,
      '--theme-secondary': theme.theme_secondary_color,
      '--theme-accent': theme.theme_accent_color,
      '--theme-background': theme.theme_background_color,
      '--theme-text': theme.theme_text_color,
    } as React.CSSProperties;
  };

  const getWidthClass = () => {
    switch (readingWidth) {
      case 'narrow': return 'max-w-2xl';
      case 'wide': return 'max-w-7xl';
      default: return 'max-w-5xl';
    }
  };

  const getContentWidthStyle = () => {
    switch (readingWidth) {
      case 'narrow': return { maxWidth: '60ch' };
      case 'wide': return { maxWidth: 'none' };
      default: return { maxWidth: '75ch' };
    }
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return 'text-sm md:text-base';
      case 'large': return 'text-lg md:text-xl lg:text-2xl';
      default: return 'text-base md:text-lg';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
        </div>
      </div>
    );
  }

  if (error || !chapter) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-20 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-400 mb-4">{error || 'Chapter not found'}</h1>
          <button
            onClick={() => router.push('/chapters')}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
          >
            Back to Chapters
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen text-white"
      style={{
        background: novel 
          ? `linear-gradient(135deg, ${novel.theme_background_color}cc, ${novel.theme_primary_color}1a)`
          : 'linear-gradient(135deg, #1e1b4bcc, #8b5cf61a)', // Purple magic theme
        color: novel?.theme_text_color || '#e2e8f0',
        ...getThemeStyles()
      }}
    >
      {/* Sticky Header with Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-gray-700/50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/chapters')}
                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </button>            <div className="text-sm">
              <span style={{ color: (novel || getDefaultTheme()).theme_accent_color }} className="font-semibold">
                {novel?.title || 'Verse Collection'}
              </span><span className="text-gray-400 mx-2">•</span>
              <span>Chapter {chapter.chapter_number}: {chapter.title}</span>
            </div>
          </div>
          
          {/* Reading Controls */}
          <div className="flex items-center gap-4">
            {/* Font Size */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateFontSize('small')}
                className={`px-2 py-1 text-xs rounded ${fontSize === 'small' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('medium')}
                className={`px-2 py-1 text-sm rounded ${fontSize === 'medium' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                A
              </button>
              <button
                onClick={() => updateFontSize('large')}
                className={`px-2 py-1 text-base rounded ${fontSize === 'large' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                A
              </button>
            </div>
            
            {/* Width Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => updateReadingWidth('narrow')}
                className={`px-2 py-1 text-xs rounded ${readingWidth === 'narrow' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                ▐▌
              </button>
              <button
                onClick={() => updateReadingWidth('medium')}
                className={`px-2 py-1 text-xs rounded ${readingWidth === 'medium' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                ▐▐▌
              </button>
              <button
                onClick={() => updateReadingWidth('wide')}
                className={`px-2 py-1 text-xs rounded ${readingWidth === 'wide' ? 'bg-white/20' : 'bg-white/10'} hover:bg-white/20 transition-colors`}
              >
                ▐▐▐▌
              </button>
            </div>
            
            {/* Progress Indicator */}
            <div className="text-sm text-gray-400">
              {Math.round(readingProgress)}%
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full rounded-full transition-all duration-300" 
            style={{
              background: (() => {
                const theme = novel || getDefaultTheme();
                return `linear-gradient(90deg, ${theme.theme_accent_color}, ${theme.theme_primary_color})`;
              })(),
              width: `${readingProgress}%`
            }}
            id="reading-progress"
          ></div>
        </div>
        </div>
      </div>

      <div className="pt-20">
        {/* Chapter Header */}
        <div className={`${getWidthClass()} mx-auto px-6 py-12`}>
          <div className="mb-12">
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-4 text-sm">              <span 
                className="px-4 py-2 rounded-full font-semibold text-white shadow-lg"
                style={{
                  background: (() => {
                    const theme = novel || getDefaultTheme();
                    return `linear-gradient(45deg, ${theme.theme_primary_color}, ${theme.theme_secondary_color})`;
                  })()
                }}
              >
                  Chapter {chapter.chapter_number}
                </span>
                {chapter.word_count && (
                  <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/20">
                    <svg className="h-4 w-4" style={{ color: (novel || getDefaultTheme()).theme_accent_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-gray-300">{formatReadingTime(chapter.word_count)}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 bg-black/20 px-3 py-2 rounded-full border border-white/20">
                  <svg className="h-4 w-4" style={{ color: (novel || getDefaultTheme()).theme_accent_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <span className="text-gray-300">{chapter.word_count?.toLocaleString() || 0} words</span>
                </div>
                {chapter.published_at && (
                  <div className="bg-black/20 px-3 py-2 rounded-full border border-white/20">
                    <span className="text-gray-300">{formatDate(chapter.published_at)}</span>
                  </div>
                )}
              </div>
                  <h1 
              className="text-5xl md:text-6xl font-bold leading-tight"
              style={{
                background: (() => {
                  const theme = novel || getDefaultTheme();
                  return `linear-gradient(45deg, ${theme.theme_accent_color}, ${theme.theme_secondary_color}, ${theme.theme_primary_color})`;
                })(),
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
                {chapter.title}
              </h1>
              
              {chapter.excerpt && (
                <div className="bg-black/20 border border-white/20 rounded-lg p-6 backdrop-blur-sm">
                  <p className="text-xl leading-relaxed italic">
                    {chapter.excerpt}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chapter Content */}
          <div className="bg-black/10 backdrop-blur-sm border border-white/10 rounded-xl p-8 md:p-12 shadow-2xl">
            <div 
              className={`chapter-content max-w-none ${getFontSizeClass()}`} 
              style={{ 
                ...getContentWidthStyle(),
                margin: '0 auto'
              }}
            >
              {isMarkdown ? (
                <div className={`leading-[1.8] font-serif ${getFontSizeClass()}`} style={getContentWidthStyle()}>
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({children}) => <h1 className="text-4xl font-bold mb-8 mt-12 font-display border-b border-white/30 pb-4" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</h1>,
                      h2: ({children}) => <h2 className="text-3xl font-bold mb-6 mt-10 font-display" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</h2>,
                      h3: ({children}) => <h3 className="text-2xl font-bold mb-4 mt-6 font-display" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</h3>,
                      p: ({children}) => (
                        <p 
                          className={`mb-6 leading-[1.8] ${getFontSizeClass()}`} 
                          style={{ 
                            color: (novel || getDefaultTheme()).theme_text_color,
                            maxWidth: 'none',
                            width: '100%'
                          }}
                        >
                          <span 
                            className="first-letter:text-4xl first-letter:font-bold first-letter:mr-1 first-letter:float-left first-letter:leading-[1]"
                            style={{ color: (novel || getDefaultTheme()).theme_accent_color }}
                          >
                            {children}
                          </span>
                        </p>
                      ),
                      blockquote: ({children}) => (
                        <blockquote className="border-l-4 pl-6 my-8 italic bg-black/20 p-6 rounded-r-lg backdrop-blur-sm" style={{ borderLeftColor: (novel || getDefaultTheme()).theme_primary_color, maxWidth: 'none' }}>
                          <div style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</div>
                        </blockquote>
                      ),
                      strong: ({children}) => <strong className="font-bold" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</strong>,
                      em: ({children}) => <em className="italic" style={{ color: (novel || getDefaultTheme()).theme_secondary_color }}>{children}</em>,
                      hr: () => <hr className="my-12 border-none h-[2px]" style={{ background: `linear-gradient(90deg, transparent, ${(novel || getDefaultTheme()).theme_primary_color}, transparent)` }} />,
                      code: ({children}) => <code className="bg-black/40 px-2 py-1 rounded font-mono" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>{children}</code>,
                      pre: ({children}) => <pre className="bg-black/40 p-4 rounded-lg overflow-x-auto border border-white/20" style={{ maxWidth: 'none' }}>{children}</pre>,
                    }}
                  >
                    {chapter.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div 
                  className={`chapter-content leading-[1.8] font-serif ${getFontSizeClass()}`}
                  style={{ 
                    color: (novel || getDefaultTheme()).theme_text_color,
                    ...getContentWidthStyle()
                  }}
                  dangerouslySetInnerHTML={{ __html: chapter.content }}
                />
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-16 pt-8 border-t border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prevChapter ? (
                <button
                  onClick={() => router.push(`/chapters/${prevChapter.id}`)}
                  className="group flex items-center gap-4 p-6 bg-black/20 hover:bg-black/30 rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm"
                >
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 group-hover:-translate-x-1 transition-all" style={{ color: (novel || getDefaultTheme()).theme_accent_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>Previous Chapter</div>
                    <div className="font-bold text-lg">Chapter {prevChapter.chapter_number}</div>
                    <div className="text-sm text-gray-300 truncate max-w-64">{prevChapter.title}</div>
                  </div>
                </button>
              ) : (
                <div></div>
              )}

              {nextChapter ? (
                <button
                  onClick={() => router.push(`/chapters/${nextChapter.id}`)}
                  className="group flex items-center gap-4 p-6 bg-black/20 hover:bg-black/30 rounded-xl border border-white/20 transition-all duration-300 backdrop-blur-sm md:justify-end"
                >
                  <div className="text-right">
                    <div className="text-sm font-medium" style={{ color: (novel || getDefaultTheme()).theme_accent_color }}>Next Chapter</div>
                    <div className="font-bold text-lg">Chapter {nextChapter.chapter_number}</div>
                    <div className="text-sm text-gray-300 truncate max-w-64">{nextChapter.title}</div>
                  </div>
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 group-hover:translate-x-1 transition-all" style={{ color: (novel || getDefaultTheme()).theme_accent_color }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </button>
              ) : (
                <div></div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}
