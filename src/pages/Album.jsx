import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  PlayIcon, 
  PauseIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  ShareIcon,
  PlusIcon,
  ClockIcon,
  MusicalNoteIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { setQueue, setCurrentSong, setIsPlaying } from '../redux/features/playerSlice'
import { 
  addToLikedSongs, 
  removeFromLikedSongs,
  addToRecentlyPlayed,
  selectLikedSongs 
} from '../redux/features/authSlice'
import toast from 'react-hot-toast'

const Album = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Mock album data - replace with real API data
  const album = {
    id,
    title: 'Sample Album',
    artist: 'Sample Artist',
    year: '2024',
    genre: 'Pop',
    coverImage: `https://picsum.photos/400/400?random=${id}`,
    description: 'A fantastic collection of songs that will take you on a musical journey.',
    totalDuration: 2400,
    label: 'Sample Records'
  }

  // Mock songs data - replace with real API data
  const albumSongs = [
    { id: '1', title: 'Song One', artist: album.artist, duration: 180, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', title: 'Song Two', artist: album.artist, duration: 210, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '3', title: 'Song Three', artist: album.artist, duration: 195, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '4', title: 'Song Four', artist: album.artist, duration: 225, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: '5', title: 'Song Five', artist: album.artist, duration: 200, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
  ]

  const { currentSong, isPlaying } = useSelector(state => state.player)
  const likedSongs = useSelector(selectLikedSongs)
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [isAlbumLiked, setIsAlbumLiked] = useState(false)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isCurrentAlbumPlaying = currentSong && albumSongs.some(song => song.id === currentSong.id) && isPlaying

  const handlePlayAlbum = () => {
    if (albumSongs.length > 0) {
      const songsWithCover = albumSongs.map(song => ({
        ...song,
        coverImage: album.coverImage
      }))
      
      dispatch(setQueue(songsWithCover))
      dispatch(setCurrentSong(songsWithCover[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing "${album.title}"`, { icon: '🎵' })
    }
  }

  const handlePauseAlbum = () => {
    dispatch(setIsPlaying(false))
    toast.success('Paused', { icon: '⏸️' })
  }

  const handlePlaySong = (song, index) => {
    const songsWithCover = albumSongs.map(s => ({
      ...s,
      coverImage: album.coverImage
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
      coverImage: album.coverImage,
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

  const handleShareAlbum = () => {
    const shareUrl = `${window.location.origin}/album/${id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Album link copied to clipboard!', { icon: '📋' })
    }).catch(() => {
      toast.error('Failed to copy link', { icon: '❌' })
    })
  }

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const formatTotalDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`
  }

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  if (!album) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="w-10 h-10 text-spotify-green" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Album not found</h2>
          <p className="text-spotify-text-gray mb-6">The album you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Album Header */}
      <div className="bg-gradient-to-b from-orange-900/50 via-red-900/30 to-spotify-black p-8">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-40 h-40 bg-gray-600 rounded-2xl overflow-hidden shadow-2xl relative group">
            <img 
              src={album.coverImage} 
              alt={album.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = `https://picsum.photos/400/400?random=error${id}`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-white text-5xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white to-orange-200 bg-clip-text text-transparent">
              {album.title}
            </h1>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {album.artist.charAt(0)}
                </span>
              </div>
              <p className="text-white text-xl font-bold hover:underline cursor-pointer">
                {album.artist}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-spotify-text-gray text-sm font-medium">
              <span>{album.year}</span>
              <span>•</span>
              <span>{albumSongs.length} songs</span>
              <span>•</span>
              <span>{formatTotalDuration(album.totalDuration)}</span>
              {album.genre && (
                <>
                  <span>•</span>
                  <span>{album.genre}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-6 pt-10">
          <button
            onClick={isCurrentAlbumPlaying ? handlePauseAlbum : handlePlayAlbum}
            className="bg-spotify-green text-black rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-spotify-green/25"
          >
            {isCurrentAlbumPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIconSolid className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={() => setIsAlbumLiked(!isAlbumLiked)}
            className={`p-3 rounded-full transition-all duration-300 transform hover:scale-110 ${
              isAlbumLiked 
                ? 'text-spotify-green bg-spotify-green/20' 
                : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
            }`}
          >
            {isAlbumLiked ? <HeartIconSolid className="w-7 h-7" /> : <HeartIcon className="w-7 h-7" />}
          </button>

          <button
            onClick={handleShareAlbum}
            className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
          >
            <ShareIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Songs List */}
      <div className="px-8 pb-8 pt-6">
        <div className="space-y-1">

          {/* Songs */}
          {albumSongs.map((song, index) => (
            <div
              key={song.id}
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
              className="group grid grid-cols-12 gap-4 px-4 py-3 rounded-lg hover:bg-spotify-light-gray/50 transition-all duration-300 cursor-pointer"
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
                  <PlayIcon className="w-4 h-4" />
                </button>
              </div>
              
              <div className="col-span-6 flex items-center space-x-3">
                <div className="min-w-0 flex-1">
                  <p className={`font-medium truncate transition-colors ${
                    currentSong?.id === song.id ? 'text-spotify-green' : 'text-white group-hover:text-spotify-green'
                  }`}>
                    {song.title}
                  </p>
                  <p className="text-spotify-text-gray text-sm truncate">{song.artist}</p>
                </div>
              </div>
              
              <div className="col-span-3 flex items-center">
                <p className="text-spotify-text-gray text-sm">
                  {Math.floor(Math.random() * 1000000).toLocaleString()}
                </p>
              </div>
              
              <div className="col-span-2 flex items-center justify-end space-x-2">
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
                  {isLiked(song.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                </button>
                
                <span className="text-spotify-text-gray text-sm w-12 text-right font-mono">
                  {formatDuration(song.duration)}
                </span>
                
                <button className="opacity-0 group-hover:opacity-100 text-spotify-text-gray hover:text-white transition-all duration-300 p-1">
                  <EllipsisHorizontalIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Album Info Footer */}
      <div className="px-8 pb-8">
        <div className="bg-spotify-light-gray/30 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-white font-bold text-lg mb-4">About this album</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Release Date</p>
              <p className="text-white font-medium">{album.year}</p>
            </div>
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Genre</p>
              <p className="text-white font-medium">{album.genre}</p>
            </div>
            {album.label && (
              <div>
                <p className="text-spotify-text-gray text-sm mb-2">Label</p>
                <p className="text-white font-medium">{album.label}</p>
              </div>
            )}
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Total Duration</p>
              <p className="text-white font-medium">{formatTotalDuration(album.totalDuration)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Album
