import Footer from "@/components/Footer";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

async function getAboutContent() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/api/content?type=about`, {
      cache: 'no-store'
    });
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Error fetching about content:', error);
  }
  return [];
}

export default async function About() {
  const contentSections = await getAboutContent();

  return (
    <div className="min-h-screen pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-white mb-6 font-display">About Forged Pacts</h1>
          <p className="text-xl text-gray-300">
            A world where ancient bonds between realms are breaking, and new alliances must be forged in shadow and flame.
          </p>
        </div>

        <div className="space-y-12">
          {contentSections.length > 0 ? (
            contentSections.map((section: any) => (
              <section key={section.id} className="bg-gray-900 rounded-lg p-8 border border-gray-700">
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
              </section>
            ))
          ) : (
            // Fallback content if database content isn't available
            <>
              <section className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 font-display">The Story</h2>
                <div className="prose prose-lg text-gray-300 max-w-none font-serif">
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
              </section>

              <section className="bg-gray-900 rounded-lg p-8 border border-gray-700">
                <h2 className="text-3xl font-bold text-white mb-6 font-display">About the Author</h2>
                <div className="text-gray-300 font-serif">
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
              </section>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
