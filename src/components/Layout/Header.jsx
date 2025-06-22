import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  MusicalNoteIcon,
} from '@heroicons/react/24/outline'
import { logout, selectUser } from '../../redux/features/authSlice'
import { setIsPlaying } from '../../redux/features/playerSlice'
import SearchBar from '../Search/SearchBar'
import toast from 'react-hot-toast'

const Header = ({ title }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const { currentSong, isPlaying } = useSelector(state => state.player)
  
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  const canGoBack = window.history.length > 1
  const isSearchPage = location.pathname === '/search'

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Update current time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(timer)
  }, [])

  const handleBack = () => {
    if (canGoBack) {
      navigate(-1)
      toast.success('Navigated back', { icon: '⬅️' })
    }
  }

  const handleForward = () => {
    navigate(1)
    toast.success('Navigated forward', { icon: '➡️' })
  }

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      dispatch(logout())
      toast.success('Logged out successfully', { icon: '👋' })
    }
  }

  const handleCurrentSongClick = () => {
    if (currentSong) {
      dispatch(setIsPlaying(!isPlaying))
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  return (
    <header className={`sticky top-0 z-50 p-0 border-b border-spotify-white/20 bg-gradient-to-r from-spotify-black via-gray-900 to-spotify-black transition-all duration-300 ${
      isScrolled 
        ? 'bg-gradient-to-b from-spotify-black via-gray-900 to-spotify-black backdrop-blur-xl shadow-2xl' 
        : 'bg-gradient-to-b from-spotify-black via-gray-900 to-spotify-black backdrop-blur-lg'
    }`}>
      <div className="flex items-center justify-between p-4">
        {/* Left Section - Navigation Controls */}
        <div className="flex items-center space-x-6">
          {/* Back/Forward Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBack}
              disabled={!canGoBack}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 transform ${
                canGoBack 
                  ? 'bg-spotify-white/10 hover:bg-spotify-green text-white hover:text-black shadow-lg hover:shadow-spotify-green/25' 
                  : 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
              }`}
              title="Go back"
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </button>
            
            <button
              onClick={handleForward}
              className="w-10 h-10 rounded-full bg-spotify-white/10 hover:bg-spotify-green text-white hover:text-black flex items-center justify-center transition-all duration-300 transform shadow-lg hover:shadow-spotify-green/25"
              title="Go forward"
            >
              <ChevronRightIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Page Title with Animation */}
          {!isSearchPage && (
            <div className="hidden md:block">
              <div className="flex items-center space-x-3">
                <h1 className="text-2xl font-bold text-white bg-gradient-to-r from-white to-spotify-green bg-clip-text text-transparent">
                  {title}
                </h1>
              </div>
            </div>
          )}
        </div>

        {/* Center - Search Bar (only on search page) */}
        {isSearchPage && (
          <div className="flex-1 max-w-md mx-8">
            <SearchBar />
          </div>
        )}

        {/* Right Section - User Profile & Controls */}
        <div className="flex items-center space-x-4">
          {/* User Profile Dropdown */}
          <div className="relative">
            <button 
              className="flex items-center space-x-3 bg-gradient-to-r from-spotify-light-gray/80 to-spotify-gray/80 backdrop-blur-sm hover:from-spotify-green/20 hover:to-green-400/20 rounded-full px-4 py-2 transition-all duration-300 transform hover:scale-105 border border-spotify-green/20 group"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-spotify-green rounded-full flex items-center justify-center">
                  <span className="text-black font-bold text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-spotify-black"></div>
              </div>
              <div className="hidden md:block text-left">
                <p className="text-white font-medium group-hover:text-spotify-green transition-colors">
                  {user?.name}
                </p>
                <p className="text-spotify-text-gray text-xs">
                  Premium User
                </p>
              </div>
              <ChevronRightIcon className={`w-4 h-4 text-spotify-text-gray transition-transform duration-300 ${
                showUserMenu ? 'rotate-90' : ''
              }`} />
            </button>
            
            {/* Enhanced Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-64 bg-gradient-to-br from-spotify-light-gray to-spotify-gray backdrop-blur-xl rounded-2xl shadow-2xl border border-spotify-green/30 animate-slideIn overflow-hidden">
                {/* User Info Header */}
                <div className="p-4 bg-gradient-to-r from-spotify-green/20 to-transparent border-b border-spotify-green/20">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
                      <span className="text-black font-bold text-lg">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-white font-semibold">{user?.name}</p>
                      <p className="text-spotify-text-gray text-sm font-mono">{user?.codename}</p>
                      <p className="text-spotify-green text-xs">Premium Account</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <button 
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-spotify-green/20 transition-all duration-300 group"
                    onClick={() => {
                      setShowUserMenu(false)
                      navigate('/library')
                    }}
                  >
                    <MusicalNoteIcon className="w-5 h-5 text-spotify-text-gray group-hover:text-spotify-green transition-colors" />
                    <span className="group-hover:text-spotify-green transition-colors">Your Library</span>
                  </button>
                  
                  <button 
                    className="w-full flex items-center space-x-3 px-4 py-3 text-white hover:bg-spotify-green/20 transition-all duration-300 group"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Cog6ToothIcon className="w-5 h-5 text-spotify-text-gray group-hover:text-spotify-green transition-colors" />
                    <span className="group-hover:text-spotify-green transition-colors">Settings</span>
                  </button>
                  
                  <hr className="my-2 border-spotify-green/20" />
                  
                  <button 
                    onClick={() => {
                      setShowUserMenu(false)
                      handleLogout()
                    }}
                    className="w-full flex items-center space-x-3 px-4 py-3 text-red-400 hover:bg-red-500/20 transition-all duration-300 group"
                  >
                    <ArrowRightOnRectangleIcon className="w-5 h-5 group-hover:text-red-300 transition-colors" />
                    <span className="group-hover:text-red-300 transition-colors">Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close menu */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        ></div>
      )}

      {/* Custom animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.2s ease-out;
        }
      `}</style>
    </header>
  )
}

export default Header
