import React, { useRef, useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { setCurrentTime } from '../../redux/features/playerSlice'

const ProgressBar = () => {
  const dispatch = useDispatch()
  const { currentSong, currentTime, duration, isPlaying } = useSelector(state => state.player)
  const progressRef = useRef(null)
  const audioRef = useRef(null)
  
  const [isDragging, setIsDragging] = useState(false)
  const [dragTime, setDragTime] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverTime, setHoverTime] = useState(0)
  const [showPreview, setShowPreview] = useState(false)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0
  const displayProgress = isDragging ? (dragTime / duration) * 100 : progress

  // Audio reference for seeking
  useEffect(() => {
    audioRef.current = document.querySelector('audio')
  }, [])

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setShowPreview(true)
    handleProgressChange(e, true)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleProgressChange(e, true)
    } else if (isHovering) {
      handleHoverPreview(e)
    }
  }

  const handleMouseUp = (e) => {
    if (!isDragging) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(0, Math.min((clickX / rect.width) * duration, duration))
    
    // Update Redux state
    dispatch(setCurrentTime(newTime))
    
    // Update audio element
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
    
    setIsDragging(false)
    setDragTime(0)
    setShowPreview(false)
  }

  const handleProgressChange = (e, isDrag = false) => {
    if (!progressRef.current || !duration) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newTime = Math.max(0, Math.min((clickX / rect.width) * duration, duration))
    
    if (isDrag) {
      setDragTime(newTime)
    } else {
      dispatch(setCurrentTime(newTime))
      if (audioRef.current) {
        audioRef.current.currentTime = newTime
      }
    }
  }

  const handleHoverPreview = (e) => {
    if (!progressRef.current || !duration || isDragging) return
    
    const rect = progressRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const time = Math.max(0, Math.min((hoverX / rect.width) * duration, duration))
    setHoverTime(time)
  }

  const handleClick = (e) => {
    if (!isDragging) {
      handleProgressChange(e)
    }
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setShowPreview(false)
  }

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e)
    const handleGlobalMouseUp = (e) => handleMouseUp(e)

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove)
      document.addEventListener('mouseup', handleGlobalMouseUp)
      document.body.style.cursor = 'grabbing'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseup', handleGlobalMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isDragging, duration])

  return (
    <div className="relative w-full">
      {/* Time Preview Tooltip */}
      {(showPreview || (isHovering && !isDragging)) && (
        <div 
          className="absolute -top-10 bg-spotify-black text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none z-10 transform -translate-x-1/2 animate-fadeIn"
          style={{ 
            left: `${isDragging ? displayProgress : (hoverTime / duration) * 100}%` 
          }}
        >
          <div className="text-center">
            {formatTime(isDragging ? dragTime : hoverTime)}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-spotify-black"></div>
        </div>
      )}

      {/* Progress Bar Container */}
      <div
        ref={progressRef}
        className={`relative w-full h-2 bg-gray-600 rounded-full cursor-pointer group transition-all duration-300 ${
          isHovering || isDragging ? 'h-3 shadow-lg' : ''
        }`}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Background glow effect */}
        <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-full opacity-0 transition-opacity duration-300 ${
          isHovering || isDragging ? 'opacity-100' : ''
        }`}></div>

        {/* Buffered/Loaded indicator (simulated) */}
        <div 
          className="absolute top-0 left-0 h-full bg-gray-500 rounded-full transition-all duration-300"
          style={{ width: `${Math.min(progress + 10, 100)}%` }}
        ></div>

        {/* Progress Fill */}
        <div
          className={`absolute top-0 left-0 h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-150 relative overflow-hidden ${
            isPlaying ? 'shadow-lg shadow-spotify-green/25' : ''
          }`}
          style={{ width: `${displayProgress}%` }}
        >
          {/* Animated shine effect */}
          {isPlaying && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
          )}

          {/* Progress Handle */}
          <div
            className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg transition-all duration-300 ${
              isDragging ? 'scale-125 shadow-xl shadow-spotify-green/50' : 
              isHovering || displayProgress === 0 ? 'opacity-100 scale-110' : 
              'opacity-0 group-hover:opacity-100 group-hover:scale-110'
            }`}
            style={{ right: '-8px' }}
          >
            {/* Handle glow */}
            <div className={`absolute inset-0 bg-spotify-green rounded-full opacity-30 animate-pulse ${
              isDragging ? 'scale-150' : ''
            }`}></div>
          </div>
        </div>

        {/* Hover preview line */}
        {isHovering && !isDragging && (
          <div 
            className="absolute top-0 w-0.5 h-full bg-white/50 rounded-full pointer-events-none"
            style={{ left: `${(hoverTime / duration) * 100}%` }}
          ></div>
        )}

        {/* Waveform visualization (decorative) */}
        {currentSong && isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="w-0.5 bg-white mx-0.5 rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.sin(Date.now() * 0.01 + i) * 10}%`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${1 + Math.random()}s`
                }}
              ></div>
            ))}
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-5px) translateX(-50%) scale(0.9); }
          to { opacity: 1; transform: translateY(0) translateX(-50%) scale(1); }
        }
        
        @keyframes shine {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}

export default ProgressBar
