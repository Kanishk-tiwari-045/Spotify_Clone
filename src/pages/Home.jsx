import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { 
  PlayIcon, 
  PauseIcon,
  HeartIcon,
  ClockIcon,
  FireIcon,
  SparklesIcon,
  MusicalNoteIcon,
  ArrowRightIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { PlayIcon as PlayIconSolid, HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { 
  setQueue, 
  setCurrentSong, 
  setIsPlaying 
} from '../redux/features/playerSlice'
import { 
  addToRecentlyPlayed,
  addToLikedSongs,
  removeFromLikedSongs,
  selectUser,
  selectLikedSongs,
  selectRecentlyPlayed
} from '../redux/features/authSlice'
import { 
  selectFeaturedContent,
  selectMusicDataLoading,
  selectMusicDataError,
  selectIsDataStale,
  fetchFeaturedContent,
  fetchDeezerTopCharts
} from '../redux/features/musicDataSlice'
import toast from 'react-hot-toast'

const Home = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const featuredContent = useSelector(selectFeaturedContent)
  const isLoading = useSelector(selectMusicDataLoading)
  const error = useSelector(selectMusicDataError)
  const isDataStale = useSelector(selectIsDataStale)
  const likedSongs = useSelector(selectLikedSongs)
  const recentlyPlayed = useSelector(selectRecentlyPlayed)
  const { currentSong, isPlaying } = useSelector(state => state.player)

  const [isVisible, setIsVisible] = useState(false)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [retryCount, setRetryCount] = useState(0)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  // Enhanced data fetching with Deezer integration
  useEffect(() => {
    const shouldFetchData = !featuredContent.topTracks.length || isDataStale
    
    if (shouldFetchData) {
      console.log('Fetching fresh music data from Deezer and other APIs...')
      dispatch(fetchFeaturedContent(true)) // Force refresh for fresh data
      dispatch(fetchDeezerTopCharts()) // Get Deezer charts
    }
  }, [dispatch, featuredContent.topTracks.length, isDataStale])

  // Enhanced song play handler with better audio URL handling
  const handlePlaySong = (song) => {
    const formattedSong = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artist,
      duration: song.duration || 180,
      coverImage: song.images?.medium || song.images?.large || song.image || `https://picsum.photos/300/300?random=${song.id}`,
      audioUrl: song.preview || song.audioUrl || song.audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      isPreview: !!song.preview // Mark if it's a 30-second preview
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

  // Enhanced playlist handler
  const handlePlayPlaylist = (playlist) => {
    if (playlist.tracks && playlist.tracks.length > 0) {
      const formattedTracks = playlist.tracks.map(track => ({
        id: track.id,
        title: track.name || track.title,
        artist: track.artist,
        duration: track.duration || 180,
        coverImage: track.images?.medium || track.image || playlist.coverImage || `https://picsum.photos/300/300?random=${track.id}`,
        audioUrl: track.preview || track.audioUrl || track.audio || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isPreview: !!track.preview
      }))

      dispatch(setQueue(formattedTracks))
      dispatch(setCurrentSong(formattedTracks[0]))
      dispatch(setIsPlaying(true))
      toast.success(`Playing "${playlist.name}"`, { icon: '🎶' })
    }
  }

  // Enhanced like handler
  const handleLikeSong = (song) => {
    const formattedSong = {
      id: song.id,
      title: song.name || song.title,
      artist: song.artist,
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

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Retry handler for failed API calls
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    dispatch(fetchFeaturedContent(true))
    toast.promise(
      dispatch(fetchDeezerTopCharts()),
      {
        loading: 'Retrying...',
        success: 'Music data loaded!',
        error: 'Still having trouble. Please check your connection.'
      }
    )
  }

  // Enhanced loading state
  if (isLoading && !featuredContent.topTracks.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-spotify-green border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-spotify-text-gray text-lg">Loading real music from Deezer...</p>
            <p className="text-spotify-text-gray text-sm mt-2">Discovering amazing tracks just for you</p>
            {retryCount > 0 && (
              <p className="text-yellow-400 text-xs mt-2">Retry attempt {retryCount}</p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Enhanced error state
  if (error && !featuredContent.topTracks.length) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center max-w-md">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-xl font-bold mb-2">Unable to load music</h3>
            <p className="text-spotify-text-gray mb-4">
              {error.message || 'Failed to connect to music services. Please check your internet connection.'}
            </p>
            <button
              onClick={handleRetry}
              className="bg-spotify-green text-black font-bold px-6 py-3 rounded-xl hover:bg-green-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="p-6 space-y-12">
        {/* Enhanced Hero Section with Deezer branding */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-gray-900 via-blue-800 to-spotify-green p-8 shadow-2xl">
          {/* Animated background elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-float"></div>
            <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-white rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-4xl font-black text-white mb-4 leading-tight">
                {getGreeting()}, <br />
                <span className="bg-gradient-to-r from-yellow-300 to-white bg-clip-text text-transparent">
                  {user?.name}!
                </span>
              </h1>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  className="bg-white text-black font-bold px-8 py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-white/25 flex items-center justify-center space-x-2"
                  onClick={() => navigate('/search')}
                >
                  <SparklesIcon className="w-6 h-6" />
                  <span>Discover Music</span>
                </button>
                <button
                  className="bg-transparent border-2 border-white text-white font-bold px-8 py-4 rounded-full hover:bg-white hover:text-black transition-all duration-300 flex items-center justify-center space-x-2"
                  onClick={() => navigate('/library')}
                >
                  <MusicalNoteIcon className="w-6 h-6" />
                  <span>Your Library</span>
                </button>
              </div>
            </div>
            
            <div className="hidden md:block ml-8">
              <div className="w-50 h-50 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center animate-spin-slow border-4 border-white/20">
                <div className="w-36 h-36 bg-white/20 rounded-full flex items-center justify-center">
                  <MusicalNoteIcon className="w-24 h-24 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Cards */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center space-x-3">
            <FireIcon className="w-8 h-8 text-spotify-green" />
            <span>Jump back in</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl p-6 cursor-pointer hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-300 transform hover:scale-105 border border-purple-500/30"
              onClick={() => navigate('/liked-songs')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                  <HeartIconSolid className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Liked Songs</h3>
                  <p className="text-spotify-text-gray">{likedSongs.length} songs</p>
                </div>
              </div>
            </div>

            {recentlyPlayed.length > 0 && (
              <div
                className="bg-gradient-to-r from-green-600/20 to-blue-600/20 rounded-2xl p-6 cursor-pointer hover:from-green-600/30 hover:to-blue-600/30 transition-all duration-300 transform hover:scale-105 border border-green-500/30"
                onClick={() => navigate('/recently-played')}
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <ClockIcon className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Recently Played</h3>
                    <p className="text-spotify-text-gray">{recentlyPlayed.length} tracks</p>
                  </div>
                </div>
              </div>
            )}

            <div
              className="bg-gradient-to-r from-orange-600/20 to-red-600/20 rounded-2xl p-6 cursor-pointer hover:from-orange-600/30 hover:to-red-600/30 transition-all duration-300 transform hover:scale-105 border border-orange-500/30"
              onClick={() => navigate('/search')}
            >
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center">
                  <SparklesIcon className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">Discover</h3>
                  <p className="text-spotify-text-gray">Find new music</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Enhanced Top Tracks with Deezer data */}
        {featuredContent.topTracks.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <StarIcon className="w-8 h-8 text-spotify-green" />
                <span>Trending Now</span>
              </h2>
              <button
                onClick={() => navigate('/search')}
                className="text-spotify-green hover:text-green-400 font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Show all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredContent.topTracks.slice(0, 6).map((track, index) => (
                <div
                  key={track.id}
                  onMouseEnter={() => setHoveredCard(`trending-${track.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handlePlaySong(track)}
                >
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-blue-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative group">
                      <img
                        src={track.images?.medium || track.images?.large || track.image || `https://picsum.photos/300/300?random=${track.id}`}
                        alt={track.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/300/300?random=${track.id}`
                        }}
                      />

                      {/* Centered Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlaySong(track)
                          }}
                          className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                        >
                          <PlayIconSolid className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                        
                    <div className="relative z-10">
                      <h3 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors mb-1">
                        {track.name}
                      </h3>
                      <p className="text-spotify-text-gray text-sm truncate mb-2">{track.artist}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {track.rank && (
                            <span className="top-2 left-2 bg-spotify-green text-black text-xs font-bold px-2 py-1 rounded-full z-10">
                              #{track.rank}
                            </span>
                          )}
                          {track.preview && (
                            <span className="text-blue-400 text-xs">
                              Preview
                            </span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLikeSong(track)
                          }}
                          className={`transition-all duration-300 p-1 rounded-full ${
                            isLiked(track.id) 
                              ? 'text-spotify-green' 
                              : 'text-spotify-text-gray hover:text-white'
                          }`}
                        >
                          {isLiked(track.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Rest of your sections remain the same but with enhanced data handling */}
        {featuredContent.newReleases.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <SparklesIcon className="w-8 h-8 text-spotify-green" />
                <span>Fresh Releases</span>
              </h2>
              <button
                onClick={() => navigate('/search')}
                className="text-spotify-green hover:text-green-400 font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Show all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {featuredContent.newReleases.slice(0, 6).map(track => (
                <div
                  key={track.id}
                  onMouseEnter={() => setHoveredCard(`new-${track.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handlePlaySong(track)}
                >
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-purple-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative group">
                      <img
                        src={track.images?.medium || track.image || `https://picsum.photos/300/300?random=new${track.id}`}
                        alt={track.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src = `https://picsum.photos/300/300?random=new${track.id}`
                        }}
                      />
                      
                      {/* Centered Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlaySong(track)
                          }}
                          className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                        >
                          <PlayIconSolid className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                        
                    <div className="relative z-10">
                      <h3 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors mb-1">
                        {track.name}
                      </h3>
                      <p className="text-spotify-text-gray text-sm truncate mb-2">{track.artist}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-spotify-green text-xs font-medium">New Release</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLikeSong(track)
                          }}
                          className={`transition-all duration-300 p-1 rounded-full ${
                            isLiked(track.id) 
                              ? 'text-spotify-green' 
                              : 'text-spotify-text-gray hover:text-white'
                          }`}
                        >
                          {isLiked(track.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Featured Playlists */}
        {featuredContent.featuredPlaylists.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <MusicalNoteIcon className="w-8 h-8 text-spotify-green" />
                <span>Made For You</span>
              </h2>
              <button
                onClick={() => navigate('/library')}
                className="text-spotify-green hover:text-green-400 font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Show all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredContent.featuredPlaylists.slice(0, 4).map(playlist => (
                <div
                  key={playlist.id}
                  onMouseEnter={() => setHoveredCard(`playlist-${playlist.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handlePlayPlaylist(playlist)}
                >
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-6 hover:from-spotify-green/20 hover:to-orange-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-48 bg-gray-600 rounded-xl mb-4 overflow-hidden relative group">
                      <img
                        src={playlist.coverImage}
                        alt={playlist.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Centered Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlayPlaylist(playlist)
                          }}
                          className="bg-spotify-green text-black rounded-full p-4 shadow-lg hover:scale-110 transition-transform"
                        >
                          <PlayIconSolid className="w-7 h-7" />
                        </button>
                      </div>
                    </div>
                        
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-xl mb-2 group-hover:text-spotify-green transition-colors">
                        {playlist.name}
                      </h3>
                      <p className="text-spotify-text-gray text-sm mb-3 line-clamp-2">
                        {playlist.description}
                      </p>
                      <p className="text-spotify-text-gray text-xs">
                        {playlist.tracks?.length || 0} tracks
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Recently Played */}
        {recentlyPlayed.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-white flex items-center space-x-3">
                <ClockIcon className="w-8 h-8 text-spotify-green" />
                <span>Recently Played</span>
              </h2>
              <button
                onClick={() => navigate('/recently-played')}
                className="text-spotify-green hover:text-green-400 font-medium flex items-center space-x-2 transition-colors"
              >
                <span>Show all</span>
                <ArrowRightIcon className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {recentlyPlayed.slice(0, 6).map(track => (
                <div
                  key={`recent-${track.id}`}
                  onMouseEnter={() => setHoveredCard(`recent-${track.id}`)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                  onClick={() => handlePlaySong(track)}
                >
                  <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-green-500/20 transition-all duration-300 relative overflow-hidden">
                    <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative group">
                      <img
                        src={track.coverImage || `https://picsum.photos/300/300?random=recent${track.id}`}
                        alt={track.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      
                      {/* Centered Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation()
                            handlePlaySong(track)
                          }}
                          className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform"
                        >
                          <PlayIconSolid className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                        
                    <div className="relative z-10">
                      <h3 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors mb-1">
                        {track.title}
                      </h3>
                      <p className="text-spotify-text-gray text-sm truncate mb-2">{track.artist}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-spotify-text-gray text-xs">
                          Recently played
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleLikeSong(track)
                          }}
                          className={`transition-all duration-300 p-1 rounded-full ${
                            isLiked(track.id) 
                              ? 'text-spotify-green' 
                              : 'text-spotify-text-gray hover:text-white'
                          }`}
                        >
                          {isLiked(track.id) ? <HeartIconSolid className="w-4 h-4" /> : <HeartIcon className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Custom animations */}
        <style>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }

          .animate-float {
            animation: float 6s ease-in-out infinite;
          }

          .animate-spin-slow {
            animation: spin 20s linear infinite;
          }

          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    </div>
  )
}

export default Home
