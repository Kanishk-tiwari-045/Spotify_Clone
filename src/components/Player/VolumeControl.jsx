import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon
} from '@heroicons/react/24/outline'
import { setVolume, toggleMute } from '../../redux/features/playerSlice'
import toast from 'react-hot-toast'

const VolumeControl = () => {
  const dispatch = useDispatch()
  const { volume, isMuted } = useSelector(state => state.player)
  
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [hoverVolume, setHoverVolume] = useState(0)
  const [showVolumeTooltip, setShowVolumeTooltip] = useState(false)
  const [previousVolume, setPreviousVolume] = useState(volume)
  
  const volumeRef = useRef(null)
  const timeoutRef = useRef(null)
  const containerRef = useRef(null)

  const displayVolume = isMuted ? 0 : volume
  const volumePercentage = displayVolume * 100

  // Save previous volume when muting
  useEffect(() => {
    if (!isMuted && volume > 0) {
      setPreviousVolume(volume)
    }
  }, [volume, isMuted])

  const getVolumeIcon = () => {
    if (isMuted || displayVolume === 0) {
      return <SpeakerXMarkIcon className="w-5 h-5" />
    }
    if (displayVolume < 0.3) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.846l3.537-2.816a1 1 0 011.617.816zM6 8.586L4.414 10H3v0h1.414L6 11.414V8.586z" clipRule="evenodd" />
        </svg>
      )
    }
    if (displayVolume < 0.7) {
      return (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.846 14H2a1 1 0 01-1-1V7a1 1 0 011-1h2.846l3.537-2.816a1 1 0 011.617.816zM6 8.586L4.414 10H3v0h1.414L6 11.414V8.586z" clipRule="evenodd" />
          <path d="M11.293 7.293a1 1 0 011.414 0C13.473 8.059 14 9.006 14 10s-.527 1.941-1.293 2.707a1 1 0 11-1.414-1.414C11.763 10.823 12 10.434 12 10s-.237-.823-.707-1.293a1 1 0 010-1.414z" />
        </svg>
      )
    }
    return <SpeakerWaveIcon className="w-5 h-5" />
  }

  const handleVolumeChange = (e, isPreview = false) => {
    if (!volumeRef.current) return
    
    const rect = volumeRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newVolume = Math.max(0, Math.min(clickX / rect.width, 1))
    
    if (isPreview) {
      setHoverVolume(newVolume)
    } else {
      dispatch(setVolume(newVolume))
      
      // Auto-unmute if volume is increased
      if (isMuted && newVolume > 0) {
        dispatch(toggleMute())
      }
    }
  }

  const handleMouseDown = (e) => {
    e.preventDefault()
    setIsDragging(true)
    setShowVolumeTooltip(true)
    handleVolumeChange(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleVolumeChange(e)
    } else if (isHovering) {
      handleVolumeChange(e, true)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setShowVolumeTooltip(false)
  }

  const handleMuteToggle = () => {
    if (isMuted) {
      // Unmute and restore previous volume
      dispatch(toggleMute())
      if (previousVolume > 0) {
        dispatch(setVolume(previousVolume))
      }
      toast.success(`Volume: ${Math.round(previousVolume * 100)}%`, { icon: '🔊' })
    } else {
      // Mute
      dispatch(toggleMute())
      toast.success('Muted', { icon: '🔇' })
    }
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setShowVolumeSlider(true)
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    if (!isDragging) {
      timeoutRef.current = setTimeout(() => {
        setShowVolumeSlider(false)
      }, 500)
    }
  }

  const handleSliderMouseEnter = () => {
    setIsHovering(true)
  }

  const handleSliderMouseLeave = () => {
    setIsHovering(false)
    setHoverVolume(0)
  }

  const handleClick = (e) => {
    if (!isDragging) {
      handleVolumeChange(e)
    }
  }

  // Global mouse events for dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e)
    const handleGlobalMouseUp = () => handleMouseUp()

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
  }, [isDragging])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const currentDisplayVolume = isDragging ? volume : (isHovering ? hoverVolume : volume)

  return (
    <div 
      ref={containerRef}
      className="flex items-center space-x-3 relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Volume Tooltip */}
      {(showVolumeTooltip || (isHovering && showVolumeSlider)) && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-spotify-black text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none z-20 animate-fadeIn">
          <div className="text-center font-medium">
            {isMuted ? 'Muted' : `${Math.round((isDragging ? volume : (isHovering ? hoverVolume : volume)) * 100)}%`}
          </div>
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-2 border-r-2 border-t-4 border-transparent border-t-spotify-black"></div>
        </div>
      )}

      {/* Volume Icon Button */}
      <button
        onClick={handleMuteToggle}
        className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
          isMuted 
            ? 'text-red-400 bg-red-500/20 hover:bg-red-500/30' 
            : 'text-spotify-text-gray hover:text-white hover:bg-white/10'
        }`}
        title={isMuted ? `Unmute (${Math.round(previousVolume * 100)}%)` : 'Mute'}
      >
        {getVolumeIcon()}
      </button>

      {/* Volume Slider Container */}
      <div
        className={`transition-all duration-300 overflow-hidden ${
          showVolumeSlider || isDragging ? 'w-28 opacity-100' : 'w-0 opacity-0'
        }`}
      >
        <div
          ref={volumeRef}
          className={`relative h-2 bg-gray-600 rounded-full cursor-pointer group transition-all duration-300 ${
            isHovering || isDragging ? 'h-3 shadow-lg shadow-spotify-green/25' : ''
          }`}
          onMouseDown={handleMouseDown}
          onMouseEnter={handleSliderMouseEnter}
          onMouseLeave={handleSliderMouseLeave}
          onClick={handleClick}
        >
          {/* Background glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-full opacity-0 transition-opacity duration-300 ${
            isHovering || isDragging ? 'opacity-100' : ''
          }`}></div>

          {/* Volume Fill */}
          <div
            className={`absolute top-0 left-0 h-full bg-gradient-to-r from-spotify-green to-green-400 rounded-full transition-all duration-150 relative overflow-hidden ${
              !isMuted ? 'shadow-md shadow-spotify-green/25' : ''
            }`}
            style={{ width: `${volumePercentage}%` }}
          >
            {/* Animated shine effect */}
            {!isMuted && volume > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine"></div>
            )}

            {/* Volume Handle */}
            <div
              className={`absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg transition-all duration-300 ${
                isDragging ? 'scale-125 shadow-xl shadow-spotify-green/50' : 
                isHovering || volumePercentage === 0 ? 'opacity-100 scale-110' : 
                'opacity-0 group-hover:opacity-100 group-hover:scale-110'
              }`}
              style={{ right: '-6px' }}
            >
              {/* Handle glow */}
              <div className={`absolute inset-0 bg-spotify-green rounded-full opacity-30 animate-pulse ${
                isDragging ? 'scale-150' : ''
              }`}></div>
            </div>
          </div>

          {/* Hover preview line */}
          {isHovering && !isDragging && hoverVolume > 0 && (
            <div 
              className="absolute top-0 w-0.5 h-full bg-white/50 rounded-full pointer-events-none"
              style={{ left: `${hoverVolume * 100}%` }}
            ></div>
          )}

          {/* Volume level indicators */}
          <div className="absolute inset-0 flex items-center justify-between px-1 pointer-events-none">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-0.5 h-1 rounded-full transition-all duration-300 ${
                  (i + 1) * 0.2 <= displayVolume ? 'bg-white/60' : 'bg-gray-500/30'
                }`}
              ></div>
            ))}
          </div>
        </div>
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

export default VolumeControl
