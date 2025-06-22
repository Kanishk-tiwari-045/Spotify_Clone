import { createSlice, nanoid } from '@reduxjs/toolkit'

// Persistence helper functions
const savePlaylistsToStorage = (playlists, userId = 'guest') => {
  try {
    const key = `spotify_clone_playlists_${userId}`
    localStorage.setItem(key, JSON.stringify(playlists))
  } catch (error) {
    console.error('Failed to save playlists:', error)
  }
}

const loadPlaylistsFromStorage = (userId = 'guest') => {
  try {
    const key = `spotify_clone_playlists_${userId}`
    const stored = localStorage.getItem(key)
    if (stored) {
      const playlists = JSON.parse(stored)
      // Ensure default "Liked Songs" playlist exists
      const hasLikedSongs = playlists.some(p => p.isDefault && p.name === 'Liked Songs')
      if (!hasLikedSongs) {
        playlists.unshift({
          id: 'liked-songs',
          name: 'Liked Songs',
          description: 'Your favorite tracks',
          songs: [],
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          coverImage: null,
          isPublic: true,
        })
      }
      return playlists
    }
  } catch (error) {
    console.error('Failed to load playlists:', error)
  }
  
  // Return default playlists if nothing in storage
  return [
    {
      id: 'liked-songs',
      name: 'Liked Songs',
      description: 'Your favorite tracks',
      songs: [],
      isDefault: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverImage: null,
      isPublic: true,
    }
  ]
}

const initialState = {
  playlists: loadPlaylistsFromStorage(), // Load from storage on init
  currentPlaylist: null,
  isCreating: false,
  isEditing: false,
  error: null,
  currentUserId: 'guest', // Track current user for persistence
}

