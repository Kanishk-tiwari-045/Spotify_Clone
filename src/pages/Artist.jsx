import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  PlayIcon, 
  PauseIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  ShareIcon,
  UserPlusIcon,
  UserMinusIcon,
  ArrowLeftIcon,
  MusicalNoteIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { setQueue, setCurrentSong, setIsPlaying } from '../redux/features/playerSlice'
import { 
  addToLikedSongs, 
  removeFromLikedSongs,
  addToRecentlyPlayed,
  selectLikedSongs,
  followArtist,
  unfollowArtist,
  selectFollowedArtists
} from '../redux/features/authSlice'
import toast from 'react-hot-toast'

const Artist = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  
  // Mock artist data - replace with real API data
  const artist = {
    id,
    name: 'Sample Artist',
    image: `https://picsum.photos/400/400?random=artist${id}`,
    monthlyListeners: 5420000,
    followers: 2100000,
    verified: true,
    genre: ['Pop', 'Rock'],
    biography: 'A talented artist who has been creating amazing music for years. Known for their unique style and powerful vocals.',
    country: 'United States',
    website: 'https://sampleartist.com'
  }

  // Mock songs data - replace with real API data
  const artistSongs = [
    { id: '1', title: 'Hit Song One', artist: artist.name, duration: 180, playCount: 15000000, coverImage: `https://picsum.photos/300/300?random=song1`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
    { id: '2', title: 'Popular Track Two', artist: artist.name, duration: 210, playCount: 12000000, coverImage: `https://picsum.photos/300/300?random=song2`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
    { id: '3', title: 'Amazing Song Three', artist: artist.name, duration: 195, playCount: 8500000, coverImage: `https://picsum.photos/300/300?random=song3`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
    { id: '4', title: 'Great Track Four', artist: artist.name, duration: 225, playCount: 6200000, coverImage: `https://picsum.photos/300/300?random=song4`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
    { id: '5', title: 'Wonderful Song Five', artist: artist.name, duration: 200, playCount: 4800000, coverImage: `https://picsum.photos/300/300?random=song5`, audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' }
  ]

  // Mock albums data
  const artistAlbums = [
    { id: '1', title: 'Latest Album', year: '2024', coverImage: `https://picsum.photos/300/300?random=album1` },
    { id: '2', title: 'Previous Release', year: '2023', coverImage: `https://picsum.photos/300/300?random=album2` },
    { id: '3', title: 'Debut Album', year: '2021', coverImage: `https://picsum.photos/300/300?random=album3` }
  ]

  const { currentSong, isPlaying } = useSelector(state => state.player)
  const likedSongs = useSelector(selectLikedSongs)
  const followedArtists = useSelector(selectFollowedArtists)
  
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredSong, setHoveredSong] = useState(null)
  const [showAllSongs, setShowAllSongs] = useState(false)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isCurrentArtistPlaying = currentSong && artistSongs.some(song => song.id === currentSong.id) && isPlaying
  const isFollowing = followedArtists.some(a => a.id === artist.id)

  const handlePlayArtist = () => {
    if (artistSongs.length > 0) {
      const songsWithCover = artistSongs.map(song => ({
        ...song,
        coverImage: song.coverImage || artist.image
      }))
      
      dispatch(setQueue(songsWithCover))
      dispatch(setCurrentSong(songsWithCover[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing ${artist.name}`, { icon: '🎵' })
    }
  }

  const handlePauseArtist = () => {
    dispatch(setIsPlaying(false))
    toast.success('Paused', { icon: '⏸️' })
  }

  const handlePlaySong = (song, index) => {
    const songsWithCover = artistSongs.map(s => ({
      ...s,
      coverImage: s.coverImage || artist.image
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
      coverImage: song.coverImage || artist.image,
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

  const handleFollowArtist = () => {
    const artistData = {
      ...artist,
      followedAt: new Date().toISOString()
    }
    
    if (isFollowing) {
      dispatch(unfollowArtist(artist.id))
      toast.success(`Unfollowed ${artist.name}`, { icon: '👋' })
    } else {
      dispatch(followArtist(artistData))
      toast.success(`Following ${artist.name}`, { icon: '❤️' })
    }
  }

  const handleShareArtist = () => {
    const shareUrl = `${window.location.origin}/artist/${id}`
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Artist link copied to clipboard!', { icon: '📋' })
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

  const displayedSongs = showAllSongs ? artistSongs : artistSongs.slice(0, 5)

  if (!artist) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-spotify-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MusicalNoteIcon className="w-10 h-10 text-spotify-green" />
          </div>
          <h2 className="text-white text-2xl font-bold mb-4">Artist not found</h2>
          <p className="text-spotify-text-gray mb-6">The artist you're looking for doesn't exist.</p>
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

      {/* Artist Header */}
      <div className="bg-gradient-to-b from-blue-900/50 via-indigo-900/30 to-spotify-black p-8">
        <div className="flex flex-col md:flex-row items-center md:items-end space-y-6 md:space-y-0 md:space-x-8">
          <div className="w-40 h-40 bg-gray-600 rounded-full overflow-hidden shadow-2xl relative group">
            <img 
              src={artist.image} 
              alt={artist.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              onError={(e) => {
                e.target.src = `https://picsum.photos/400/400?random=error${id}`
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start space-x-2 mb-2">
            </div>
            <h1 className="text-white text-5xl md:text-4xl lg:text-5xl font-black mb-4 leading-tight bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
              {artist.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-spotify-text-gray text-sm font-medium mb-4">
              <span className="flex items-center space-x-1">
                <FireIcon className="w-4 h-4 text-orange-400" />
                <span>{artist.monthlyListeners?.toLocaleString()} monthly listeners</span>
              </span>
              <span className="flex items-center space-x-1">
                <HeartIcon className="w-4 h-4 text-red-400" />
                <span>{artist.followers?.toLocaleString()} followers</span>
              </span>
            </div>
            {artist.genre && (
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-4">
                {artist.genre.map((g, index) => (
                  <span key={index} className="px-3 py-1 bg-spotify-green/20 text-spotify-green text-xs rounded-full border border-spotify-green/30">
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-6 pt-10">
          <button
            onClick={isCurrentArtistPlaying ? handlePauseArtist : handlePlayArtist}
            className="bg-spotify-green text-black rounded-full p-4 hover:scale-110 transition-all duration-300 shadow-2xl hover:shadow-spotify-green/25"
          >
            {isCurrentArtistPlaying ? (
              <PauseIcon className="w-8 h-8" />
            ) : (
              <PlayIconSolid className="w-8 h-8" />
            )}
          </button>

          <button
            onClick={handleFollowArtist}
            className={`px-6 py-3 rounded-full font-bold transition-all duration-300 transform hover:scale-105 ${
              isFollowing 
                ? 'bg-spotify-green/20 text-spotify-green border border-spotify-green hover:bg-spotify-green/30' 
                : 'bg-transparent text-white border border-white hover:bg-white hover:text-black'
            }`}
          >
            {isFollowing ? (
              <span className="flex items-center space-x-2">
                <UserMinusIcon className="w-5 h-5" />
                <span>Following</span>
              </span>
            ) : (
              <span className="flex items-center space-x-2">
                <UserPlusIcon className="w-5 h-5" />
                <span>Follow</span>
              </span>
            )}
          </button>

          <button
            onClick={handleShareArtist}
            className="p-3 rounded-full text-spotify-text-gray hover:text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-110"
          >
            <ShareIcon className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Popular Songs */}
      <div className="px-8 mb-8 pt-6">
        <div className="space-y-2">
          {displayedSongs.map((song, index) => (
            <div
              key={song.id}
              onMouseEnter={() => setHoveredSong(song.id)}
              onMouseLeave={() => setHoveredSong(null)}
              className="group flex items-center space-x-4 p-3 rounded-lg hover:bg-spotify-light-gray/50 transition-all duration-300 cursor-pointer"
              onDoubleClick={() => handlePlaySong(song, index)}
            >
              <div className="w-8 flex items-center justify-center">
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
              
              <div className="w-12 h-12 bg-gray-600 rounded-lg overflow-hidden shadow-lg">
                <img 
                  src={song.coverImage || artist.image} 
                  alt={song.title}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium truncate transition-colors ${
                  currentSong?.id === song.id ? 'text-spotify-green' : 'text-white group-hover:text-spotify-green'
                }`}>
                  {song.title}
                </p>
                <p className="text-spotify-text-gray text-sm">
                  {song.playCount?.toLocaleString()} plays
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLikeSong(song)
                  }}
                  className={`opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full ${
                    isLiked(song.id) 
                      ? 'text-spotify-green opacity-100' 
                      : 'text-spotify-text-gray hover:text-white'
                  }`}
                >
                  {isLiked(song.id) ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                </button>
                
                <span className="text-spotify-text-gray text-sm font-mono">
                  {formatDuration(song.duration)}
                </span>
              </div>
            </div>
          ))}
        </div>
        
        {artistSongs.length > 5 && (
          <button
            onClick={() => setShowAllSongs(!showAllSongs)}
            className="mt-4 text-spotify-text-gray hover:text-white font-medium transition-colors"
          >
            {showAllSongs ? 'Show less' : `Show all ${artistSongs.length} songs`}
          </button>
        )}
      </div>

      {/* Albums */}
      <div className="px-8 pb-8">
        <h2 className="text-white text-2xl font-bold mb-6">Albums</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {artistAlbums.map(album => (
            <div
              key={album.id}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/album/${album.id}`)}
            >
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-blue-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative">
                  <img 
                    src={album.coverImage}
                    alt={album.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <button className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
                      <PlayIconSolid className="w-6 h-6" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-spotify-text-gray text-sm">{album.year}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Artist Info */}
      <div className="px-8 pb-8">
        <div className="bg-spotify-light-gray/30 rounded-2xl p-6 backdrop-blur-sm">
          <h3 className="text-white font-bold text-lg mb-4">About {artist.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Monthly Listeners</p>
              <p className="text-white font-medium text-xl">{artist.monthlyListeners?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Followers</p>
              <p className="text-white font-medium text-xl">{artist.followers?.toLocaleString()}</p>
            </div>
            {artist.country && (
              <div>
                <p className="text-spotify-text-gray text-sm mb-2">Country</p>
                <p className="text-white font-medium">{artist.country}</p>
              </div>
            )}
            <div>
              <p className="text-spotify-text-gray text-sm mb-2">Genres</p>
              <p className="text-white font-medium">{artist.genre?.join(', ')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Artist
