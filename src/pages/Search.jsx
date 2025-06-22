import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { 
  AdjustmentsHorizontalIcon,
  PlayIcon,
  PlusIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  MusicalNoteIcon,
  FireIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { 
  setSearchQuery,
  selectSearchQuery,
  selectHasSearched
} from '../redux/features/musicDataSlice'
import { 
  searchMusic,
  selectSearchResults as selectMusicSearchResults,
  selectMusicDataLoading
} from '../redux/features/musicDataSlice'
import { 
  setQueue, 
  setCurrentSong, 
  setIsPlaying 
} from '../redux/features/playerSlice'
import { 
  addToLikedSongs,
  removeFromLikedSongs,
  addToRecentlyPlayed,
  selectLikedSongs 
} from '../redux/features/authSlice'
import SearchResults from '../components/Search/SearchResults'
import toast from 'react-hot-toast'

const Search = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  const query = useSelector(selectSearchQuery)
  const isSearching = useSelector(selectMusicDataLoading)
  const hasSearched = useSelector(selectHasSearched)
  const musicSearchResults = useSelector(selectMusicSearchResults)
  const likedSongs = useSelector(selectLikedSongs)
  
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [showSearchModal, setShowSearchModal] = useState(false)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Handle URL search parameter
  useEffect(() => {
    const urlQuery = searchParams.get('q')
    if (urlQuery && urlQuery !== query) {
      setSearchInput(urlQuery)
      dispatch(setSearchQuery(urlQuery))
      dispatch(searchMusic(urlQuery))
    }
  }, [searchParams, query, dispatch])

  const categories = [
    { id: 'all', name: 'All', count: getTotalResultsCount(), icon: MusicalNoteIcon },
    { id: 'tracks', name: 'Songs', count: musicSearchResults.tracks?.length || 0, icon: MusicalNoteIcon },
    { id: 'artists', name: 'Artists', count: musicSearchResults.artists?.length || 0, icon: SparklesIcon }
  ]

  function getTotalResultsCount() {
    return Object.values(musicSearchResults).reduce((total, arr) => total + (arr?.length || 0), 0)
  }

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId)
    toast.success(`Viewing ${categories.find(c => c.id === categoryId)?.name}`, { icon: '📂' })
  }

  // Enhanced song play handler with Deezer preview support
  const handlePlaySong = (song) => {
    const formattedSong = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artist,
      duration: song.duration || 180,
      coverImage: song.images?.medium || song.images?.large || song.image || `https://picsum.photos/300/300?random=${song.id}`,
      audioUrl: song.preview || song.audioUrl || song.audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      isPreview: !!song.preview
    }

    dispatch(setQueue([formattedSong]))
    dispatch(setCurrentSong(formattedSong))
    dispatch(setIsPlaying(true))
    dispatch(addToRecentlyPlayed({
      ...formattedSong,
      playedAt: new Date().toISOString()
    }))
    
    const previewText = formattedSong.isPreview ? ' (30s preview)' : ''
    toast.success(`Playing "${formattedSong.title}"${previewText}`, { icon: '🎵' })
  }

  const handlePlayAll = (songs) => {
    if (songs && songs.length > 0) {
      const formattedSongs = songs.map(song => ({
        id: song.id,
        title: song.name || song.title,
        artist: song.artist,
        duration: song.duration || 180,
        coverImage: song.images?.medium || song.image || `https://picsum.photos/300/300?random=${song.id}`,
        audioUrl: song.preview || song.audioUrl || song.audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isPreview: !!song.preview
      }))

      dispatch(setQueue(formattedSongs))
      dispatch(setCurrentSong(formattedSongs[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing ${formattedSongs.length} songs`, { icon: '🎶' })
    }
  }

  const handleLikeSong = (song) => {
    const formattedSong = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artist,
      duration: song.duration || 180,
      coverImage: song.images?.medium || song.image || `https://picsum.photos/300/300?random=${song.id}`,
      audioUrl: song.preview || song.audioUrl || song.audio,
      addedAt: new Date().toISOString()
    }

    const isLiked = likedSongs.some(s => s.id === song.id)
    if (isLiked) {
      dispatch(removeFromLikedSongs(song.id))
      toast.success('Removed from liked songs', { icon: '💔' })
    } else {
      dispatch(addToLikedSongs(formattedSong))
      toast.success('Added to liked songs', { icon: '💚' })
    }
  }

  const formatDuration = (duration) => {
    if (!duration) return '3:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Enhanced search handler
  const handleSearch = (searchTerm) => {
    if (searchTerm.trim()) {
      setSearchInput(searchTerm)
      dispatch(setSearchQuery(searchTerm))
      dispatch(searchMusic(searchTerm))
      navigate(`/search?q=${encodeURIComponent(searchTerm)}`)
      setShowSearchModal(false)
      toast.success(`Searching for "${searchTerm}"`, { icon: '🔍' })
    }
  }

  const handleSearchInputChange = (e) => {
    setSearchInput(e.target.value)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    handleSearch(searchInput)
  }

  // Enhanced trending searches with vibrant colors
  const trendingSearches = [
    { name: 'Pop hits', color: 'bg-gradient-to-br from-pink-500 to-rose-400', emoji: '🎤', textColor: 'text-white' },
    { name: 'Rock classics', color: 'bg-gradient-to-br from-gray-700 to-gray-500', emoji: '🎸', textColor: 'text-white' },
    { name: 'Hip hop', color: 'bg-gradient-to-br from-purple-600 to-blue-500', emoji: '🎤', textColor: 'text-white' },
    { name: 'Electronic', color: 'bg-gradient-to-br from-cyan-500 to-blue-500', emoji: '🎧', textColor: 'text-white' },
    { name: 'Indie', color: 'bg-gradient-to-br from-yellow-500 to-orange-500', emoji: '🎼', textColor: 'text-black' },
    { name: 'Jazz', color: 'bg-gradient-to-br from-amber-600 to-orange-600', emoji: '🎺', textColor: 'text-white' },
    { name: 'Classical', color: 'bg-gradient-to-br from-purple-700 to-indigo-600', emoji: '🎻', textColor: 'text-white' },
    { name: 'Country', color: 'bg-gradient-to-br from-green-600 to-yellow-500', emoji: '🤠', textColor: 'text-black' }
  ]

  // Search Modal Component
  const SearchModal = () => (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-start justify-center z-50 p-4 pt-20">
      <div className="bg-spotify-gray rounded-2xl w-full max-w-2xl shadow-2xl border border-spotify-green/30 overflow-hidden">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="p-6 border-b border-spotify-green/20">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-spotify-green" />
            <input
              type="text"
              value={searchInput}
              onChange={handleSearchInputChange}
              placeholder="Search for songs, artists, albums..."
              className="w-full bg-spotify-light-gray text-white rounded-xl pl-12 pr-12 py-4 text-lg focus:outline-none focus:ring-2 focus:ring-spotify-green border border-transparent hover:border-spotify-green/30 transition-all duration-300"
              autoFocus
            />
            <button
              type="button"
              onClick={() => setShowSearchModal(false)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-spotify-text-gray hover:text-white transition-colors"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </form>

        {/* Trending Searches */}
        <div className="p-6">
          <h3 className="text-white font-bold text-lg mb-4 flex items-center space-x-2">
            <FireIcon className="w-5 h-5 text-spotify-green" />
            <span>Trending Searches</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {trendingSearches.map((category, index) => (
              <button
                key={index}
                onClick={() => handleSearch(category.name)}
                className={`${category.color} ${category.textColor} rounded-xl p-4 text-left hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl`}
              >
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{category.emoji}</span>
                  <span className="font-bold text-sm">{category.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  if (!hasSearched && !query) {
    return (
      <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        {/* Enhanced Search Header */}
        <section className="mb-12">

          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
              <FireIcon className="w-8 h-8 text-spotify-green" />
              <span>Browse all</span>
            </h2>
            <div className="text-spotify-text-gray text-sm">
              {trendingSearches.length} categories
            </div>
          </div>

          {/* Enhanced Category Grid with Colors */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-6">
            {trendingSearches.map((category, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredCategory(index)}
                onMouseLeave={() => setHoveredCategory(null)}
                className={`relative h-40 rounded-2xl flex items-end p-6 cursor-pointer overflow-hidden group transform transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-2xl ${
                  isVisible ? 'animate-slideIn' : ''
                } ${category.color}`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => handleSearch(category.name)}
              >
                {/* Background decoration */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                <div className="absolute top-4 right-4 text-4xl opacity-70 group-hover:opacity-100 transition-opacity">
                  {category.emoji}
                </div>
                
                {/* Floating elements */}
                <div className="absolute top-6 left-6 w-8 h-8 bg-white/20 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute bottom-20 right-8 w-6 h-6 bg-white/10 rounded-full animate-float opacity-0 group-hover:opacity-100 transition-opacity" style={{ animationDelay: '1s' }}></div>
                
                {/* Content */}
                <div className="relative z-10 w-full">
                  <h3 className={`font-black text-xl mb-2 group-hover:text-yellow-200 transition-colors ${category.textColor}`}>
                    {category.name}
                  </h3>
                  <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <PlayIconSolid className="w-5 h-5 text-white" />
                    <span className="text-white/90 text-sm font-medium">Explore</span>
                  </div>
                </div>

                {/* Hover overlay */}
                {hoveredCategory === index && (
                  <div className="absolute inset-0 bg-white/10 animate-fadeIn"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section className="bg-spotify-light-gray/30 backdrop-blur-sm rounded-2xl p-8 border border-spotify-green/20">
          <h3 className="text-white font-bold text-xl mb-6 flex items-center space-x-2">
            <SparklesIcon className="w-6 h-6 text-spotify-green" />
            <span>Quick Actions</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/library')}
              className="bg-gradient-to-r from-spotify-green/20 to-green-400/20 border border-spotify-green/30 rounded-xl p-4 text-left hover:from-spotify-green/30 hover:to-green-400/30 transition-all duration-300 transform hover:scale-105"
            >
              <MusicalNoteIcon className="w-8 h-8 text-spotify-green mb-2" />
              <h4 className="text-white font-semibold">Your Library</h4>
              <p className="text-spotify-text-gray text-sm">Browse your saved music</p>
            </button>
            
            <button
              onClick={() => navigate('/liked-songs')}
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl p-4 text-left hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105"
            >
              <HeartIcon className="w-8 h-8 text-purple-400 mb-2" />
              <h4 className="text-white font-semibold">Liked Songs</h4>
              <p className="text-spotify-text-gray text-sm">Your favorite tracks</p>
            </button>
            
            <button
              onClick={() => navigate('/recently-played')}
              className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl p-4 text-left hover:from-blue-600/30 hover:to-cyan-600/30 transition-all duration-300 transform hover:scale-105"
            >
              <FireIcon className="w-8 h-8 text-blue-400 mb-2" />
              <h4 className="text-white font-semibold">Recently Played</h4>
              <p className="text-spotify-text-gray text-sm">Your listening history</p>
            </button>
          </div>
        </section>

        {/* Search Modal */}
        {showSearchModal && <SearchModal />}
      </div>
    )
  }

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Enhanced Search Header */}
      {hasSearched && (
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
            <div>
              <p className="text-spotify-text-gray text-lg">
                Found {getTotalResultsCount()} results for "<span className="text-white font-medium">{query}</span>"
              </p>
            </div>
          </div>

          {/* Enhanced Category Tabs */}
          <div className="bg-spotify-light-gray/30 backdrop-blur-sm rounded-2xl p-2 border border-spotify-green/20">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryChange(category.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform whitespace-nowrap ${
                      selectedCategory === category.id
                        ? 'bg-spotify-green text-black shadow-lg shadow-spotify-green/25'
                        : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{category.name}</span>
                    {category.count > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        selectedCategory === category.id 
                          ? 'bg-black/20 text-black' 
                          : 'bg-spotify-green/20 text-spotify-green'
                      }`}>
                        {category.count}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Loading State */}
      {isSearching && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h3 className="text-white text-xl font-bold mb-2">Searching Deezer catalog...</h3>
            <p className="text-spotify-text-gray">Finding real music for "{query}"</p>
          </div>
        </div>
      )}

      {/* Enhanced Search Results */}
      {hasSearched && !isSearching && (
        <div className="animate-fadeIn">
          <SearchResults
            results={musicSearchResults}
            selectedCategory={selectedCategory}
            onPlaySong={handlePlaySong}
            onPlayAll={handlePlayAll}
            onLikeSong={handleLikeSong}
            formatDuration={formatDuration}
          />
        </div>
      )}

      {/* Enhanced No Results */}
      {hasSearched && !isSearching && getTotalResultsCount() === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <MagnifyingGlassIcon className="w-12 h-12 text-spotify-green" />
          </div>
          <h3 className="text-white text-3xl font-bold mb-4">No results found for "{query}"</h3>
          <p className="text-spotify-text-gray mb-8 max-w-md mx-auto text-lg leading-relaxed">
            Try searching for something else or browse our trending categories below.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-8 py-4 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25"
            >
              Browse Featured
            </button>
            <button
              onClick={() => {
                dispatch(setSearchQuery(''))
                setSearchInput('')
                navigate('/search')
              }}
              className="bg-spotify-light-gray/50 text-white font-bold px-8 py-4 rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105 border border-spotify-green/30"
            >
              Try New Search
            </button>
          </div>
        </div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out;
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default Search
