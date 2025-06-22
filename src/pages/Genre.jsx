import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  PlayIcon, 
  PauseIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  ShareIcon,
  ArrowLeftIcon,
  MusicalNoteIcon,
  FireIcon,
  StarIcon,
  SparklesIcon
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

const Genre = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Mock genre data - replace with real API data
  const genreData = {
    pop: { 
      name: 'Pop', 
      color: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)', 
      description: 'The most popular music across all charts',
      emoji: '🎤',
      totalSongs: 15420000,
      topArtists: ['Taylor Swift', 'Ed Sheeran', 'Ariana Grande']
    },
    rock: { 
      name: 'Rock', 
      color: 'linear-gradient(135deg, #2c3e50, #34495e)', 
      description: 'Classic and modern rock anthems',
      emoji: '🎸',
      totalSongs: 8750000,
      topArtists: ['Queen', 'Led Zeppelin', 'The Beatles']
    },
    'hip-hop': { 
      name: 'Hip Hop', 
      color: 'linear-gradient(135deg, #8e44ad, #3498db)', 
      description: 'The hottest beats and rhymes',
      emoji: '🎤',
      totalSongs: 12300000,
      topArtists: ['Drake', 'Kendrick Lamar', 'Travis Scott']
    },
    electronic: { 
      name: 'Electronic', 
      color: 'linear-gradient(135deg, #e74c3c, #f39c12)', 
      description: 'Electronic beats and synthesized sounds',
      emoji: '🎧',
      totalSongs: 6890000,
      topArtists: ['Calvin Harris', 'Deadmau5', 'Skrillex']
    },
    jazz: { 
      name: 'Jazz', 
      color: 'linear-gradient(135deg, #d35400, #e67e22)', 
      description: 'Smooth jazz and classic standards',
      emoji: '🎺',
      totalSongs: 3450000,
      topArtists: ['Miles Davis', 'John Coltrane', 'Billie Holiday']
    },
    classical: { 
      name: 'Classical', 
      color: 'linear-gradient(135deg, #9b59b6, #8e44ad)', 
      description: 'Timeless orchestral masterpieces',
      emoji: '🎻',
      totalSongs: 2100000,
      topArtists: ['Mozart', 'Beethoven', 'Bach']
    }
  }

  const genre = genreData[id] || {
    name: id?.charAt(0).toUpperCase() + id?.slice(1),
    color: 'linear-gradient(135deg, #1DB954, #1ed760)',
    description: 'Discover amazing music in this genre',
    emoji: '🎵',
    totalSongs: 1000000,
    topArtists: ['Various Artists']
  }

  // Mock songs data - replace with real API data
  const genreSongs = [
    { id: '1', title: `${genre.name} Hit One`, artist: 'Popular Artist', duration: 180, playCount: 15000000, coverImage: `https://picsum.photos/300/300?random=genre1`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', title: `${genre.name} Track Two`, artist: 'Famous Singer', duration: 210, playCount: 12000000, coverImage: `https://picsum.photos/300/300?random=genre2`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '3', title: `${genre.name} Song Three`, artist: 'Chart Topper', duration: 195, playCount: 8500000, coverImage: `https://picsum.photos/300/300?random=genre3`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '4', title: `${genre.name} Anthem Four`, artist: 'Rising Star', duration: 225, playCount: 6200000, coverImage: `https://picsum.photos/300/300?random=genre4`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: '5', title: `${genre.name} Beat Five`, artist: 'Top Artist', duration: 200, playCount: 4800000, coverImage: `https://picsum.photos/300/300?random=genre5`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
    { id: '6', title: `${genre.name} Melody Six`, artist: 'Superstar', duration: 190, playCount: 3200000, coverImage: `https://picsum.photos/300/300?random=genre6`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' }
  ]

  const { currentSong, isPlaying } = useSelector(state => state.player)
  const likedSongs = useSelector(selectLikedSongs)
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isCurrentGenrePlaying = currentSong && genreSongs.some(song => song.id === currentSong.id) && isPlaying

  const handlePlayGenre = () => {
    if (genreSongs.length > 0) {
      dispatch(setQueue(genreSongs))
      dispatch(setCurrentSong(genreSongs[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing ${genre.name} music`, { icon: genre.emoji })
    }
  }

  const handlePauseGenre = () => {
    dispatch(setIsPlaying(false))
    toast.success('Paused', { icon: '⏸️' })
  }

  const handlePlaySong = (song, index) => {
    const songsFromIndex = genreSongs.slice(index)
    dispatch(setQueue(songsFromIndex))
    dispatch(setCurrentSong(song))
    dispatch(setIsPlaying(true))
    dispatch(addToRecentlyPlayed({
      ...song,
      playedAt: new Date().toISOString()
    }))
    toast.success(`Playing "${song.title}"`, { icon: '🎵' })
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

  const handleShareGenre = () => {
    const shareUrl = `${window.location.origin}/genre/${id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Genre link copied to clipboard!', { icon: '📋' })
    }).catch(() => {
      toast.error('Failed to copy link', { icon: '❌' })
    })
  }

  const formatDuration = (duration) => {
    const minutes = Math.floor(duration / 60)
    const seconds = Math.floor(duration % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  if (!genre) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="w-10 h-10 text-spotify-green" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Genre not found</h2>
          <p className="text-spotify-text-gray mb-6">The genre you're looking for doesn't exist.</p>
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
      {/* Back Button */}
      <div className="p-6 pb-0">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-spotify-text-gray hover:text-white transition-colors mb-6"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back</span>
        </button>
      </div>

      {/* Genre Header */}
      <div className="relative overflow-hidden">
        <div 
          className="w-full h-80 flex items-center justify-center relative"
          style={{ background: genre.color }}
        >
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-float"></div>
            <div className="absolute top-20 right-20 w-16 h-16 bg-white rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-10 right-1/3 w-24 h-24 bg-white rounded-full animate-float" style={{ animationDelay: '3s' }}></div>
          </div>
          
          <div className="text-center relative z-10">
            <div className="text-8xl mb-4 animate-bounce">{genre.emoji}</div>
            <h1 className="text-white text-6xl md:text-8xl font-black mb-4 drop-shadow-2xl">
              {genre.name}
            </h1>
            <p className="text-white/90 text-xl max-w-2xl mx-auto mb-6 drop-shadow-lg">
              {genre.description}
            </p>
            <div className="flex items-center justify-center space-x-6 text-white/80">
              <span className="flex items-center space-x-2">
                <FireIcon className="w-5 h-5" />
                <span>{genre.totalSongs?.toLocaleString()} songs</span>
              </span>
              <span className="flex items-center space-x-2">
                <StarIcon className="w-5 h-5" />
                <span>Top artists: {genre.topArtists?.slice(0, 2).join(', ')}</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gradient-to-b from-spotify-black/50 to-spotify-black p-8">
        <div className="flex items-center space-x-6">
          <button
            onClick={isCurrentGenrePlaying ? handlePauseGenre : handlePlayGenre}
            className="bg-spotify-green text-black rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-spotify-green/25"
          >
            {isCurrentGenrePlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIconSolid className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={handleShareGenre}
            className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
          >
            <ShareIcon className="w-7 h-7" />
          </button>

          <button className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110">
            <EllipsisHorizontalIcon className="w-7 h-7" />
          </button>

          <div className="text-spotify-text-gray">
            <span className="flex items-center space-x-2">
              <SparklesIcon className="w-5 h-5 text-spotify-green" />
              <span>{genreSongs.length} songs in this genre</span>
            </span>
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="px-8 pb-8">
        <h2 className="text-white text-2xl font-bold mb-6 flex items-center space-x-2">
          <FireIcon className="w-6 h-6 text-spotify-green" />
          <span>Popular in {genre.name}</span>
        </h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {genreSongs.map((song, index) => (
            <div
              key={song.id}
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => handlePlaySong(song, index)}
            >
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-blue-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative">
                  <img
                    src={song.coverImage}
                    alt={song.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/300/300?random=error${song.id}`
                    }}
                  />
                  {hoveredSong === song.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePlaySong(song, index)
                    }}
                    className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                  >
                    <PlayIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors mb-1">
                    {song.title}
                  </h3>
                  <p className="text-spotify-text-gray text-sm truncate mb-2">{song.artist}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-spotify-text-gray text-xs">
                      {song.playCount?.toLocaleString()} plays
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleLikeSong(song)
                      }}
                      className={`transition-all duration-300 p-1 rounded-full ${
                        isLiked(song.id) 
                          ? 'text-spotify-green' 
                          : 'text-spotify-text-gray hover:text-white'
                      }`}
                    >
                      {isLiked(song.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Genre Stats */}
      <div className="px-8 pb-8">
        <div className="bg-spotify-light-gray/30 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-white font-bold text-lg mb-4">About {genre.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Total Songs</p>
              <p className="text-white font-medium text-xl">{genre.totalSongs?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Top Artists</p>
              <p className="text-white font-medium">{genre.topArtists?.slice(0, 3).join(', ')}</p>
            </div>
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Popularity</p>
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className="w-4 h-4 text-spotify-green fill-current" />
                  ))}
                </div>
                <span className="text-white font-medium">5.0</span>
              </div>
            </div>
          </div>
        </div>
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
      `}</style>
    </div>
  )
}

export default Genre
