'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Chapter {
  id: number;
  title: string;
  chapter_number: number;
  content: string;
  excerpt: string;
  word_count: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

interface Novel {
  id: number;
  title: string;
  slug: string;
  description?: string;
  status: string;
  is_featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export default function AdminChaptersPage() {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [novels, setNovels] = useState<Novel[]>([]);
  const [selectedNovelId, setSelectedNovelId] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    chapter_number: 1,
    content: '',
    excerpt: '',
    is_published: false,
    novel_id: 1,
  });
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const [isMarkdownMode, setIsMarkdownMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    fetchNovels();
    fetchChapters();
  }, []);

  useEffect(() => {
    if (selectedNovelId) {
      fetchChapters();
    }
  }, [selectedNovelId]);

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

  const fetchNovels = async () => {
    try {
      const response = await fetch('/api/novels');
      if (response.ok) {
        const data = await response.json();
        setNovels(data);
        if (data.length > 0 && selectedNovelId === 1) {
          setSelectedNovelId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Failed to fetch novels:', error);
    }
  };

  const fetchChapters = async () => {
    try {
      const response = await fetch(`/api/admin/chapters?novel_id=${selectedNovelId}`);
      if (response.ok) {
        const data = await response.json();
        setChapters(data.chapters || []);
      }
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingChapter 
        ? `/api/admin/chapters/${editingChapter.id}`
        : '/api/admin/chapters';
      
      const method = editingChapter ? 'PUT' : 'POST';
      
      // Calculate word count
      const wordCount = formData.content.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          word_count: wordCount,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingChapter ? 'Chapter updated successfully!' : 'Chapter created successfully!');
        setShowEditor(false);
        setEditingChapter(null);
        setFormData({
          title: '',
          chapter_number: chapters.length + 1,
          content: '',
          excerpt: '',
          is_published: false,
          novel_id: selectedNovelId,
        });
        fetchChapters();
      } else {
        setMessage(data.error || 'Failed to save chapter');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter: Chapter) => {
    setEditingChapter(chapter);
    setFormData({
      title: chapter.title,
      chapter_number: chapter.chapter_number,
      content: chapter.content,
      excerpt: chapter.excerpt,
      is_published: chapter.is_published,
      novel_id: selectedNovelId,
    });
    setShowEditor(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this chapter?')) return;

    try {
      const response = await fetch(`/api/admin/chapters/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMessage('Chapter deleted successfully!');
        fetchChapters();
      } else {
        setMessage('Failed to delete chapter');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
    }
  };

  const togglePublished = async (chapter: Chapter) => {
    try {
      const response = await fetch(`/api/admin/chapters/${chapter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...chapter,
          is_published: !chapter.is_published,
        }),
      });

      if (response.ok) {
        setMessage(`Chapter ${!chapter.is_published ? 'published' : 'unpublished'} successfully!`);
        fetchChapters();
      }
    } catch (error) {
      setMessage('Failed to update chapter status');
    }
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
      
      setFormData({...formData, content: newValue});
      
      // Set cursor position after insertion
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
      }, 0);
    }
  };

  if (loading && !chapters.length) {
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
            <h1 className="text-4xl font-bold text-red-400 mb-2">Chapter Management</h1>
            <p className="text-gray-300">Create, edit, and manage novel chapters</p>
          </div>
          <button
            onClick={() => {
              setShowEditor(true);
              setEditingChapter(null);
              setFormData({
                title: '',
                chapter_number: chapters.length + 1,
                content: '',
                excerpt: '',
                is_published: false,
                novel_id: selectedNovelId,
              });
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Add New Chapter
          </button>
        </div>

        {/* Novel Selector */}
        <div className="mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-4">Select Novel</h2>
            <div className="flex items-center gap-4">
              <select
                value={selectedNovelId}
                onChange={(e) => setSelectedNovelId(parseInt(e.target.value))}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
              >
                {novels.map((novel) => (
                  <option key={novel.id} value={novel.id}>
                    {novel.title} ({novel.status})
                  </option>
                ))}
              </select>
              <span className="text-gray-400">
                Managing chapters for the selected novel
              </span>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('successfully') || message.includes('published') || message.includes('unpublished') ? 'bg-green-800/20 border border-green-600/20 text-green-300' : 'bg-red-800/20 border border-red-600/20 text-red-300'}`}>
            {message}
          </div>
        )}

        {showEditor ? (
          /* Chapter Editor */
          <div className="bg-gray-800 rounded-lg border border-red-900/20 p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-red-400">
                {editingChapter ? 'Edit Chapter' : 'Create New Chapter'}
              </h2>
              <button
                onClick={() => {
                  setShowEditor(false);
                  setEditingChapter(null);
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chapter Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Enter chapter title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Chapter Number
                  </label>
                  <input
                    type="number"
                    value={formData.chapter_number}
                    onChange={(e) => setFormData({...formData, chapter_number: parseInt(e.target.value)})}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Chapter Excerpt
                </label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                  placeholder="Brief description or excerpt for this chapter"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-300">
                    Chapter Content
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
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-600 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                    rows={20}
                    placeholder="Write your chapter content in Markdown...

# Chapter Title
Your chapter content here. You can use:

## Subheadings
**Bold text** and *italic text*

> Blockquotes for dialogue or emphasis

---

Scene breaks with horizontal rules"
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
                        onClick={() => insertMarkdown('# ', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="Heading 1"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('## ', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="Heading 2"
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
                      <button
                        type="button"
                        onClick={() => insertMarkdown('- ', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="List"
                      >
                        List
                      </button>
                      <button
                        type="button"
                        onClick={() => insertMarkdown('\n---\n', '')}
                        className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm text-white transition-colors"
                        title="Horizontal Rule"
                      >
                        HR
                      </button>
                    </div>
                    
                    {/* Textarea Editor */}
                    <textarea
                      name="content"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      rows={20}
                      className="w-full p-4 border border-gray-600 rounded-b-lg font-mono text-sm leading-relaxed resize-vertical min-h-96 bg-gray-900 text-gray-100 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
                      placeholder="Write your chapter content here... You can use Markdown formatting or HTML."
                    />
                    
                    <div className="text-sm text-gray-400">
                      <strong className="text-gray-300">Formatting Tips:</strong>
                      <ul className="mt-2 space-y-1 text-xs">
                        <li>• <code className="bg-gray-800 px-1 rounded">**bold text**</code> or <code className="bg-gray-800 px-1 rounded">&lt;strong&gt;bold text&lt;/strong&gt;</code></li>
                        <li>• <code className="bg-gray-800 px-1 rounded">*italic text*</code> or <code className="bg-gray-800 px-1 rounded">&lt;em&gt;italic text&lt;/em&gt;</code></li>
                        <li>• <code className="bg-gray-800 px-1 rounded"># Heading 1</code> or <code className="bg-gray-800 px-1 rounded">&lt;h1&gt;Heading 1&lt;/h1&gt;</code></li>
                        <li>• <code className="bg-gray-800 px-1 rounded">&gt; Quote</code> or <code className="bg-gray-800 px-1 rounded">&lt;blockquote&gt;Quote&lt;/blockquote&gt;</code></li>
                        <li>• <code className="bg-gray-800 px-1 rounded">- List item</code> or <code className="bg-gray-800 px-1 rounded">&lt;ul&gt;&lt;li&gt;List item&lt;/li&gt;&lt;/ul&gt;</code></li>
                      </ul>
                    </div>
                  </div>
                )}
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
                  {loading ? 'Saving...' : editingChapter ? 'Update Chapter' : 'Create Chapter'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditor(false);
                    setEditingChapter(null);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Chapters List */
          <div className="bg-gray-800 rounded-lg border border-red-900/20 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">All Chapters</h2>
            </div>

            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-300">No chapters</h3>
                <p className="mt-1 text-sm text-gray-400">Get started by creating your first chapter.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {chapters.map((chapter) => (
                  <div key={chapter.id} className="px-6 py-4 hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-medium text-gray-400">
                            Chapter {chapter.chapter_number}
                          </span>
                          <h3 className="text-lg font-medium text-white">{chapter.title}</h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            chapter.is_published 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {chapter.is_published ? 'Published' : 'Draft'}
                          </span>
                        </div>
                        {chapter.excerpt && (
                          <p className="mt-1 text-sm text-gray-400 line-clamp-2">{chapter.excerpt}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{chapter.word_count} words</span>
                          <span>Created: {new Date(chapter.created_at).toLocaleDateString()}</span>
                          {chapter.updated_at !== chapter.created_at && (
                            <span>Updated: {new Date(chapter.updated_at).toLocaleDateString()}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => togglePublished(chapter)}
                          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                            chapter.is_published
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {chapter.is_published ? 'Unpublish' : 'Publish'}
                        </button>
                        <button
                          onClick={() => handleEdit(chapter)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(chapter.id)}
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
        )}
      </div>
    </div>
  );
}
