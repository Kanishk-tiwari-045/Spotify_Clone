import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  QueueListIcon,
  HeartIcon,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import {
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  toggleShuffle,
  setRepeatMode,
  nextSong,
  previousSong
} from '../../redux/features/playerSlice'
import { 
  addToLikedSongs, 
  removeFromLikedSongs,
  addToRecentlyPlayed,
  selectLikedSongs,
  selectIsSongLiked
} from '../../redux/features/authSlice'
import PlayerQueue from './PlayerQueue'
import toast from 'react-hot-toast'

const Player = () => {
  const dispatch = useDispatch()
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffled,
    repeatMode,
    queue,
    currentIndex
  } = useSelector(state => state.player)
  
  const likedSongs = useSelector(selectLikedSongs)
  const isLiked = useSelector(state => 
    currentSong ? selectIsSongLiked(state, currentSong.id) : false
  )

  const audioRef = useRef(null)
  const progressRef = useRef(null)
  const volumeRef = useRef(null)
  
  const [showQueue, setShowQueue] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isDraggingProgress, setIsDraggingProgress] = useState(false)
  const [isDraggingVolume, setIsDraggingVolume] = useState(false)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)

  // CORS-friendly audio URLs for fallback
  const fallbackAudioUrls = [
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3'
  ]

  // Get working audio URL with fallback
  const getWorkingAudioUrl = (song) => {
    if (!song) return null
    
    if (song.audioUrl && !song.audioUrl.includes('undefined')) {
      return song.audioUrl
    }
    
    const fallbackIndex = Math.abs(song.id?.toString().charCodeAt(0) || 0) % fallbackAudioUrls.length
    return fallbackAudioUrls[fallbackIndex]
  }

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      dispatch(setDuration(audio.duration || 180))
      setAudioError(false)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      if (!isDraggingProgress) {
        dispatch(setCurrentTime(audio.currentTime))
      }
    }

    const handleEnded = () => {
      if (repeatMode === 'one') {
        audio.currentTime = 0
        audio.play().catch(console.error)
      } else {
        dispatch(nextSong())
      }
    }

    const handleCanPlay = () => {
      setIsLoading(false)
      if (isPlaying && !audioError) {
        audio.play().catch((error) => {
          console.error('Auto-play failed:', error)
          setAudioError(true)
          dispatch(setIsPlaying(false))
        })
      }
    }

    const handleError = (e) => {
      console.error('Audio playback error:', e)
      setAudioError(true)
      setIsLoading(false)
      
      if (currentSong && audio.src !== getWorkingAudioUrl(currentSong)) {
        const fallbackUrl = getWorkingAudioUrl(currentSong)
        if (fallbackUrl && audio.src !== fallbackUrl) {
          console.log('Trying fallback audio URL:', fallbackUrl)
          audio.src = fallbackUrl
          audio.load()
        }
      }
    }

    const handleLoadStart = () => {
      setIsLoading(true)
      setAudioError(false)
    }

    const handlePlaying = () => {
      setIsLoading(false)
      setAudioError(false)
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('canplay', handleCanPlay)
    audio.addEventListener('error', handleError)
    audio.addEventListener('loadstart', handleLoadStart)
    audio.addEventListener('playing', handlePlaying)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('canplay', handleCanPlay)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('loadstart', handleLoadStart)
      audio.removeEventListener('playing', handlePlaying)
    }
  }, [dispatch, isPlaying, repeatMode, currentSong, audioError, isDraggingProgress])

  // Handle play/pause
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentSong) return

    if (isPlaying && !audioError && !isLoading) {
      const playPromise = audio.play()
      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('Play failed:', error)
          if (error.name !== 'AbortError') {
            setAudioError(true)
            dispatch(setIsPlaying(false))
          }
        })
      }
    } else if (!isPlaying) {
      audio.pause()
    }
  }, [isPlaying, currentSong, audioError, isLoading, dispatch])

  // Handle volume changes
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = isMuted ? 0 : Math.max(0, Math.min(1, volume))
    }
  }, [volume, isMuted])

  // Handle song changes
  useEffect(() => {
    if (currentSong && audioRef.current) {
      const audioUrl = getWorkingAudioUrl(currentSong)
      if (audioUrl) {
        audioRef.current.src = audioUrl
        audioRef.current.load()
        dispatch(addToRecentlyPlayed({
          ...currentSong,
          playedAt: new Date().toISOString()
        }))
        setAudioError(false)
        setIsLoading(true)
      }
    }
  }, [currentSong, dispatch])

  // Progress bar functionality
  const handleProgressClick = (e) => {
    if (!progressRef.current || !duration) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = (clickX / rect.width) * duration
    
    dispatch(setCurrentTime(newTime))
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const handleProgressMouseDown = (e) => {
    setIsDraggingProgress(true)
    handleProgressClick(e)
  }

  const handleProgressMouseMove = (e) => {
    if (!isDraggingProgress || !progressRef.current || !duration) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(0, Math.min((clickX / rect.width) * duration, duration))
    
    dispatch(setCurrentTime(newTime))
  }

  const handleProgressMouseUp = () => {
    if (isDraggingProgress && audioRef.current) {
      audioRef.current.currentTime = currentTime
    }
    setIsDraggingProgress(false)
  }

  // Volume control functionality
  const handleVolumeClick = (e) => {
    if (!volumeRef.current) return
    
    const rect = volumeRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(clickX / rect.width, 1))
    
    dispatch(setVolume(newVolume))
  }

  const handleVolumeMouseDown = (e) => {
    setIsDraggingVolume(true)
    handleVolumeClick(e)
  }

  const handleVolumeMouseMove = (e) => {
    if (!isDraggingVolume || !volumeRef.current) return
    
    const rect = volumeRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(clickX / rect.width, 1))
    
    dispatch(setVolume(newVolume))
  }

  const handleVolumeMouseUp = () => {
    setIsDraggingVolume(false)
  }

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      handleProgressMouseMove(e)
      handleVolumeMouseMove(e)
    }

    const handleGlobalMouseUp = () => {
      handleProgressMouseUp()
      handleVolumeMouseUp()
    }

    if (isDraggingProgress || isDraggingVolume) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [isDraggingProgress, isDraggingVolume, currentTime, duration])

  // Player controls
  const togglePlayPause = () => {
    if (audioError) {
      if (audioRef.current && currentSong) {
        const audioUrl = getWorkingAudioUrl(currentSong)
        if (audioUrl) {
          audioRef.current.src = audioUrl
          audioRef.current.load()
          setAudioError(false)
          setIsLoading(true)
        }
      }
    } else {
      dispatch(setIsPlaying(!isPlaying))
    }
  }

  const handlePrevious = () => {
    dispatch(previousSong())
    toast.success('Previous track')
  }

  const handleNext = () => {
    dispatch(nextSong())
    toast.success('Next track')
  }

  const handleShuffle = () => {
    dispatch(toggleShuffle())
    toast.success(isShuffled ? 'Shuffle off' : 'Shuffle on', {
      icon: '🔀'
    })
  }

  const handleRepeat = () => {
    dispatch(setRepeatMode())
    const modes = { 
      off: { text: 'Repeat off', icon: '🔁' }, 
      all: { text: 'Repeat all', icon: '🔁' }, 
      one: { text: 'Repeat one', icon: '🔂' } 
    }
    const nextMode = repeatMode === 'off' ? 'all' : repeatMode === 'all' ? 'one' : 'off'
    toast.success(modes[nextMode]?.text || 'Repeat changed', {
      icon: modes[nextMode]?.icon
    })
  }

  const handleMute = () => {
    dispatch(toggleMute())
    toast.success(isMuted ? 'Unmuted' : 'Muted', {
      icon: isMuted ? '🔊' : '🔇'
    })
  }

  const handleLike = () => {
    if (!currentSong) return

    if (isLiked) {
      dispatch(removeFromLikedSongs(currentSong.id))
      toast.success('Removed from liked songs', { icon: '💔' })
    } else {
      dispatch(addToLikedSongs({
        ...currentSong,
        addedAt: new Date().toISOString()
      }))
      toast.success('Added to liked songs', { icon: '💚' })
    }
  }

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getRepeatIcon = () => {
    if (repeatMode === 'one') {
      return (
        <div className="relative">
          <ArrowPathIcon className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 text-xs font-bold bg-spotify-green text-black rounded-full w-3 h-3 flex items-center justify-center">1</span>
        </div>
      )
    }
    return <ArrowPathIcon className="w-5 h-5" />
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
  const volumePercentage = (isMuted ? 0 : volume) * 100

  if (!currentSong) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-r from-spotify-black via-gray-900 to-spotify-black backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 bg-gradient-to-br from-spotify-green/20 to-green-400/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-spotify-green text-3xl">♪</span>
          </div>
          <div>
            <p className="text-spotify-text-gray text-lg">Select a song to start playing</p>
            <p className="text-spotify-text-gray/60 text-sm mt-1">Your music journey begins here</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="h-full bg-gradient-to-r from-spotify-black via-gray-900 to-spotify-black backdrop-blur-xl border-t border-spotify-white/20 flex items-center px-6 shadow-2xl relative overflow-hidden">
        {/* Animated background */}
        <div className="inset-0 bg-gradient-to-r from-spotify-black via-gray-900 to-spotify-black animate-pulse-slow"></div>
        
        {/* Audio Element */}
        <audio ref={audioRef} preload="metadata" />

        {/* Left Section - Song Info */}
        <div className="flex items-center space-x-4 w-1/3 min-w-0 relative z-10">
          <div className="w-14 h-14 bg-gray-600 rounded-xl overflow-hidden flex-shrink-0 relative shadow-2xl group">
            {currentSong.coverImage ? (
              <img 
                src={currentSong.coverImage} 
                alt={currentSong.title || currentSong.name}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                onError={(e) => {
                  e.target.style.display = 'none'
                  e.target.parentElement.style.backgroundColor = '#1DB954'
                }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-spotify-green to-green-400 flex items-center justify-center">
                <span className="text-black text-xl font-bold">♪</span>
              </div>
            )}
            {audioError && (
              <div className="absolute inset-0 bg-red-500/90 flex items-center justify-center backdrop-blur-sm">
                <span className="text-white text-sm font-bold animate-pulse">!</span>
              </div>
            )}
            {isLoading && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {isPlaying && !isLoading && !audioError && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <div className="min-w-0 flex-1">
            <h4 className="text-white font-semibold truncate text-lg hover:text-spotify-green transition-colors cursor-pointer">
              {currentSong.title || currentSong.name}
            </h4>
            <p className="text-spotify-text-gray text-sm truncate hover:text-white transition-colors cursor-pointer">
              {currentSong.artist}
            </p>
          </div>
        </div>

        {/* Center Section - Player Controls */}
        <div className="flex-1 flex flex-col items-center space-y-2 max-w-2xl relative z-10">
          {/* Control Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={handleShuffle}
              className={`p-2 rounded-full transition-all duration-300 transform ${
                isShuffled 
                  ? 'text-spotify-green bg-spotify-green/20 shadow-lg' 
                  : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
              }`}
              title="Shuffle"
            >
              <ArrowsRightLeftIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handlePrevious}
              className="p-2 rounded-full text-spotify-text-gray hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:drop-shadow-lg"
              title="Previous"
            >
              <BackwardIcon className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="bg-transparent text-spotify-text-gray rounded-full p-3 hover:text-white transition-all duration-300 shadow-2xl relative hover:bg-white/10 overflow-hidden group"
              title={audioError ? "Retry" : isLoading ? "Loading..." : (isPlaying ? "Pause" : "Play")}
              disabled={isLoading}
            >
              <div className="absolute inset-0 bg-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              {isLoading ? (
                <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              ) : audioError ? (
                <span className="w-7 h-7 flex items-center justify-center text-red-500 font-bold animate-pulse">!</span>
              ) : isPlaying ? (
                <PauseIcon className="w-7 h-7 relative z-10" />
              ) : (
                <PlayIcon className="w-7 h-7 ml-0.5 relative z-10" />
              )}
            </button>

            <button
              onClick={handleNext}
              className="p-2 rounded-full text-spotify-text-gray hover:bg-white/10 hover:text-white transition-all duration-300 transform hover:drop-shadow-lg"
              title="Next"
            >
              <ForwardIcon className="w-5 h-5" />
            </button>

            <button
              onClick={handleRepeat}
              className={`p-2 rounded-full transition-all duration-300 transform ${
                repeatMode !== 'off' 
                  ? 'text-spotify-green bg-spotify-green/20 shadow-lg' 
                  : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {getRepeatIcon()}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full flex items-center space-x-4">
            <span className="text-xs text-spotify-text-gray w-10 text-right font-mono">
              {formatTime(currentTime)}
            </span>
            
            <div 
              ref={progressRef}
              className="flex-1 h-1.5 bg-gray-600 rounded-full cursor-pointer group relative overflow-hidden"
              onClick={handleProgressClick}
              onMouseDown={handleProgressMouseDown}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div 
                className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-100 relative"
                style={{ width: `${progressPercentage}%` }}
              >
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ right: '-8px' }}></div>
              </div>
            </div>
            
            <span className="text-xs text-spotify-text-gray w-12 font-mono">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Right Section - Volume & Queue */}
        <div className="flex items-center space-x-4 w-1/3 justify-end relative z-10">
          <button
            onClick={handleLike}
            className={`p-2 rounded-full transition-all duration-300 transform ${
              isLiked 
                ? 'text-spotify-green bg-spotify-green/20 shadow-lg' 
                : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
            }`}
            title={isLiked ? 'Remove from liked songs' : 'Add to liked songs'}
          >
            {isLiked ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-6 h-6" />}
          </button>
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-2 rounded-full transition-all duration-300 ${
              showQueue 
                ? 'text-spotify-green bg-spotify-green/20 shadow-lg shadow-spotify-green/25' 
                : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
            }`}
            title="Queue"
          >
            <QueueListIcon className="w-5 h-5" />
          </button>

          {/* Volume Control */}
          <div 
            className="flex items-center space-x-3 group"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={handleMute}
              className="text-spotify-text-gray hover:text-white transition-all duration-300 p-2 rounded-full hover:bg-white/10"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted || volume === 0 ? (
                <SpeakerXMarkIcon className="w-5 h-5" />
              ) : (
                <SpeakerWaveIcon className="w-5 h-5" />
              )}
            </button>

            <div 
              className={`transition-all duration-300 overflow-hidden ${
                showVolumeSlider ? 'w-24 opacity-100' : 'w-0 opacity-0'
              }`}
            >
              <div 
                ref={volumeRef}
                className="h-2 bg-gray-600 rounded-full cursor-pointer group relative"
                onClick={handleVolumeClick}
                onMouseDown={handleVolumeMouseDown}
              >
                <div 
                  className="h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-100 relative"
                  style={{ width: `${volumePercentage}%` }}
                >
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" style={{ right: '-6px' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Queue Panel with enhanced animation */}
      {showQueue && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="absolute right-0 top-0 h-full w-80 pointer-events-auto">
            <PlayerQueue onClose={() => setShowQueue(false)} />
          </div>
        </div>
      )}
    </>
  )
}

export default Player
