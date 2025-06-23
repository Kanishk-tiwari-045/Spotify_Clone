import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import AddToPlaylistModal from '../components/Sidebar/AddToPlaylistModal'
import { 
  ClockIcon, 
  PlayIcon, 
  PauseIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  PlusIcon,
  MusicalNoteIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { 
  setQueue, 
  setCurrentSong, 
  setIsPlaying,
  toggleShuffle 
} from '../redux/features/playerSlice'
import { 
  addToLikedSongs,
  removeFromLikedSongs,
  selectRecentlyPlayed, 
  selectUser,
  selectLikedSongs,
  clearRecentlyPlayed
} from '../redux/features/authSlice'
import toast from 'react-hot-toast'

const RecentlyPlayed = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector(selectUser)
  const recentlyPlayed = useSelector(selectRecentlyPlayed)
  const likedSongs = useSelector(selectLikedSongs)
  const { currentSong, isPlaying, isShuffled } = useSelector(state => state.player)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null)
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [sortBy, setSortBy] = useState('recent')

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isCurrentPlaylistPlaying = currentSong && recentlyPlayed.some(song => song.id === currentSong.id) && isPlaying

  const sortedSongs = [...recentlyPlayed].sort((a, b) => {
    switch (sortBy) {
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'artist':
        return a.artist.localeCompare(b.artist)
      case 'recent':
      default:
        return new Date(b.playedAt) - new Date(a.playedAt)
    }
  })

