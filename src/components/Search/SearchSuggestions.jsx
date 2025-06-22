import React, { useState, useEffect } from 'react'
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  MusicalNoteIcon,
  UserIcon,
  RectangleStackIcon,
  FireIcon,
  TrendingUpIcon,
  StarIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'
import { useSelector } from 'react-redux'

const SearchSuggestions = ({ 
  suggestions, 
  recentSearches, 
  onSuggestionClick, 
  onRecentSearchClick, 
  query 
}) => {
  const trendingSearches = useSelector(state => state.search.trendingSearches) || [
    'Pop hits', 'Rock classics', 'Hip hop', 'Electronic', 'Indie', 'Jazz'
  ]
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const getTypeIcon = (type) => {
    const iconClass = "w-5 h-5"
    switch (type) {
      case 'song':
        return <MusicalNoteIcon className={`${iconClass} text-spotify-green`} />
      case 'artist':
        return <UserIcon className={`${iconClass} text-blue-400`} />
      case 'album':
        return <RectangleStackIcon className={`${iconClass} text-orange-400`} />
      default:
        return <MagnifyingGlassIcon className={`${iconClass} text-spotify-text-gray`} />
    }
  }

  const getTypeBackground = (type) => {
    switch (type) {
      case 'song':
        return 'bg-spotify-green/20 border-spotify-green/30'
      case 'artist':
        return 'bg-blue-500/20 border-blue-500/30'
      case 'album':
        return 'bg-orange-500/20 border-orange-500/30'
      default:
        return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const highlightMatch = (text, searchQuery) => {
    if (!searchQuery) return text
    
    const regex = new RegExp(`(${searchQuery})`, 'gi')
    const parts = text.split(regex)
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="font-bold text-spotify-green bg-spotify-green/20 px-1 rounded">
          {part}
        </span>
      ) : (
        <span key={index}>{part}</span>
      )
    )
  }

  const showRecentSearches = !query && recentSearches.length > 0
  const showTrending = !query && (!recentSearches.length || recentSearches.length === 0)
  const showSuggestions = query && suggestions.length > 0

  return (
    <div className={`absolute top-full left-0 right-0 mt-3 bg-gradient-to-br from-spotify-light-gray via-spotify-gray to-spotify-light-gray rounded-2xl shadow-2xl border border-spotify-green/30 max-h-96 overflow-hidden z-50 backdrop-blur-xl transition-all duration-300 ${
      isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
    }`}>
      
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/5 via-transparent to-blue-500/5 animate-pulse-slow"></div>
      
      <div className="relative z-10 max-h-96 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-spotify-green/30">
        
        {/* Search Suggestions */}
        {showSuggestions && (
          <div className="py-3">
            <div className="px-4 py-2 flex items-center space-x-2 border-b border-spotify-green/20">
              <MagnifyingGlassIcon className="w-4 h-4 text-spotify-green" />
              <span className="text-xs text-spotify-text-gray font-medium uppercase tracking-wide">
                Search results
              </span>
            </div>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
                onClick={() => onSuggestionClick(suggestion)}
                className={`w-full px-4 py-4 hover:bg-spotify-green/20 transition-all duration-300 flex items-center space-x-4 text-left group ${
                  hoveredIndex === index ? 'bg-spotify-green/10 transform scale-102' : ''
                }`}
              >
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-300 ${getTypeBackground(suggestion.type)} ${
                  hoveredIndex === index ? 'scale-110 shadow-lg' : ''
                }`}>
                  {getTypeIcon(suggestion.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate group-hover:text-spotify-green transition-colors">
                    {highlightMatch(suggestion.text, query)}
                  </p>
                  {suggestion.subtitle && (
                    <p className="text-spotify-text-gray text-xs truncate mt-1">
                      {suggestion.subtitle}
                    </p>
                  )}
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize transition-all duration-300 ${getTypeBackground(suggestion.type)}`}>
                  {suggestion.type}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches */}
        {showRecentSearches && (
          <div className="py-3">
            <div className="px-4 py-2 flex items-center space-x-2 border-b border-spotify-green/20">
              <ClockIcon className="w-4 h-4 text-spotify-green" />
              <span className="text-xs text-spotify-text-gray font-medium uppercase tracking-wide">
                Recent searches
              </span>
            </div>
            {recentSearches.slice(0, 5).map((recentSearch, index) => (
              <button
                key={index}
                onClick={() => onRecentSearchClick(recentSearch)}
                className="w-full px-4 py-4 hover:bg-spotify-green/20 transition-all duration-300 flex items-center space-x-4 text-left group"
              >
                <div className="w-10 h-10 bg-spotify-green/20 border border-spotify-green/30 rounded-full flex items-center justify-center group-hover:bg-spotify-green/30 transition-all duration-300">
                  <ClockIcon className="w-5 h-5 text-spotify-green" />
                </div>
                <span className="text-white text-sm truncate group-hover:text-spotify-green transition-colors font-medium">
                  {recentSearch}
                </span>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-spotify-green" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Trending Searches */}
        {showTrending && (
          <div className="py-3">
            <div className="px-4 py-2 flex items-center space-x-2 border-b border-spotify-green/20">
              <TrendingUpIcon className="w-4 h-4 text-spotify-green" />
              <span className="text-xs text-spotify-text-gray font-medium uppercase tracking-wide">
                Trending searches
              </span>
            </div>
            {trendingSearches.slice(0, 6).map((trending, index) => (
              <button
                key={index}
                onClick={() => onRecentSearchClick(trending)}
                className="w-full px-4 py-4 hover:bg-spotify-green/20 transition-all duration-300 flex items-center space-x-4 text-left group"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-full flex items-center justify-center group-hover:from-orange-500/30 group-hover:to-red-500/30 transition-all duration-300">
                  <FireIcon className="w-5 h-5 text-orange-400" />
                </div>
                <span className="text-white text-sm group-hover:text-spotify-green transition-colors font-medium">
                  {trending}
                </span>
                <div className="flex items-center space-x-1 opacity-60 group-hover:opacity-100 transition-opacity">
                  <StarIcon className="w-3 h-3 text-yellow-400" />
                  <span className="text-xs text-spotify-text-gray">Hot</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No Results */}
        {query && suggestions.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-spotify-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <MagnifyingGlassIcon className="w-10 h-10 text-spotify-green" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">No results found</p>
            <p className="text-spotify-text-gray text-sm max-w-xs mx-auto">
              Try searching for something else or check your spelling
            </p>
            <div className="mt-4 flex justify-center space-x-2">
              {['Pop', 'Rock', 'Hip hop'].map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onRecentSearchClick(suggestion)}
                  className="px-3 py-1 bg-spotify-green/20 text-spotify-green text-xs rounded-full hover:bg-spotify-green/30 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!query && recentSearches.length === 0 && trendingSearches.length === 0 && (
          <div className="py-12 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-spotify-green/20 to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <MusicalNoteIcon className="w-10 h-10 text-spotify-green" />
            </div>
            <p className="text-white font-semibold text-lg mb-2">Start typing to search</p>
            <p className="text-spotify-text-gray text-sm max-w-xs mx-auto mb-4">
              Find your favorite songs, artists, and albums
            </p>
            <div className="flex justify-center space-x-2">
              {['🎵 Songs', '👨‍🎤 Artists', '💿 Albums'].map((type, index) => (
                <div key={index} className="px-3 py-1 bg-spotify-gray rounded-full text-xs text-spotify-text-gray">
                  {type}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-spotify-green\\/30::-webkit-scrollbar-thumb {
          background-color: rgba(29, 185, 84, 0.3);
          border-radius: 3px;
        }
        
        .scrollbar-thumb-spotify-green\\/30::-webkit-scrollbar-thumb:hover {
          background-color: rgba(29, 185, 84, 0.5);
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}

export default SearchSuggestions
