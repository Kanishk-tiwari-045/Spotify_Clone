import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  PlayIcon, 
  PauseIcon,
  PencilIcon, 
  EllipsisHorizontalIcon,
  HeartIcon,
  ShareIcon,
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  ClockIcon,
  MusicalNoteIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { 
  setQueue, 
  setCurrentSong, 
  setIsPlaying,
  toggleShuffle 
} from '../redux/features/playerSlice'
import { 
  deletePlaylist,
  updatePlaylist,
  setIsEditing,
  addSongToPlaylist,
  removeSongFromPlaylist
} from '../redux/features/playlistSlice'
import { 
  addToLikedSongs,
  removeFromLikedSongs,
  addToRecentlyPlayed,
  selectLikedSongs,
  selectUser
} from '../redux/features/authSlice'
import toast from 'react-hot-toast'

const Playlist = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const playlist = useSelector(state => 
    state.playlist.playlists.find(p => p.id === id)
  )
  const likedSongs = useSelector(selectLikedSongs)
  const { currentSong, isPlaying, isShuffled } = useSelector(state => state.player)
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [isEditing, setIsEditingState] = useState(false)
  const [editForm, setEditForm] = useState({
    name: '',
    description: ''
  })

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
    if (playlist) {
      setEditForm({
        name: playlist.name,
        description: playlist.description || ''
      })
    }
  }, [playlist])

  // NEW: Persistence effect - Save playlist changes to localStorage
  useEffect(() => {
    if (playlist && user?.id) {
      // Save playlist state to localStorage whenever playlist changes
      const playlistKey = `spotify_clone_playlists_${user.id}`
      try {
        const allPlaylists = JSON.parse(localStorage.getItem(playlistKey) || '[]')
        
        // Update the specific playlist in the stored data
        const updatedPlaylists = allPlaylists.map(p => 
          p.id === playlist.id ? playlist : p
        )
        
        // If playlist doesn't exist in storage, add it
        if (!allPlaylists.find(p => p.id === playlist.id)) {
          updatedPlaylists.push(playlist)
        }
        
        localStorage.setItem(playlistKey, JSON.stringify(updatedPlaylists))
      } catch (error) {
        console.error('Failed to save playlist to storage:', error)
      }
    }
  }, [playlist, user?.id])

  const isCurrentPlaylistPlaying = currentSong && playlist?.songs?.some(song => song.id === currentSong.id) && isPlaying

  const handlePlayPlaylist = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      const songsWithCover = playlist.songs.map(song => ({
        ...song,
        coverImage: song.coverImage || playlist.coverImage
      }))
      
      dispatch(setQueue(songsWithCover))
      dispatch(setCurrentSong(songsWithCover[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing "${playlist.name}"`, { icon: '🎵' })
    } else {
      toast.error('This playlist is empty', { icon: '📭' })
    }
  }

  const handlePausePlaylist = () => {
    dispatch(setIsPlaying(false))
    toast.success('Paused', { icon: '⏸️' })
  }

  const handlePlaySong = (song, index) => {
    const songsWithCover = playlist.songs.map(s => ({
      ...s,
      coverImage: s.coverImage || playlist.coverImage
    }))
    
    const songsFromIndex = songsWithCover.slice(index)
    dispatch(setQueue(songsFromIndex))
    dispatch(setCurrentSong(songsWithCover[index]))
    dispatch(setIsPlaying(true))
    dispatch(addToRecentlyPlayed({
      ...songsWithCover[index],
      playedAt: new Date().toISOString()
    }))
    toast.success(`Playing "${song.title}"`, { icon: '🎵' })
  }

  const handleLikeSong = (song) => {
    const isLiked = likedSongs.some(s => s.id === song.id)
    const songWithCover = {
      ...song,
      coverImage: song.coverImage || playlist.coverImage,
      addedAt: new Date().toISOString()
    }
    
    if (isLiked) {
      dispatch(removeFromLikedSongs(song.id))
      toast.success('Removed from liked songs', { icon: '💔' })
    } else {
      dispatch(addToLikedSongs(songWithCover))
      toast.success('Added to liked songs', { icon: '💚' })
    }
  }

  const handleRemoveSong = (songId) => {
    if (window.confirm('Remove this song from the playlist?')) {
      dispatch(removeSongFromPlaylist({ playlistId: id, songId }))
      
      // NEW: Immediately persist the change
      if (user?.id) {
        try {
          const playlistKey = `spotify_clone_playlists_${user.id}`
          const allPlaylists = JSON.parse(localStorage.getItem(playlistKey) || '[]')
          const updatedPlaylists = allPlaylists.map(p => {
            if (p.id === id) {
              return {
                ...p,
                songs: p.songs.filter(s => s.id !== songId),
                updatedAt: new Date().toISOString()
              }
            }
            return p
          })
          localStorage.setItem(playlistKey, JSON.stringify(updatedPlaylists))
        } catch (error) {
          console.error('Failed to persist song removal:', error)
        }
      }
      
      toast.success('Song removed from playlist', { icon: '🗑️' })
    }
  }

  const handleShuffle = () => {
    dispatch(toggleShuffle())
    if (playlist?.songs && playlist.songs.length > 0) {
      const shuffledSongs = [...playlist.songs].sort(() => Math.random() - 0.5)
      dispatch(setQueue(shuffledSongs))
      dispatch(setCurrentSong(shuffledSongs[0]))
      dispatch(setIsPlaying(true))
      toast.success(isShuffled ? 'Shuffle off' : 'Shuffle on', { icon: '🔀' })
    }
  }

  const handleEditPlaylist = () => {
    setIsEditingState(true)
  }

  const handleSaveEdit = () => {
    const updates = {
      name: editForm.name.trim(),
      description: editForm.description.trim(),
      updatedAt: new Date().toISOString()
    }
    
    dispatch(updatePlaylist({
      id,
      updates
    }))
    
    // NEW: Immediately persist the edit
    if (user?.id) {
      try {
        const playlistKey = `spotify_clone_playlists_${user.id}`
        const allPlaylists = JSON.parse(localStorage.getItem(playlistKey) || '[]')
        const updatedPlaylists = allPlaylists.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
        localStorage.setItem(playlistKey, JSON.stringify(updatedPlaylists))
      } catch (error) {
        console.error('Failed to persist playlist edit:', error)
      }
    }
    
    setIsEditingState(false)
    toast.success('Playlist updated', { icon: '✏️' })
  }

  const handleDeletePlaylist = () => {
    if (playlist.isDefault) {
      toast.error('Cannot delete default playlists', { icon: '🚫' })
      return
    }
    
    if (window.confirm(`Are you sure you want to delete "${playlist.name}"?\n\nThis action cannot be undone.`)) {
      dispatch(deletePlaylist(id))
      
      // NEW: Remove from localStorage
      if (user?.id) {
        try {
          const playlistKey = `spotify_clone_playlists_${user.id}`
          const allPlaylists = JSON.parse(localStorage.getItem(playlistKey) || '[]')
          const updatedPlaylists = allPlaylists.filter(p => p.id !== id)
          localStorage.setItem(playlistKey, JSON.stringify(updatedPlaylists))
        } catch (error) {
          console.error('Failed to persist playlist deletion:', error)
        }
      }
      
      toast.success(`Deleted "${playlist.name}"`, { icon: '🗑️' })
      navigate('/library')
    }
  }

  const handleSharePlaylist = () => {
    const shareUrl = `${window.location.origin}/playlist/${id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Playlist link copied to clipboard!', { icon: '📋' })
    }).catch(() => {
      toast.error('Failed to copy link', { icon: '❌' })
    })
  }

  const handleDownloadPlaylist = () => {
    const playlistData = {
      name: playlist.name,
      description: playlist.description,
      songs: playlist.songs,
      createdAt: playlist.createdAt,
      exportedAt: new Date().toISOString(),
      totalSongs: playlist.songs?.length || 0
    }
    
    const dataStr = JSON.stringify(playlistData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${playlist.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
    link.click()
    
    URL.revokeObjectURL(url)
    toast.success('Playlist exported successfully!', { icon: '💾' })
  }

  // NEW: Add song to playlist with persistence
  const handleAddSongToPlaylist = (song) => {
    dispatch(addSongToPlaylist({ playlistId: id, song }))
    
    // Immediately persist the addition
    if (user?.id) {
      try {
        const playlistKey = `spotify_clone_playlists_${user.id}`
        const allPlaylists = JSON.parse(localStorage.getItem(playlistKey) || '[]')
        const updatedPlaylists = allPlaylists.map(p => {
          if (p.id === id) {
            const songExists = p.songs.some(s => s.id === song.id)
            if (!songExists) {
              return {
                ...p,
                songs: [...p.songs, {
                  ...song,
                  addedAt: new Date().toISOString(),
                  addedBy: user.id,
                  playlistId: id
                }],
                updatedAt: new Date().toISOString()
              }
            }
          }
          return p
        })
        localStorage.setItem(playlistKey, JSON.stringify(updatedPlaylists))
      } catch (error) {
        console.error('Failed to persist song addition:', error)
      }
    }
    
    toast.success(`Added "${song.title}" to playlist`, { icon: '➕' })
  }

  const formatDuration = (duration) => {
    if (!duration) return '3:00'
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown'
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now - date)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) return 'Today'
    if (diffDays === 2) return 'Yesterday'
    if (diffDays <= 7) return `${diffDays} days ago`
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  const totalDuration = playlist?.songs?.reduce((total, song) => total + (song.duration || 180), 0) || 0
  const totalHours = Math.floor(totalDuration / 3600)
  const totalMinutes = Math.floor((totalDuration % 3600) / 60)

  if (!playlist) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="w-10 h-10 text-spotify-green" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Playlist not found</h2>
          <p className="text-spotify-text-gray mb-6">The playlist you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/library')}
            className="btn-primary"
          >
            Go to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`h-full transition-all ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Enhanced Header - Same style as LikedSongs */}
      <div className="bg-gradient-to-b from-purple-400 via-violet-700 to-spotify-light-gray p-8 space-y-10 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-40 h-40 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl relative overflow-hidden">
            {playlist.coverImage ? (
              <img 
                src={playlist.coverImage} 
                alt={playlist.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
            )}
            {!playlist.coverImage && (
              <>
                <MusicalNoteIcon className="w-16 h-16 text-white relative z-10 opacity-80" />
                <div className="absolute inset-0 animate-ping bg-white/10 rounded-2xl"></div>
              </>
            )}
          </div>
          
          <div className="flex-1 text-white text-center md:text-left">
            {isEditing ? (
              <div className="space-y-4 mb-4">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  className="bg-spotify-gray text-white text-4xl md:text-3xl lg:text-4xl font-black rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green w-full"
                  maxLength={100}
                />
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add a description..."
                  className="bg-spotify-gray text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-spotify-green w-full resize-none"
                  rows={3}
                  maxLength={300}
                />
                <div className="flex space-x-3">
                  <button
                    onClick={handleSaveEdit}
                    className="bg-spotify-green text-black font-bold px-6 py-2 rounded-lg hover:bg-green-400 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setIsEditingState(false)}
                    className="bg-gray-600 text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <h1 className="text-4xl md:text-3xl lg:text-4xl font-black mb-4 leading-tight bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
                {playlist.name}
              </h1>
            )}
            
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
              <span className="flex items-center space-x-1">
                <span>{playlist.songs?.length || 0} songs</span>
              </span>
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
        
        {/* Controls - Same style as LikedSongs */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {playlist.songs && playlist.songs.length > 0 && (
              <button
                onClick={isCurrentPlaylistPlaying ? handlePausePlaylist : handlePlayPlaylist}
                className="bg-spotify-green text-black rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-spotify-green/25"
              >
                {isCurrentPlaylistPlaying ? (
                  <PauseIcon className="w-8 h-8" />
                ) : (
                  <PlayIconSolid className="w-8 h-8" />
                )}
              </button>
            )}
            
            {playlist.songs && playlist.songs.length > 0 && (
              <button
                onClick={handleShuffle}
                className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
                  isShuffled 
                    ? 'text-spotify-green bg-spotify-green/20 shadow-lg shadow-spotify-green/25' 
                    : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
                }`}
                title="Shuffle"
              >
                <ArrowsRightLeftIcon className="w-7 h-7" />
              </button>
            )}

            {!playlist.isDefault && (
              <button
                onClick={handleEditPlaylist}
                className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
                title="Edit playlist"
              >
                <PencilIcon className="w-7 h-7" />
              </button>
            )}

            <button
              onClick={handleDownloadPlaylist}
              className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              title="Export playlist"
            >
              <ArrowDownTrayIcon className="w-7 h-7" />
            </button>

            <button
              onClick={handleSharePlaylist}
              className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
              title="Share"
            >
              <ShareIcon className="w-7 h-7" />
            </button>

            {!playlist.isDefault && (
              <button
                onClick={handleDeletePlaylist}
                className="p-3 rounded-full text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all duration-300 transform hover:scale-110"
                title="Delete playlist"
              >
                <TrashIcon className="w-7 h-7" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Songs List - Same style as LikedSongs */}
      <div className="px-10 pb-8 pt-6">
        {playlist.songs && playlist.songs.length > 0 ? (
          <div className="space-y-2">
            {/* Enhanced Songs */}
            {playlist.songs.map((song, index) => (
              <div
                key={song.id}
                onMouseEnter={() => setHoveredSong(song.id)}
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
                    {song.coverImage || playlist.coverImage ? (
                      <img 
                        src={song.coverImage || playlist.coverImage} 
                        alt={song.title}
                        className="w-full h-full object-cover transition-transform duration-300"
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
                    {formatDate(song.addedAt)}
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
                  {!playlist.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveSong(song.id)
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 transition-all duration-300 p-1"
                      title="Remove from playlist"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                  <span className="text-spotify-text-gray text-sm font-mono">
                    {formatDuration(song.duration)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
              <PlusIcon className="w-12 h-12 text-white" />
            </div>
            <h3 className="text-white text-3xl font-bold mb-4">Let's find something for your playlist</h3>
            <p className="text-spotify-text-gray mb-8 max-w-md mx-auto text-lg leading-relaxed">
              Search for songs or browse your library to add tracks to this playlist.
            </p>
            <button
              onClick={() => navigate('/search')}
              className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-8 py-4 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25"
            >
              Find Songs
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
    </div>
  )
}

export default Playlist
