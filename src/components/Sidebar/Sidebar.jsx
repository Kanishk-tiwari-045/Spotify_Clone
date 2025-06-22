import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  MagnifyingGlassIcon, 
  BookmarkIcon,
  PlusIcon,
  HeartIcon,
  MusicalNoteIcon,
  FolderIcon,
  EllipsisHorizontalIcon,
  ClockIcon,
  SparklesIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import { 
  HomeIcon as HomeIconSolid, 
  MagnifyingGlassIcon as MagnifyingGlassIconSolid, 
  BookmarkIcon as BookmarkIconSolid,
  HeartIcon as HeartIconSolid
} from '@heroicons/react/24/solid'
import { 
  selectAllPlaylists, 
  createPlaylist, 
  setIsCreating,
  initializeUserPlaylists
} from '../../redux/features/playlistSlice'
import { 
  selectUser,
  selectLikedSongs,
  selectRecentlyPlayed 
} from '../../redux/features/authSlice'
import CreatePlaylistModal from './CreatePlaylistModal'
import toast from 'react-hot-toast'

const Sidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  
  const user = useSelector(selectUser)
  const playlists = useSelector(selectAllPlaylists)
  const likedSongs = useSelector(selectLikedSongs)
  const recentlyPlayed = useSelector(selectRecentlyPlayed)
  const isCreating = useSelector(state => state.playlist.isCreating)
  
  const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, playlist: null })
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [playlistsInitialized, setPlaylistsInitialized] = useState(false)

  // NEW: Initialize user playlists when user changes
  useEffect(() => {
    if (user && user.id && !playlistsInitialized) {
      dispatch(initializeUserPlaylists(user.id))
      setPlaylistsInitialized(true)
    } else if (!user) {
      // Reset when user logs out
      setPlaylistsInitialized(false)
    }
  }, [user, dispatch, playlistsInitialized])

  // Combined navigation items including main nav and quick access
  const allNavigationItems = [
    // Main Navigation
    {
      name: 'Home',
      path: '/',
      icon: HomeIcon,
      activeIcon: HomeIconSolid,
      type: 'main'
    },
    {
      name: 'Search',
      path: '/search',
      icon: MagnifyingGlassIcon,
      activeIcon: MagnifyingGlassIconSolid,
      type: 'main'
    },
    {
      name: 'Your Library',
      path: '/library',
      icon: BookmarkIcon,
      activeIcon: BookmarkIconSolid,
      type: 'main'
    },
    // Quick Access Items
    {
      name: 'Create Playlist',
      path: null,
      icon: PlusIcon,
      activeIcon: PlusIcon,
      type: 'action',
      action: () => {
        dispatch(setIsCreating(true))
        toast.success('Opening playlist creator', { icon: '✨' })
      }
    },
    {
      name: 'Liked Songs',
      path: '/liked-songs',
      icon: HeartIcon,
      activeIcon: HeartIconSolid,
      type: 'quick',
      count: likedSongs.length,
      subtitle: `${likedSongs.length} songs`
    },
    // Conditionally add Recently Played if it has content
    ...(recentlyPlayed.length > 0 ? [{
      name: 'Recently Played',
      path: '/recently-played',
      icon: ClockIcon,
      activeIcon: ClockIcon,
      type: 'quick',
      count: recentlyPlayed.length,
      subtitle: `${recentlyPlayed.length} tracks`
    }] : [])
  ]

  const isActive = (path) => {
    if (!path) return false
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  const handleItemClick = (item) => {
    if (item.action) {
      item.action()
    } else if (item.path) {
      navigate(item.path)
    }
  }

  const handlePlaylistContextMenu = (e, playlist) => {
    e.preventDefault()
    setContextMenu({
      show: true,
      x: e.clientX,
      y: e.clientY,
      playlist
    })
  }

  const closeContextMenu = () => {
    setContextMenu({ show: false, x: 0, y: 0, playlist: null })
  }

  const handlePlaylistClick = (playlistId) => {
    navigate(`/playlist/${playlistId}`)
    closeContextMenu()
  }

  return (
    <>
      <div className={`h-full flex flex-col bg-gradient-to-b from-spotify-black via-gray-900 to-spotify-black border-r border-spotify-green/20 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}>
        
        {/* Logo Section */}
        <div className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-spotify-green to-green-400 rounded-xl flex items-center justify-center shadow-lg">
              <MusicalNoteIcon className="w-6 h-6 text-black" />
            </div>
            {!isCollapsed && (
              <div>
                <span className="text-white font-bold text-xl bg-gradient-to-r from-white to-spotify-green bg-clip-text text-transparent">
                  Spotify Clone
                </span>
                <p className="text-spotify-text-gray text-xs">Music for everyone</p>
              </div>
            )}
          </div>
        </div>

        {/* Combined Navigation List */}
        <nav className="px-6 py-5 flex-1 overflow-hidden">
          <ul className="space-y-2">
            {allNavigationItems.map((item, index) => {
              const Icon = isActive(item.path) ? item.activeIcon : item.icon
              const active = isActive(item.path)
              
              return (
                <li key={`${item.type}-${item.name}-${index}`}>
                  <button
                    onMouseEnter={() => setHoveredItem(`nav-${index}`)}
                    onMouseLeave={() => setHoveredItem(null)}
                    onClick={() => handleItemClick(item)}
                    className={`w-full flex items-center space-x-4 px-4 py-3 rounded-xl font-medium transition-all duration-300 transform group ${
                      active 
                        ? 'bg-gradient-to-r from-spotify-green/20 to-green-400/20 text-spotify-green shadow-lg scale-105' 
                        : 'text-spotify-text-gray hover:text-white hover:bg-white/10 hover:scale-105'
                    }`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300 ${
                      active 
                        ? 'bg-spotify-green text-gray-300 shadow-lg' 
                        : hoveredItem === `nav-${index}` 
                          ? 'bg-spotify-green/20 text-spotify-green' 
                          : 'text-spotify-text-gray'
                    }`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex-1 min-w-0 text-left">
                        <p className="truncate group-hover:text-spotify-green transition-colors">
                          {item.name}
                        </p>
                        {item.subtitle && (
                          <p className="text-xs text-spotify-text-gray truncate">
                            {item.subtitle}
                          </p>
                        )}
                      </div>
                    )}
                  </button>
                </li>
              )
            })}
            {playlists.filter(p => !p.isDefault).map((playlist, playlistIndex) => (
              <li key={playlist.id}>
                <div
                  onMouseEnter={() => setHoveredItem(`playlist-${playlistIndex}`)}
                  onMouseLeave={() => setHoveredItem(null)}
                  onClick={() => handlePlaylistClick(playlist.id)}
                  onContextMenu={(e) => handlePlaylistContextMenu(e, playlist)}
                  className={`flex items-center space-x-4 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 transform group ${
                    isActive(`/playlist/${playlist.id}`) 
                      ? 'bg-gradient-to-r from-spotify-green/20 to-green-400/20 text-spotify-green shadow-lg scale-105' 
                      : 'text-spotify-text-gray hover:text-white hover:bg-white/10 hover:scale-105'
                  }`}
                  title={isCollapsed ? playlist.name : ''}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300 ${
                    isActive(`/playlist/${playlist.id}`)
                      ? 'bg-spotify-green text-black shadow-lg'
                      : hoveredItem === `playlist-${playlistIndex}`
                        ? 'bg-spotify-green/20 text-spotify-green'
                        : 'bg-spotify-light-gray text-spotify-text-gray'
                  }`}>
                    {playlist.coverImage ? (
                      <img 
                        src={playlist.coverImage} 
                        alt={playlist.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FolderIcon className="w-5 h-5" />
                    )}
                  </div>
                  
                  {!isCollapsed && (
                    <>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate group-hover:text-spotify-green transition-colors">
                          {playlist.name}
                        </p>
                        <p className="text-xs text-spotify-text-gray truncate">
                          {playlist.songs?.length || 0} songs
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-1/2 transform -translate-y-1/2 w-6 h-6 bg-spotify-green rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300"
        >
          <span className="text-black text-xs font-bold">
            {isCollapsed ? '→' : '←'}
          </span>
        </button>
      </div>

      {/* Create Playlist Modal */}
      {isCreating && <CreatePlaylistModal />}
    </>
  )
}

export default Sidebar
