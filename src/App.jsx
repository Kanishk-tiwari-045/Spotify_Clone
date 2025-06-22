import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider, useSelector, useDispatch } from 'react-redux'
import { store } from './redux/store'
import { Toaster } from 'react-hot-toast'

// Authentication Components
import { selectIsAuthenticated } from './redux/features/authSlice'
import { fetchFeaturedContent } from './redux/features/musicDataSlice'
import AuthScreen from './components/Auth/AuthScreen'

// Layout Components
import Layout from './components/Layout/Layout'
import Sidebar from './components/Sidebar/Sidebar'
import Player from './components/Player/Player'

// Page Components
import Home from './pages/Home'
import Search from './pages/Search'
import Library from './pages/Library'
import Playlist from './pages/Playlist'
import Album from './pages/Album'
import Artist from './pages/Artist'
import Genre from './pages/Genre'
import LikedSongs from './pages/LikedSongs'
import RecentlyPlayed from './pages/RecentlyPlayed'

// Styles
import './styles/globals.css'

const AppContent = () => {
  const dispatch = useDispatch()
  const isAuthenticated = useSelector(selectIsAuthenticated)

  useEffect(() => {
    if (isAuthenticated) {
      // Load featured content when user is authenticated
      dispatch(fetchFeaturedContent())
    }
  }, [isAuthenticated, dispatch])

  // Show authentication screen if not logged in
  if (!isAuthenticated) {
    return <AuthScreen />
  }

  // Main app layout for authenticated users
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="h-screen bg-spotify-black text-white overflow-hidden">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#282828',
              color: '#fff',
              border: '1px solid #404040',
            },
            success: {
              iconTheme: {
                primary: '#1DB954',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#E22134',
                secondary: '#fff',
              },
            },
          }}
        />
        
        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-spotify-black border-r border-spotify-light-gray">
            <Sidebar />
          </div>
          
          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex-1 overflow-hidden">
              <Layout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="/library" element={<Library />} />
                  <Route path="/playlist/:id" element={<Playlist />} />
                  <Route path="/album/:id" element={<Album />} />
                  <Route path="/artist/:id" element={<Artist />} />
                  <Route path="/genre/:id" element={<Genre />} />
                  <Route path="/liked-songs" element={<LikedSongs />} />
                  <Route path="/recently-played" element={<RecentlyPlayed />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </Layout>
            </div>
            
            {/* Enhanced Music Player */}
            <div className="h-24 bg-gradient-to-r from-spotify-light-gray to-spotify-gray border-t border-spotify-light-gray shadow-2xl">
              <Player />
            </div>
          </div>
        </div>
      </div>
    </Router>
  )
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  )
}

export default App
