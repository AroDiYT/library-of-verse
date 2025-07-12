'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="fixed top-0 w-full z-50 bg-gray-950/95 backdrop-blur-md border-b border-red-900/30 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 flex items-center justify-center">
                <img 
                  src="/VerseLogoVectorised.svg" 
                  alt="Verse" 
                  className="w-10 h-10 transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent group-hover:from-purple-300 group-hover:to-purple-200 transition-all duration-300">
                Verse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:block">
            <div className="flex items-center space-x-1">
              {/* Main Navigation Links */}
              <div className="flex items-center space-x-1 mr-6">
                <Link href="/" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
                <Link href="/about" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">About</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
                <Link href="/characters" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">Characters</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
                <Link href="/world" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">World</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
                {user && (
                  <Link href="/chapters" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                    <span className="relative z-10">Chapters</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                  </Link>
                )}
                <Link href="/contact" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">Contact</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
                <Link href="/roadmap" className="relative text-gray-300 hover:text-white px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg hover:bg-gray-800/50 group">
                  <span className="relative z-10">Roadmap</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
                </Link>
              </div>

              {/* User Actions */}
              <div className="flex items-center space-x-3">
                {user ? (
                  <>
                    {/* User Profile Dropdown */}
                    <div className="relative">
                      <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="flex items-center space-x-3 bg-gray-800/50 hover:bg-gray-700/50 px-4 py-2 rounded-lg transition-all duration-200 border border-gray-700/50 hover:border-red-500/30"
                      >
                        <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-gray-300 text-sm font-medium">{user.username}</span>
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-900/95 backdrop-blur-sm rounded-lg shadow-xl border border-gray-700/50 py-2">
                          <div className="px-4 py-3 border-b border-gray-700/50">
                            <p className="text-sm text-gray-300">Signed in as</p>
                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                            <div className="flex gap-2 mt-1">
                              {user.role === 'admin' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Administrator
                                </span>
                              )}
                              {user.role === 'writer' && (
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  Writer
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="py-1">
                            <Link
                              href="/profile"
                              className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                              onClick={() => setIsMenuOpen(false)}
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Your Profile</span>
                              </div>
                            </Link>
                            {(user.role === 'writer' || user.role === 'admin') && (
                              <Link
                                href="/writer"
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                  </svg>
                                  <span>Writer Dashboard</span>
                                </div>
                              </Link>
                            )}
                            {user.role === 'admin' && (
                              <Link
                                href="/admin"
                                className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                                onClick={() => setIsMenuOpen(false)}
                              >
                                <div className="flex items-center space-x-2">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  </svg>
                                  <span>Admin Dashboard</span>
                                </div>
                              </Link>
                            )}
                            <div className="border-t border-gray-700/50 my-1"></div>
                            <button
                              onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                              }}
                              className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800/50 hover:text-white transition-colors"
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Sign Out</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  !loading && (
                    <Link href="/auth" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-red-500/25 hover:scale-105">
                      Sign In
                    </Link>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all duration-200"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-4 space-y-1 bg-gray-900/95 backdrop-blur-sm rounded-lg mt-3 border border-gray-700/50 shadow-xl">
              <Link href="/" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                Home
              </Link>
              <Link href="/about" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                About
              </Link>
              <Link href="/characters" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                Characters
              </Link>
              <Link href="/world" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                World
              </Link>
              {user ? (
                <>
                  <Link href="/chapters" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                    Chapters
                  </Link>
                  <div className="border-t border-gray-700/50 my-2"></div>
                  <div className="px-4 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.username}</p>
                        <p className="text-gray-400 text-sm">{user.email}</p>
                        <div className="flex gap-1 mt-1">
                          {user.role === 'admin' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Admin
                            </span>
                          )}
                          {user.role === 'writer' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              Writer
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/profile" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                    Profile
                  </Link>
                  {(user.role === 'writer' || user.role === 'admin') && (
                    <Link href="/writer" className="text-purple-400 hover:text-purple-300 hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                      Writer Dashboard
                    </Link>
                  )}
                  {user.role === 'admin' && (
                    <Link href="/admin" className="text-yellow-400 hover:text-yellow-300 hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                      Admin Dashboard
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-gray-300 hover:text-white hover:bg-gray-800/50 block w-full text-left px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                !loading && (
                  <>
                    <div className="border-t border-gray-700/50 my-2"></div>
                    <Link href="/auth" className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg text-center mx-2">
                      Sign In
                    </Link>
                  </>
                )
              )}
              <Link href="/contact" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                Contact
              </Link>
              <Link href="/roadmap" className="text-gray-300 hover:text-white hover:bg-gray-800/50 block px-4 py-3 text-base font-medium transition-all duration-200 rounded-lg">
                Roadmap
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdown */}
      {isMenuOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}
    </nav>
  );
}