const playlistSlice = createSlice({
  name: 'playlist',
  initialState,
  reducers: {
    // New: Initialize playlists for specific user
    initializeUserPlaylists: (state, action) => {
      const userId = action.payload || 'guest'
      state.currentUserId = userId
      state.playlists = loadPlaylistsFromStorage(userId)
    },
    
    createPlaylist: (state, action) => {
      const newPlaylist = {
        id: nanoid(),
        name: action.payload.name || 'New Playlist',
        description: action.payload.description || '',
        songs: [],
        isDefault: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        coverImage: action.payload.coverImage || null,
        isPublic: action.payload.isPublic || false,
        userId: state.currentUserId, // Add user ownership
      }
      state.playlists.push(newPlaylist)
      state.currentPlaylist = newPlaylist
      state.isCreating = false
      
      // Save to storage
      savePlaylistsToStorage(state.playlists, state.currentUserId)
    },
    
    updatePlaylist: (state, action) => {
      const { id, updates } = action.payload
      const playlistIndex = state.playlists.findIndex(p => p.id === id)
      
      if (playlistIndex !== -1) {
        state.playlists[playlistIndex] = {
          ...state.playlists[playlistIndex],
          ...updates,
          updatedAt: new Date().toISOString(),
        }
        
        if (state.currentPlaylist?.id === id) {
          state.currentPlaylist = state.playlists[playlistIndex]
        }
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
      state.isEditing = false
    },
    
    deletePlaylist: (state, action) => {
      const playlistId = action.payload
      state.playlists = state.playlists.filter(p => p.id !== playlistId && !p.isDefault)
      
      if (state.currentPlaylist?.id === playlistId) {
        state.currentPlaylist = null
      }
      
      // Save to storage
      savePlaylistsToStorage(state.playlists, state.currentUserId)
    },
    
    addSongToPlaylist: (state, action) => {
      const { playlistId, song } = action.payload
      const playlist = state.playlists.find(p => p.id === playlistId)
      
      if (playlist) {
        const songExists = playlist.songs.some(s => s.id === song.id)
        if (!songExists) {
          playlist.songs.push({
            ...song,
            addedAt: new Date().toISOString(),
            addedBy: state.currentUserId,
          })
          playlist.updatedAt = new Date().toISOString()
          
          // Save to storage
          savePlaylistsToStorage(state.playlists, state.currentUserId)
        }
      }
    },
    
    removeSongFromPlaylist: (state, action) => {
      const { playlistId, songId } = action.payload
      const playlist = state.playlists.find(p => p.id === playlistId)
      
      if (playlist) {
        playlist.songs = playlist.songs.filter(s => s.id !== songId)
        playlist.updatedAt = new Date().toISOString()
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
    },
    
    reorderPlaylistSongs: (state, action) => {
      const { playlistId, fromIndex, toIndex } = action.payload
      const playlist = state.playlists.find(p => p.id === playlistId)
      
      if (playlist) {
        const songs = [...playlist.songs]
        const [movedSong] = songs.splice(fromIndex, 1)
        songs.splice(toIndex, 0, movedSong)
        playlist.songs = songs
        playlist.updatedAt = new Date().toISOString()
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
    },
    
    setCurrentPlaylist: (state, action) => {
      const playlistId = action.payload
      state.currentPlaylist = state.playlists.find(p => p.id === playlistId) || null
    },
    
    duplicatePlaylist: (state, action) => {
      const originalPlaylist = state.playlists.find(p => p.id === action.payload)
      
      if (originalPlaylist) {
        const duplicatedPlaylist = {
          ...originalPlaylist,
          id: nanoid(),
          name: `${originalPlaylist.name} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDefault: false,
          userId: state.currentUserId,
        }
        state.playlists.push(duplicatedPlaylist)
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
    },
    
    togglePlaylistVisibility: (state, action) => {
      const playlist = state.playlists.find(p => p.id === action.payload)
      if (playlist) {
        playlist.isPublic = !playlist.isPublic
        playlist.updatedAt = new Date().toISOString()
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
    },
    
    setIsCreating: (state, action) => {
      state.isCreating = action.payload
    },
    
    setIsEditing: (state, action) => {
      state.isEditing = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    importPlaylist: (state, action) => {
      const importedPlaylist = {
        ...action.payload,
        id: nanoid(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDefault: false,
        userId: state.currentUserId,
      }
      state.playlists.push(importedPlaylist)
      
      // Save to storage
      savePlaylistsToStorage(state.playlists, state.currentUserId)
    },
    
    bulkAddToPlaylist: (state, action) => {
      const { playlistId, songs } = action.payload
      const playlist = state.playlists.find(p => p.id === playlistId)
      
      if (playlist) {
        const newSongs = songs.filter(song => 
          !playlist.songs.some(existingSong => existingSong.id === song.id)
        ).map(song => ({
          ...song,
          addedAt: new Date().toISOString(),
          addedBy: state.currentUserId,
        }))
        
        playlist.songs.push(...newSongs)
        playlist.updatedAt = new Date().toISOString()
        
        // Save to storage
        savePlaylistsToStorage(state.playlists, state.currentUserId)
      }
    },
    
    // New: Clear all playlists (for logout)
    clearPlaylists: (state) => {
      state.playlists = [
        {
          id: 'liked-songs',
          name: 'Liked Songs',
          description: 'Your favorite tracks',
          songs: [],
          isDefault: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          coverImage: null,
          isPublic: true,
        }
      ]
      state.currentPlaylist = null
      state.currentUserId = 'guest'
    },
  },
})

export const {
  initializeUserPlaylists,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  reorderPlaylistSongs,
  setCurrentPlaylist,
  duplicatePlaylist,
  togglePlaylistVisibility,
  setIsCreating,
  setIsEditing,
  setError,
  clearError,
  importPlaylist,
  bulkAddToPlaylist,
  clearPlaylists,
} = playlistSlice.actions

export default playlistSlice.reducer

// Enhanced Selectors (unchanged)
export const selectAllPlaylists = (state) => state.playlist.playlists
export const selectCurrentPlaylist = (state) => state.playlist.currentPlaylist
export const selectUserPlaylists = (state) => 
  state.playlist.playlists.filter(p => !p.isDefault)
export const selectLikedSongs = (state) => 
  state.playlist.playlists.find(p => p.isDefault)?.songs || []
export const selectPlaylistById = (state, playlistId) => 
  state.playlist.playlists.find(p => p.id === playlistId)
export const selectPlaylistsCount = (state) => state.playlist.playlists.length
export const selectTotalSongsInPlaylists = (state) => 
  state.playlist.playlists.reduce((total, playlist) => total + playlist.songs.length, 0)
export const selectCurrentUserId = (state) => state.playlist.currentUserId
