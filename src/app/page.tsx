import Hero from "@/components/Hero";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Hero />
      
      {/* Featured Content Section */}
      <section className="py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 font-display">Enter the Verse</h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover interconnected worlds of dark fantasy where complex characters navigate supernatural realms and forge unlikely alliances.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Characters Card */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <div className="text-purple-400 mb-4 group-hover:text-purple-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 font-display">Characters</h3>
              <p className="text-gray-400 mb-4">
                Meet the complex beings who navigate between realms, each with their own motivations and secrets across multiple novels.
              </p>
              <a href="/characters" className="text-purple-400 hover:text-purple-300 font-medium">
                Explore Characters →
              </a>
            </div>

            {/* World Card */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <div className="text-purple-400 mb-4 group-hover:text-purple-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 font-display">The Worlds</h3>
              <p className="text-gray-400 mb-4">
                Explore interconnected realms across the Verse collection, each with unique magic systems, cultures, and dangers.
              </p>
              <a href="/world" className="text-purple-400 hover:text-purple-300 font-medium">
                Discover Worlds →
              </a>
            </div>

            {/* Chapters Card */}
            <div className="bg-gray-900 rounded-lg p-6 border border-gray-700 hover:border-purple-500 transition-all duration-300 group">
              <div className="text-purple-400 mb-4 group-hover:text-purple-300">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 font-display">Latest Chapters</h3>
              <p className="text-gray-400 mb-4">
                Sign up for free to access chapters from multiple novels and track your reading progress across the collection.
              </p>
              <a href="/auth" className="text-purple-400 hover:text-purple-300 font-medium">
                Sign Up to Read →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6 font-display">From Verse</h2>
          <blockquote className="text-xl text-gray-300 italic mb-8 font-serif">
            "Each story in the collection explores different facets of the human condition through supernatural lenses, where the bonds forged in darkness often prove stronger than those made in light."
          </blockquote>
          <p className="text-gray-400 mb-8">
            Welcome to a carefully curated collection of dark fantasy novels featuring interconnected themes, complex characters, and immersive world-building. Each story stands alone while contributing to a larger tapestry of narrative.
          </p>
          <a
            href="/about"
            className="inline-flex items-center bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-purple-500/25"
          >
            Learn More About the Collection
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
