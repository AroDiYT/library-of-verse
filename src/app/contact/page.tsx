'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';

interface ContactForm {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface WriterApplicationForm {
  name: string;
  email: string;
  experience: string;
  portfolio: string;
  motivation: string;
}

export default function ContactPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'contact' | 'writer'>('contact');
  const [contactForm, setContactForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [writerForm, setWriterForm] = useState<WriterApplicationForm>({
    name: '',
    email: '',
    experience: '',
    portfolio: '',
    motivation: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...contactForm,
          type: 'contact'
        }),
      });

      if (response.ok) {
        setSubmitMessage('Message sent successfully! We\'ll get back to you soon.');
        setContactForm({ name: '', email: '', subject: '', message: '' });
      } else {
        const error = await response.json();
        setSubmitMessage(error.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWriterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage('');

    try {
      const response = await fetch('/api/writer-applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(writerForm),
      });

      if (response.ok) {
        setSubmitMessage('Writer application submitted successfully! We\'ll review your application and get back to you.');
        setWriterForm({ name: '', email: '', experience: '', portfolio: '', motivation: '' });
      } else {
        const error = await response.json();
        setSubmitMessage(error.error || 'Failed to submit application. Please try again.');
      }
    } catch (error) {
      setSubmitMessage('Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setContactForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleWriterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setWriterForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          
          {/* Tab Navigation */}
          <div className="selector-group">
            <div className="tab-group">
              <button
                onClick={() => setActiveTab('contact')}
                className={`tab-button ${activeTab === 'contact' ? 'active' : 'inactive'}`}
              >
                Contact Us
              </button>
              <button
                onClick={() => setActiveTab('writer')}
                className={`tab-button ${activeTab === 'writer' ? 'active' : 'inactive'}`}
              >
                Become a Writer
              </button>
            </div>
          </div>

          {submitMessage && (
            <div className={`mb-6 p-4 rounded-lg text-center ${
              submitMessage.includes('successfully') 
                ? 'bg-green-600/20 border border-green-500 text-green-300'
                : 'bg-red-600/20 border border-red-500 text-red-300'
            }`}>
              {submitMessage}
            </div>
          )}

          {/* Contact Form */}
          {activeTab === 'contact' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-6 text-center">Send us a Message</h2>
              <form onSubmit={handleContactSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={contactForm.name}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={contactForm.email}
                      onChange={handleContactChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    required
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="What's this about?"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us what's on your mind..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          {/* Writer Application Form */}
          {activeTab === 'writer' && (
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 border border-slate-700">
              <h2 className="text-2xl font-semibold mb-6 text-center">Apply to Become a Writer</h2>
              <p className="text-gray-300 text-center mb-8">
                Join our community of writers and share your stories with readers around the world.
              </p>
              <form onSubmit={handleWriterSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="writer-name" className="block text-sm font-medium mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      id="writer-name"
                      name="name"
                      value={writerForm.name}
                      onChange={handleWriterChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label htmlFor="writer-email" className="block text-sm font-medium mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="writer-email"
                      name="email"
                      value={writerForm.email}
                      onChange={handleWriterChange}
                      required
                      className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                      placeholder="your.email@example.com"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium mb-2">
                    Writing Experience *
                  </label>
                  <textarea
                    id="experience"
                    name="experience"
                    value={writerForm.experience}
                    onChange={handleWriterChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="Tell us about your writing background, genres you work in, and any published works..."
                  />
                </div>
                <div>
                  <label htmlFor="portfolio" className="block text-sm font-medium mb-2">
                    Portfolio/Samples
                  </label>
                  <input
                    type="url"
                    id="portfolio"
                    name="portfolio"
                    value={writerForm.portfolio}
                    onChange={handleWriterChange}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="Link to your portfolio, blog, or writing samples (optional)"
                  />
                </div>
                <div>
                  <label htmlFor="motivation" className="block text-sm font-medium mb-2">
                    Why do you want to write for us? *
                  </label>
                  <textarea
                    id="motivation"
                    name="motivation"
                    value={writerForm.motivation}
                    onChange={handleWriterChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    placeholder="What draws you to our platform? What stories do you want to tell?"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
