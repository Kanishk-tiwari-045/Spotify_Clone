import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  PlusIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  Squares2X2Icon,
  ArrowsUpDownIcon,
  FunnelIcon,
  HeartIcon,
  ClockIcon,
  UserIcon,
  MusicalNoteIcon,
  PlayIcon,
  SparklesIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { createPlaylist, setIsCreating } from '../redux/features/playlistSlice'
import { setQueue, setCurrentSong, setIsPlaying } from '../redux/features/playerSlice'
import { 
  selectUser,
  selectLikedSongs,
  selectRecentlyPlayed,
  selectFollowedArtists 
} from '../redux/features/authSlice'
import toast from 'react-hot-toast'

const Library = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const user = useSelector(selectUser)
  const playlists = useSelector(state => state.playlist.playlists)
  const likedSongs = useSelector(selectLikedSongs)
  const recentlyPlayed = useSelector(selectRecentlyPlayed)
  const followedArtists = useSelector(selectFollowedArtists)
  
  const [viewMode, setViewMode] = useState('list')
  const [sortBy, setSortBy] = useState('recent')
  const [filterBy, setFilterBy] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const sortOptions = [
    { value: 'recent', label: 'Recently added', icon: ClockIcon },
    { value: 'alphabetical', label: 'Alphabetical', icon: ArrowsUpDownIcon },
    { value: 'creator', label: 'Creator', icon: UserIcon }
  ]

  const filterOptions = [
    { value: 'all', label: 'All', icon: MusicalNoteIcon },
    { value: 'playlists', label: 'Playlists', icon: MusicalNoteIcon },
    { value: 'artists', label: 'Artists', icon: UserIcon },
    { value: 'albums', label: 'Albums', icon: MusicalNoteIcon }
  ]

  // Create library items array
  const libraryItems = [
    {
      id: 'liked-songs',
      type: 'playlist',
      name: 'Liked Songs',
      description: `${likedSongs.length} songs`,
      coverImage: null,
      isDefault: true,
      updatedAt: likedSongs[0]?.addedAt || new Date().toISOString(),
      songs: likedSongs,
      gradient: 'from-purple-600 to-blue-600'
    },
    ...(recentlyPlayed.length > 0 ? [{
      id: 'recently-played',
      type: 'playlist',
      name: 'Recently Played',
      description: `${recentlyPlayed.length} tracks`,
      coverImage: null,
      isDefault: true,
      updatedAt: recentlyPlayed[0]?.playedAt || new Date().toISOString(),
      songs: recentlyPlayed,
      gradient: 'from-green-600 to-blue-600'
    }] : []),
    ...playlists.filter(p => !p.isDefault).map(p => ({
      ...p,
      type: 'playlist',
      gradient: 'from-orange-600 to-red-600'
    })),
    ...followedArtists.map(artist => ({
      ...artist,
      type: 'artist',
      name: artist.name,
      description: 'Artist',
      updatedAt: artist.followedAt || new Date().toISOString(),
      gradient: 'from-indigo-600 to-purple-600'
    }))
  ]

  // Filter and sort items
  const filteredItems = libraryItems
    .filter(item => {
      if (filterBy !== 'all' && item.type !== filterBy.slice(0, -1)) {
        return false
      }
      if (searchQuery) {
        return item.name.toLowerCase().includes(searchQuery.toLowerCase())
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.name.localeCompare(b.name)
        case 'creator':
          return a.isDefault ? -1 : 1
        case 'recent':
        default:
          return new Date(b.updatedAt) - new Date(a.updatedAt)
      }
    })

  const handleCreatePlaylist = () => {
    dispatch(setIsCreating(true))
    toast.success('Opening playlist creator', { icon: '✨' })
  }

  const handlePlayItem = (item) => {
    if (item.songs && item.songs.length > 0) {
      dispatch(setQueue(item.songs))
      dispatch(setCurrentSong(item.songs[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing "${item.name}"`, { icon: '🎵' })
    } else {
      toast.error('No songs available to play', { icon: '📭' })
    }
  }

  const handleItemClick = (item) => {
    if (item.id === 'liked-songs') {
      navigate('/liked-songs')
    } else if (item.id === 'recently-played') {
      navigate('/recently-played')
    } else if (item.type === 'playlist') {
      navigate(`/playlist/${item.id}`)
    } else if (item.type === 'artist') {
      navigate(`/artist/${item.id}`)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const getItemIcon = (item) => {
    if (item.id === 'liked-songs') {
      return <HeartIconSolid className="w-8 h-8 text-white" />
    }
    if (item.id === 'recently-played') {
      return <ClockIcon className="w-8 h-8 text-white" />
    }
    if (item.type === 'artist') {
      return <UserIcon className="w-8 h-8 text-white" />
    }
    return <MusicalNoteIcon className="w-8 h-8 text-white" />
  }

  const getItemCover = (item) => {
    if (item.type === 'artist') {
      return `bg-gradient-to-br ${item.gradient} rounded-full`
    }
    return `bg-gradient-to-br ${item.gradient}`
  }

  const clearSearch = () => {
    setSearchQuery('')
  }

  const renderListView = () => (
    <div className="space-y-2">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`group flex items-center space-x-4 p-4 rounded-xl hover:bg-spotify-light-gray/50 transition-all duration-300 cursor-pointer transform hover:scale-102 ${
            isVisible ? 'animate-slideIn' : ''
          }`}
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => handleItemClick(item)}
        >
          <div className={`w-16 h-16 ${getItemCover(item)} rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg relative`}>
            {item.coverImage || item.image ? (
              <img 
                src={item.coverImage || item.image} 
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              />
            ) : (
              getItemIcon(item)
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg truncate group-hover:text-spotify-green transition-colors">
              {item.name}
            </h3>
            <p className="text-spotify-text-gray text-sm truncate">
              {item.description}
            </p>
            <p className="text-spotify-text-gray text-xs mt-1">
              Updated {formatDate(item.updatedAt)}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            {item.songs && item.songs.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  handlePlayItem(item)
                }}
                className="opacity-0 group-hover:opacity-100 bg-spotify-green text-black rounded-full p-3 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-spotify-green/25"
              >
                <PlayIconSolid className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
      {filteredItems.map((item, index) => (
        <div
          key={item.id}
          onMouseEnter={() => setHoveredItem(item.id)}
          onMouseLeave={() => setHoveredItem(null)}
          className={`group cursor-pointer transform transition-all duration-300 hover:scale-105 ${
            isVisible ? 'animate-slideIn' : ''
          }`}
          style={{ animationDelay: `${index * 0.05}s` }}
          onClick={() => handleItemClick(item)}
        >
          <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-blue-500/20 transition-all duration-300 relative overflow-hidden">
            <div className={`w-full h-40 ${getItemCover(item)} rounded-xl mb-4 flex items-center justify-center overflow-hidden shadow-lg relative`}>
              {item.coverImage || item.image ? (
                <img 
                  src={item.coverImage || item.image} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              ) : (
                getItemIcon(item)
              )}
            </div>
            
            {item.songs && item.songs.length > 0 && (
              <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handlePlayItem(item)
                  }}
                  className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                >
                  <PlayIconSolid className="w-6 h-6" />
                </button>
              </div>
            )}
            
            <div className="relative z-10">
              <h3 className="text-white font-bold text-lg truncate group-hover:text-spotify-green transition-colors mb-1">
                {item.name}
              </h3>
              <p className="text-spotify-text-gray text-sm truncate mb-2">
                {item.description}
              </p>
              <p className="text-spotify-text-gray text-xs">
                {formatDate(item.updatedAt)}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )

  return (
    <div className={`p-6 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-white to-spotify-green bg-clip-text text-transparent">
            Your Library
          </h1>
          <p className="text-spotify-text-gray text-lg">
            {filteredItems.length} items • {user?.name}
          </p>
        </div>
        <button
          onClick={handleCreatePlaylist}
          className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-6 py-3 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25 flex items-center space-x-2"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Create Playlist</span>
        </button>
      </div>

      {/* Enhanced Controls */}
      <div className="bg-spotify-light-gray/30 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-spotify-green/20">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
            {/* Enhanced Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute z-0 left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white" />
              <input
                type="text"
                placeholder="Search in Your Library"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl pl-12 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green border border-transparent hover:border-spotify-green/30 transition-all duration-300 w-full sm:w-64"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-spotify-text-gray hover:text-white transition-colors"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Enhanced Filter */}
            <div className="relative">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                className="bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green border border-transparent hover:border-spotify-green/30 transition-all duration-300 appearance-none pr-10"
              >
                {filterOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-spotify-gray">
                    {option.label}
                  </option>
                ))}
              </select>
              <FunnelIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-spotify-text-gray pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Enhanced Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spotify-green border border-transparent hover:border-spotify-green/30 transition-all duration-300 appearance-none pr-10"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-spotify-gray">
                    {option.label}
                  </option>
                ))}
              </select>
              <ArrowsUpDownIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-spotify-text-gray pointer-events-none" />
            </div>

            {/* Enhanced View Mode Toggle */}
            <div className="flex bg-spotify-gray/80 backdrop-blur-sm rounded-xl border border-spotify-green/20 overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-3 transition-all duration-300 ${
                  viewMode === 'list' 
                    ? 'bg-spotify-green text-black shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
                title="List view"
              >
                <Bars3Icon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-3 transition-all duration-300 ${
                  viewMode === 'grid' 
                    ? 'bg-spotify-green text-black shadow-lg' 
                    : 'text-white hover:bg-white/10'
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-6">
            {searchQuery ? (
              <MagnifyingGlassIcon className="w-12 h-12 text-spotify-green" />
            ) : (
              <SparklesIcon className="w-12 h-12 text-spotify-green" />
            )}
          </div>
          <h3 className="text-white text-2xl font-bold mb-4">
            {searchQuery ? 'No items found' : 'Your library is empty'}
          </h3>
          <p className="text-spotify-text-gray mb-8 max-w-md mx-auto">
            {searchQuery 
              ? `No results for "${searchQuery}". Try searching for something else.`
              : 'Create your first playlist to get started on your musical journey.'
            }
          </p>
          {searchQuery ? (
            <button
              onClick={clearSearch}
              className="bg-spotify-green/20 text-spotify-green border border-spotify-green/30 font-medium px-6 py-3 rounded-xl hover:bg-spotify-green/30 transition-all duration-300"
            >
              Clear Search
            </button>
          ) : (
            <button
              onClick={handleCreatePlaylist}
              className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-8 py-4 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25"
            >
              Create Your First Playlist
            </button>
          )}
        </div>
      ) : (
        viewMode === 'list' ? renderListView() : renderGridView()
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
        
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
    </div>
  )
}

export default Library