const handlePlaySong = (song, index) => {
  dispatch(setQueue(sortedSongs))
  dispatch(setCurrentSong(song))
  dispatch(setIsPlaying(true))
  toast.success(`Playing "${song.title}"`, { icon: '🎵' })
}

  const handlePlayAll = () => {
    if (recentlyPlayed.length > 0) {
      dispatch(setQueue(recentlyPlayed))
      dispatch(setCurrentSong(recentlyPlayed[0]))
      dispatch(setIsPlaying(true))
      toast.success('Playing recently played songs', { icon: '🎶' })
    }
  }

  const handlePauseAll = () => {
    dispatch(setIsPlaying(false))
    toast.success('Paused', { icon: '⏸️' })
  }

  const handleShuffle = () => {
    dispatch(toggleShuffle())
    if (recentlyPlayed.length > 0) {
      const shuffledSongs = [...recentlyPlayed].sort(() => Math.random() - 0.5)
      dispatch(setQueue(shuffledSongs))
      dispatch(setCurrentSong(shuffledSongs[0]))
      dispatch(setIsPlaying(true))
      toast.success(isShuffled ? 'Shuffle off' : 'Shuffle on', { icon: '🔀' })
    }
  }

  const handleLikeSong = (song) => {
    const isLiked = likedSongs.some(s => s.id === song.id)
    const songWithData = {
      ...song,
      addedAt: new Date().toISOString()
    }
    
    if (isLiked) {
      dispatch(removeFromLikedSongs(song.id))
      toast.success('Removed from liked songs', { icon: '💔' })
    } else {
      dispatch(addToLikedSongs(songWithData))
      toast.success('Added to liked songs', { icon: '💚' })
    }
  }

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your listening history?\n\nThis action cannot be undone.')) {
      dispatch(clearRecentlyPlayed())
      toast.success('Listening history cleared', { icon: '🧹' })
    }
  }

  const handleDownloadHistory = () => {
    const historyData = {
      name: 'Recently Played',
      description: 'Your listening history',
      songs: recentlyPlayed,
      exportedAt: new Date().toISOString(),
      totalSongs: recentlyPlayed.length
    }
    
    const dataStr = JSON.stringify(historyData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = 'recently_played.json'
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('History exported successfully!', { icon: '💾' })
  }

  const handleShareHistory = () => {
    const shareText = `Check out my ${recentlyPlayed.length} recently played songs on Spotify Clone!`
    navigator.clipboard.writeText(shareText).then(() => {
      toast.success('History info copied to clipboard!', { icon: '📋' })
    }).catch(() => {
      toast.error('Failed to copy', { icon: '❌' })
    })
  }

  const formatDuration = (duration) => {
    if (!duration) return '3:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatPlayedTime = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  const totalDuration = recentlyPlayed.reduce((total, song) => total + (song.duration || 180), 0)
  const totalHours = Math.floor(totalDuration / 3600)
  const totalMinutes = Math.floor((totalDuration % 3600) / 60)

  return (
    <div className={`h-full transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Enhanced Header */}
      <div className="bg-gradient-to-b from-purple-400 via-violet-700 to-spotify-light-gray p-8 space-y-10 relative overflow-hidden">

        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-40 h-40 bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            <ClockIcon className="w-16 h-16 text-white relative z-10 opacity-80" />
            <div className="absolute inset-0 animate-ping bg-white/10 rounded-2xl"></div>
          </div>
          
          <div className="flex-1 text-white text-center md:text-left">
            <h1 className="text-4xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
              Recently Played
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 text-sm font-medium mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span>{user?.name}</span>
              </div>
              <span>•</span>
                <span>{recentlyPlayed.length} songs</span>
              {totalDuration > 0 && (
                <>
                  <span>•</span>
                  <span>
                    {totalHours > 0 ? `${totalHours} hr ` : ''}{totalMinutes} min
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {recentlyPlayed.length > 0 && (
              <button
                onClick={isCurrentPlaylistPlaying ? handlePauseAll : handlePlayAll}
                className="bg-spotify-green text-black rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-spotify-green/25"
              >
                {isCurrentPlaylistPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIconSolid className="w-8 h-8" />
                )}
              </button>
            )}
            
            {recentlyPlayed.length > 0 && (
              <button
                onClick={handleShuffle}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isShuffled 
                    ? 'text-spotify-green bg-spotify-green/20 shadow-lg' 
                    : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
                }`}
                title="Shuffle"
              >
                <ArrowsRightLeftIcon className="w-7 h-7" />
              </button>
            )}

            <button
              onClick={handleDownloadHistory}
              className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              title="Export history"
            >
              <ArrowDownTrayIcon className="w-7 h-7" />
            </button>

            <button
              onClick={handleShareHistory}
              className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              title="Share"
            >
              <ShareIcon className="w-7 h-7" />
            </button>

            {recentlyPlayed.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 transform hover:scale-110"
                title="Clear history"
              >
                <TrashIcon className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Songs List */}
      <div className="px-8 pb-8 pt-6">
        {recentlyPlayed.length > 0 ? (
          <div className="space-y-2">

            {/* Enhanced Songs */}
            {sortedSongs.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                onMouseEnter={() => setHoveredSong(`${song.id}-${index}`)}
                onMouseLeave={() => setHoveredSong(null)}
                className="group grid grid-cols-9 gap-4 px-4 py-3 rounded-xl hover:bg-spotify-light-gray/50 transition-all duration-300 cursor-pointer transform hover:scale-102"
                onDoubleClick={() => handlePlaySong(song, index)}
              >
                <div className="col-span-1 flex items-center">
                  <span className={`text-spotify-text-gray text-sm group-hover:hidden ${
                    currentSong?.id === song.id ? 'text-spotify-green' : ''
                  }`}>
                    {currentSong?.id === song.id && isPlaying ? '♪' : index + 1}
                  </span>
                  <button
                    onClick={() => handlePlaySong(song, index)}
                    className="hidden group-hover:block text-white hover:text-spotify-green transition-colors"
                  >
                    <PlayIcon className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="col-span-5 flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 shadow-lg relative">
                    {song.coverImage ? (
                      <img 
                        src={song.coverImage} 
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.style.display = 'none'
                          e.target.parentElement.style.backgroundColor = '#1DB954'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-spotify-green to-green-400 flex items-center justify-center">
                        <MusicalNoteIcon className="w-5 h-5 text-black" />
                      </div>
                    )}
                  </div>
                  
                  <div className="min-w-0 flex-1">
                    <p className={`font-semibold truncate text-lg transition-colors ${
                      currentSong?.id === song.id ? 'text-spotify-green' : 'text-white group-hover:text-spotify-green'
                    }`}>
                      {song.title}
                    </p>
                    <p className="text-spotify-text-gray text-sm truncate">{song.artist}</p>
                  </div>
                </div>
                
                <div className="col-span-2 flex items-center">
                  <p className="text-spotify-text-gray text-sm">
                    {formatPlayedTime(song.playedAt)}
                  </p>
                </div>
                
                <div className="col-span-1 flex items-center justify-end space-x-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLikeSong(song)
                    }}
                    className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-1 rounded-full ${
                      isLiked(song.id) 
                        ? 'text-spotify-green opacity-100' 
                        : 'text-spotify-text-gray hover:text-white'
                    }`}
                  >
                    {isLiked(song.id) ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowAddToPlaylist(song.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 text-spotify-text-gray hover:text-spotify-green transition-all duration-300 p-1 rounded-full hover:bg-spotify-green/20"
                    title="Add to playlist"
                  >
                    <PlusIcon className="w-5 h-5" />
                  </button>
                  <span className="text-spotify-text-gray text-sm font-mono">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <ClockIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-white text-3xl font-bold mb-4">No recently played songs</h3>
            <p className="text-spotify-text-gray mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Songs you play will appear here. Start listening to build your history and discover your music patterns.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-8 py-4 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25"
            >
              Discover Music
            </button>
          </div>
        )}
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .scale-102 {
          transform: scale(1.02);
        }
      `}</style>
      {showAddToPlaylist && (
        <AddToPlaylistModal 
          song={sortedSongs.find(s => s.id === showAddToPlaylist)} 
          onClose={() => setShowAddToPlaylist(null)} 
        />
      )}
    </div>
  )
}

export default RecentlyPlayed
