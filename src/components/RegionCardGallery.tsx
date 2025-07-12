import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface RegionCard {
  id: number;
  name: string;
  description: string;
  image_url?: string;
  continent?: string;
  theme_color: string;
  border_color: string;
  background_color: string;
  hover_color: string;
  icon: string;
  layout_style: string;
  sort_order: number;
}

interface RegionCardGalleryProps {
  cards: RegionCard[];
  isWriter: boolean;
  userRole?: string;
  selectedNovelId: number;
}

export default function RegionCardGallery({ cards, isWriter, userRole, selectedNovelId }: RegionCardGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth >= 1280) {
        setCardsPerView(3);
      } else if (window.innerWidth >= 768) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
    };

    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);

  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < cards.length - cardsPerView;
  const showScrollControls = cards.length > cardsPerView;

  const scrollLeft = () => {
    if (canScrollLeft) {
      setCurrentIndex(Math.max(0, currentIndex - 1));
    }
  };

  const scrollRight = () => {
    if (canScrollRight) {
      setCurrentIndex(Math.min(cards.length - cardsPerView, currentIndex + 1));
    }
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-gray-700 rounded-lg">
        <svg className="mx-auto h-12 w-12 text-gray-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        <h3 className="text-xl font-bold text-gray-400 mb-2">No Region Cards Yet</h3>
        <p className="text-gray-500 mb-4">Start building your world by adding region cards</p>
        {isWriter && (
          <Link 
            href={`${userRole === 'admin' ? '/admin' : '/writer'}/region-cards/new?novel_id=${selectedNovelId}`}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            + Create First Region
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Gallery Container */}
      <div className="relative">
        <div className="flex items-center justify-center">
          {/* Left Preview Skeleton */}
          {canScrollLeft && (
            <div className="relative flex-shrink-0 w-40 mr-4">
              <div 
                className="bg-gray-800/50 rounded-lg border border-gray-700/50 h-48 flex items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-all"
                onClick={scrollLeft}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-600/50 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </div>
                  <div className="w-24 h-2 bg-gray-600/30 rounded mx-auto mb-2"></div>
                  <div className="w-16 h-2 bg-gray-600/20 rounded mx-auto"></div>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 -right-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </div>
          )}

          {/* Main Cards Container */}
          <div className="flex-1 max-w-5xl">
            <div className={`grid gap-6 ${
              cardsPerView === 1 ? 'grid-cols-1' : 
              cardsPerView === 2 ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            }`}>
              {cards.slice(currentIndex, currentIndex + cardsPerView).map((card) => (
                <div key={card.id} className="w-full">
                  <RegionCardComponent 
                    card={card} 
                    isWriter={isWriter} 
                    userRole={userRole}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Preview Skeleton */}
          {canScrollRight && (
            <div className="relative flex-shrink-0 w-40 ml-4">
              <div 
                className="bg-gray-800/50 rounded-lg border border-gray-700/50 h-48 flex items-center justify-center cursor-pointer hover:bg-gray-700/50 transition-all"
                onClick={scrollRight}
              >
                <div className="text-center">
                  <div className="w-12 h-12 bg-gray-600/50 rounded-full flex items-center justify-center mb-2 mx-auto">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="w-24 h-2 bg-gray-600/30 rounded mx-auto mb-2"></div>
                  <div className="w-16 h-2 bg-gray-600/20 rounded mx-auto"></div>
                </div>
              </div>
              <div className="absolute top-1/2 -translate-y-1/2 -left-2 bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg z-10">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pagination Dots */}
      {showScrollControls && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: Math.ceil(cards.length / cardsPerView) }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx * cardsPerView)}
              className={`w-2 h-2 rounded-full transition-colors ${
                Math.floor(currentIndex / cardsPerView) === idx 
                  ? 'bg-red-500' 
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RegionCardComponent({ card, isWriter, userRole }: { card: RegionCard, isWriter: boolean, userRole?: string }) {
  return (
    <div className={`h-full flex flex-col ${card.background_color} rounded-lg overflow-hidden border ${card.border_color} ${card.hover_color} transition-all duration-300 group`}>
      {/* Card Header with Icon and Title */}
      <div className="p-6 flex-shrink-0">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl" role="img" aria-label="Region icon">
            {card.icon}
          </span>
          <div className="flex-1">
            <h3 className={`text-xl font-bold font-display text-white`}>
              {card.name}
            </h3>
            {card.continent && (
              <p className="text-sm text-gray-400 mt-1">{card.continent}</p>
            )}
          </div>
          {isWriter && (
            <Link 
              href={`${userRole === 'admin' ? '/admin' : '/writer'}/region-cards/${card.id}/edit`}
              className="text-purple-400 hover:text-purple-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✏️
            </Link>
          )}
        </div>
      </div>

      {/* Image */}
      {card.image_url && (
        <div className="aspect-video bg-gray-800 flex-shrink-0">
          <img 
            src={card.image_url} 
            alt={card.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col">
        <p className="text-gray-300 font-serif text-sm leading-relaxed flex-1">
          {card.description}
        </p>
        
        {/* Theme color indicator */}
        <div className="flex items-center justify-center mt-4 pt-4 border-t border-gray-700">
          <div 
            className="w-8 h-1 rounded-full opacity-60"
            style={{ backgroundColor: card.theme_color }}
          />
        </div>
      </div>
    </div>
  );
}
