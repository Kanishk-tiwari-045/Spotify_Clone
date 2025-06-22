import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { 
  XMarkIcon, 
  PlayIcon, 
  TrashIcon,
  EllipsisHorizontalIcon,
  QueueListIcon,
  MusicalNoteIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { 
  setCurrentIndex, 
  removeFromQueue, 
  setQueue,
  addToQueue,
  setIsPlaying
} from '../../redux/features/playerSlice'
import { addSongToPlaylist } from '../../redux/features/playlistSlice'
import { addToLikedSongs } from '../../redux/features/authSlice'
import toast from 'react-hot-toast'

const PlayerQueue = ({ onClose }) => {
  const dispatch = useDispatch()
  const { queue, currentIndex, currentSong, isPlaying } = useSelector(state => state.player)
  const playlists = useSelector(state => state.playlist.playlists)
  const [draggedIndex, setDraggedIndex] = useState(null)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const formatDuration = (duration) => {
    if (!duration) return '0:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleSongClick = (index) => {
    dispatch(setCurrentIndex(index))
    dispatch(setIsPlaying(true))
    toast.success('Now playing', { icon: '🎵' })
  }

  const handleRemoveFromQueue = (index) => {
    dispatch(removeFromQueue(index))
    toast.success('Removed from queue', { icon: '🗑️' })
  }

  const handleClearQueue = () => {
    if (window.confirm('Are you sure you want to clear the entire queue?')) {
      dispatch(setQueue([]))
      toast.success('Queue cleared', { icon: '🧹' })
    }
  }

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  // Enhanced drag and drop
  const handleDragStart = (e, index) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
    e.target.style.opacity = '0.5'
  }

  const handleDragEnd = (e) => {
    e.target.style.opacity = '1'
    setDraggedIndex(null)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e, dropIndex) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) return

    const newQueue = [...queue]
    const draggedSong = newQueue[draggedIndex]
    
    newQueue.splice(draggedIndex, 1)
    const adjustedDropIndex = draggedIndex < dropIndex ? dropIndex - 1 : dropIndex
    newQueue.splice(adjustedDropIndex, 0, draggedSong)
    
    let newCurrentIndex = currentIndex
    if (draggedIndex === currentIndex) {
      newCurrentIndex = adjustedDropIndex
    } else if (draggedIndex < currentIndex && adjustedDropIndex >= currentIndex) {
      newCurrentIndex = currentIndex - 1
    } else if (draggedIndex > currentIndex && adjustedDropIndex <= currentIndex) {
      newCurrentIndex = currentIndex + 1
    }
    
    dispatch(setQueue(newQueue))
    if (newCurrentIndex !== currentIndex) {
      dispatch(setCurrentIndex(newCurrentIndex))
    }
    
    toast.success('Queue reordered', { icon: '🔄' })
  }

  const handleAddToPlaylist = (song, playlistId) => {
    dispatch(addSongToPlaylist({ playlistId, song }))
    const playlist = playlists.find(p => p.id === playlistId)
    toast.success(`Added to ${playlist?.name}`, { icon: '➕' })
    setShowAddToPlaylist(null)
  }

  const handleAddToLiked = (song) => {
    dispatch(addToLikedSongs(song))
    toast.success('Added to liked songs', { icon: '💚' })
  }

  const upNext = queue.slice(currentIndex + 1)
  const previousSongs = queue.slice(0, currentIndex)
  const totalDuration = queue.reduce((total, song) => total + (song.duration || 0), 0)

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Queue Panel */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gradient-to-b from-spotify-light-gray via-spotify-gray to-spotify-light-gray border-l border-spotify-green/30 z-40 flex flex-col shadow-2xl transform transition-transform duration-300 ${
        isVisible ? 'translate-x-0' : 'translate-x-full'
      }`}>
        
        {/* Enhanced Header */}
        <div className="relative p-6 bg-gradient-to-r from-spotify-green/20 to-transparent border-b border-spotify-green/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
                <QueueListIcon className="w-6 h-6 text-black" />
              </div>
              <div>
                <h3 className="text-white font-bold text-xl">Queue</h3>
                <p className="text-spotify-text-gray text-sm">
                  {queue.length} songs • {Math.floor(totalDuration / 60)} min
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleClearQueue}
                className="p-2 rounded-full bg-red-500/20 text-red-400 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300 transform hover:scale-110"
                title="Clear queue"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
              <button
                onClick={handleClose}
                className="p-2 rounded-full bg-spotify-text-gray/20 text-spotify-text-gray hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-110"
                title="Close queue"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Queue Content */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-spotify-green/30">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 bg-spotify-green/20 rounded-full flex items-center justify-center mb-4">
                <QueueListIcon className="w-10 h-10 text-spotify-green" />
              </div>
              <h4 className="text-white font-medium mb-2">Your queue is empty</h4>
              <p className="text-spotify-text-gray text-sm">
                Add songs to start building your queue
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-6">
              {/* Now Playing */}
              {currentSong && (
                <div className="animate-fadeIn">
                  <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <div className="w-3 h-3 bg-spotify-green rounded-full animate-pulse"></div>
                    <span>Now playing</span>
                  </h4>
                  <div className="bg-gradient-to-r from-spotify-green/20 via-spotify-gray to-spotify-green/20 rounded-xl p-4 border border-spotify-green/30">
                    <div className="flex items-center space-x-4">
                      <div className="relative w-14 h-14 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                        {currentSong.coverImage ? (
                          <img 
                            src={currentSong.coverImage} 
                            alt={currentSong.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-spotify-green flex items-center justify-center">
                            <MusicalNoteIcon className="w-6 h-6 text-black" />
                          </div>
                        )}
                        {isPlaying && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-semibold truncate">{currentSong.title || currentSong.name}</p>
                        <p className="text-spotify-text-gray text-sm truncate">{currentSong.artist}</p>
                      </div>
                      <div className="w-4 h-4 bg-spotify-green rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Up Next */}
              {upNext.length > 0 && (
                <div className="animate-fadeIn" style={{ animationDelay: '0.1s' }}>
                  <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-spotify-green" />
                    <span>Up next</span>
                    <span className="text-spotify-text-gray text-sm">({upNext.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {upNext.map((song, index) => {
                      const actualIndex = currentIndex + 1 + index
                      return (
                        <div
                          key={`${song.id}-${actualIndex}`}
                          draggable
                          onDragStart={(e) => handleDragStart(e, actualIndex)}
                          onDragEnd={handleDragEnd}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, actualIndex)}
                          onMouseEnter={() => setHoveredSong(actualIndex)}
                          onMouseLeave={() => setHoveredSong(null)}
                          className={`group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-102 ${
                            draggedIndex === actualIndex 
                              ? 'bg-spotify-green/20 shadow-lg' 
                              : 'hover:bg-spotify-light-gray/50'
                          }`}
                          onClick={() => handleSongClick(actualIndex)}
                        >
                          <div className="w-2 text-spotify-text-gray text-sm font-mono">
                            {index + 1}
                          </div>
                          
                          <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 relative">
                            {song.coverImage ? (
                              <img 
                                src={song.coverImage} 
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                <MusicalNoteIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                            {hoveredSong === actualIndex && (
                              <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                <PlayIcon className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{song.title || song.name}</p>
                            <p className="text-spotify-text-gray text-xs truncate">{song.artist}</p>
                          </div>
                          
                          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-spotify-text-gray text-xs font-mono">
                              {formatDuration(song.duration)}
                            </span>
                            
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowAddToPlaylist(showAddToPlaylist === song.id ? null : song.id)
                                }}
                                className="p-1 rounded-full hover:bg-white/10 text-spotify-text-gray hover:text-white transition-all duration-300"
                              >
                                <EllipsisHorizontalIcon className="w-4 h-4" />
                              </button>
                              
                              {showAddToPlaylist === song.id && (
                                <div className="absolute right-0 top-full mt-2 w-52 bg-spotify-light-gray rounded-xl shadow-2xl border border-spotify-green/30 py-2 z-50 animate-slideIn">
                                  <div className="px-4 py-2 text-xs text-spotify-text-gray border-b border-gray-600 mb-2">
                                    Add to playlist
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleAddToLiked(song)
                                      setShowAddToPlaylist(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-white hover:bg-spotify-green/20 transition-colors text-sm flex items-center space-x-2"
                                  >
                                    <span>💚</span>
                                    <span>Add to Liked Songs</span>
                                  </button>
                                  {playlists.filter(p => !p.isDefault).map(playlist => (
                                    <button
                                      key={playlist.id}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleAddToPlaylist(song, playlist.id)
                                      }}
                                      className="w-full text-left px-4 py-2 text-white hover:bg-spotify-green/20 transition-colors text-sm"
                                    >
                                      {playlist.name}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveFromQueue(actualIndex)
                              }}
                              className="p-1 rounded-full hover:bg-red-500/20 text-spotify-text-gray hover:text-red-400 transition-all duration-300"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Recently Played */}
              {previousSongs.length > 0 && (
                <div className="animate-fadeIn" style={{ animationDelay: '0.2s' }}>
                  <h4 className="text-white font-medium mb-3 flex items-center space-x-2">
                    <ClockIcon className="w-4 h-4 text-spotify-text-gray" />
                    <span>Recently played</span>
                    <span className="text-spotify-text-gray text-sm">({previousSongs.length})</span>
                  </h4>
                  <div className="space-y-2">
                    {previousSongs.reverse().map((song, index) => {
                      const actualIndex = previousSongs.length - 1 - index
                      return (
                        <div
                          key={`${song.id}-${actualIndex}`}
                          className="group flex items-center space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-300 opacity-60 hover:opacity-100 hover:bg-spotify-light-gray/30"
                          onClick={() => handleSongClick(actualIndex)}
                        >
                          <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0">
                            {song.coverImage ? (
                              <img 
                                src={song.coverImage} 
                                alt={song.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-600 flex items-center justify-center">
                                <MusicalNoteIcon className="w-4 h-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{song.title || song.name}</p>
                            <p className="text-spotify-text-gray text-xs truncate">{song.artist}</p>
                          </div>
                          
                          <span className="text-spotify-text-gray text-xs opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                            {formatDuration(song.duration)}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Custom animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
        
        .hover\\:scale-102:hover {
          transform: scale(1.02);
        }
      `}</style>
    </>
  )
}

export default PlayerQueue
