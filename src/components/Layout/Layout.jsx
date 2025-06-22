import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import Header from './Header'
import { 
  fetchFeaturedContent, 
  selectMusicDataLoading, 
  selectMusicDataError 
} from '../../redux/features/musicDataSlice'

const Layout = ({ children }) => {
  const dispatch = useDispatch()
  const location = useLocation()
  const isLoading = useSelector(selectMusicDataLoading)
  const error = useSelector(selectMusicDataError)
  
  const [scrollY, setScrollY] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [previousPath, setPreviousPath] = useState('')

  // Handle scroll for parallax effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Handle route transitions
  useEffect(() => {
    if (previousPath && previousPath !== location.pathname) {
      setIsTransitioning(true)
      const timer = setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
      return () => clearTimeout(timer)
    }
    setPreviousPath(location.pathname)
  }, [location.pathname, previousPath])

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/') return 'Home'
    if (path === '/search') return 'Search'
    if (path === '/library') return 'Your Library'
    if (path === '/liked-songs') return 'Liked Songs'
    if (path === '/recently-played') return 'Recently Played'
    if (path.startsWith('/playlist/')) return 'Playlist'
    if (path.startsWith('/album/')) return 'Album'
    if (path.startsWith('/artist/')) return 'Artist'
    if (path.startsWith('/genre/')) return 'Genre'
    return 'Spotify Clone'
  }

  // Get enhanced background gradient based on current route
  const getBackgroundGradient = () => {
    const path = location.pathname
    const gradients = {
      '/': 'from-purple-900/90 via-blue-900/80 to-spotify-black',
      '/search': 'from-gray-900/90 via-gray-800/80 to-spotify-black',
      '/library': 'from-green-900/90 via-green-800/80 to-spotify-black',
      '/liked-songs': 'from-purple-600/90 via-pink-600/80 to-spotify-black',
      '/recently-played': 'from-blue-600/90 via-indigo-600/80 to-spotify-black'
    }

    // Dynamic gradients for specific routes
    if (path.startsWith('/playlist/')) return 'from-indigo-900/90 via-purple-900/80 to-spotify-black'
    if (path.startsWith('/album/')) return 'from-orange-900/90 via-red-900/80 to-spotify-black'
    if (path.startsWith('/artist/')) return 'from-blue-900/90 via-indigo-900/80 to-spotify-black'
    if (path.startsWith('/genre/')) return 'from-pink-900/90 via-purple-900/80 to-spotify-black'
    
    return gradients[path] || 'from-spotify-gray/90 to-spotify-black'
  }

  // Get page-specific decorative elements
  const getPageDecorations = () => {
    const path = location.pathname
    
    if (path === '/') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-spotify-green/5 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-40 left-20 w-48 h-48 bg-blue-500/5 rounded-full blur-2xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>
      )
    }
    
    if (path === '/search') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-32 left-1/4 w-32 h-32 bg-yellow-500/5 rounded-full blur-xl animate-bounce" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-32 right-1/4 w-24 h-24 bg-green-500/5 rounded-full blur-lg animate-bounce" style={{ animationDuration: '3s', animationDelay: '1s' }}></div>
        </div>
      )
    }
    
    if (path === '/library') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 right-1/3 w-40 h-40 bg-spotify-green/8 rounded-full blur-2xl animate-pulse"></div>
        </div>
      )
    }
    
    return null
  }

  // Get page-specific floating elements
  const getFloatingElements = () => {
    const path = location.pathname
    
    if (path === '/') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute text-spotify-green/10 animate-float"
              style={{
                left: `${20 + i * 15}%`,
                top: `${30 + (i % 2) * 40}%`,
                fontSize: `${1 + (i % 3) * 0.5}rem`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${4 + i}s`
              }}
            >
              ♪
            </div>
          ))}
        </div>
      )
    }
    
    return null
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <Header title={getPageTitle()} />
      
      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Dynamic Background with Parallax */}
        <div 
          className={`absolute inset-0 bg-gradient-to-b ${getBackgroundGradient()} transition-all duration-700`}
          style={{
            transform: `translateY(${scrollY * 0.1}px)`,
          }}
        />
        
        {/* Secondary gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-spotify-black/50 via-transparent to-transparent" />
        
        {/* Page-specific decorative elements */}
        {getPageDecorations()}
        
        {/* Floating musical elements */}
        {getFloatingElements()}
        
        {/* Animated grid pattern */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(29, 185, 84, 0.15) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            transform: `translate(${scrollY * 0.05}px, ${scrollY * 0.03}px)`
          }}
        />
        
        {/* Content Container with Enhanced Scrolling */}
        <div className="relative h-full overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-spotify-green/30 hover:scrollbar-thumb-spotify-green/50">
          <div className={`min-h-full transition-all duration-300 ${
            isTransitioning ? 'opacity-90 scale-98' : 'opacity-100 scale-100'
          }`}>
            {/* Content wrapper with fade-in animation */}
            <div className="animate-fadeIn">
              {children}
            </div>
            
            {/* Bottom gradient fade */}
            <div className="h-32 bg-gradient-to-t from-spotify-black to-transparent pointer-events-none" />
          </div>
        </div>
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-spotify-black/50 backdrop-blur-sm flex items-center justify-center z-40">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-spotify-green/30 border-t-spotify-green rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white font-medium">Loading content...</p>
            </div>
          </div>
        )}
        
        {/* Error overlay */}
        {error && (
          <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slideIn">
            <p className="text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100%); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
        
        .scale-98 {
          transform: scale(0.98);
        }
        
        /* Custom scrollbar */
        .scrollbar-thin {
          scrollbar-width: thin;
        }
        
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background: transparent;
        }
        
        .scrollbar-thumb-spotify-green\/30::-webkit-scrollbar-thumb {
          background-color: rgba(29, 185, 84, 0.3);
          border-radius: 6px;
        }
        
        .scrollbar-thumb-spotify-green\/50:hover::-webkit-scrollbar-thumb {
          background-color: rgba(29, 185, 84, 0.5);
        }
        
        ::-webkit-scrollbar {
          width: 8px;
        }
        
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        
        ::-webkit-scrollbar-thumb {
          background-color: rgba(29, 185, 84, 0.3);
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background-color: rgba(29, 185, 84, 0.5);
        }
      `}</style>
    </div>
  )
}

export default Layout
