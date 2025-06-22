import { createSlice, createSelector } from '@reduxjs/toolkit'
import { AuthService } from '../services/authService'

const initialState = {
  user: AuthService.getCurrentUser(),
  isAuthenticated: AuthService.isAuthenticated(),
  isLoading: false,
  error: null,
  showCodenamePopup: false,
  generatedCodename: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.isLoading = action.payload
    },
    
    setError: (state, action) => {
      state.error = action.payload
      state.isLoading = false
    },
    
    clearError: (state) => {
      state.error = null
    },
    
    signupSuccess: (state, action) => {
      const { user, codename } = action.payload
      state.user = user
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
      state.showCodenamePopup = true
      state.generatedCodename = codename
    },
    
    loginSuccess: (state, action) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.isLoading = false
      state.error = null
    },
    
    logout: (state) => {
      AuthService.logout()
      state.user = null
      state.isAuthenticated = false
      state.error = null
      state.showCodenamePopup = false
      state.generatedCodename = null
    },
    
    updateUserData: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
        AuthService.updateUser(state.user)
      }
    },
    
    hideCodenamePopup: (state) => {
      state.showCodenamePopup = false
      state.generatedCodename = null
    },
    
    addToLikedSongs: (state, action) => {
      if (state.user && state.user.musicData) {
        const song = action.payload
        // Ensure likedSongs array exists
        if (!state.user.musicData.likedSongs) {
          state.user.musicData.likedSongs = []
        }
        
        // Check if song already exists
        if (!state.user.musicData.likedSongs.find(s => s.id === song.id)) {
          state.user.musicData.likedSongs.push({
            ...song,
            addedAt: new Date().toISOString()
          })
          AuthService.updateUser(state.user)
        }
      }
    },
    
    removeFromLikedSongs: (state, action) => {
      if (state.user && state.user.musicData && state.user.musicData.likedSongs) {
        const songId = action.payload
        state.user.musicData.likedSongs = state.user.musicData.likedSongs.filter(s => s.id !== songId)
        AuthService.updateUser(state.user)
      }
    },
    
    addToRecentlyPlayed: (state, action) => {
      if (state.user && state.user.musicData) {
        const song = action.payload
        
        // Ensure recentlyPlayed array exists
        if (!state.user.musicData.recentlyPlayed) {
          state.user.musicData.recentlyPlayed = []
        }
        
        const recentlyPlayed = state.user.musicData.recentlyPlayed
        
        // Remove if already exists
        const filtered = recentlyPlayed.filter(s => s.id !== song.id)
        
        // Add to beginning with timestamp
        state.user.musicData.recentlyPlayed = [{
          ...song,
          playedAt: new Date().toISOString()
        }, ...filtered].slice(0, 50)
        
        AuthService.updateUser(state.user)
      }
    },
    
    clearRecentlyPlayed: (state) => {
      if (state.user && state.user.musicData) {
        state.user.musicData.recentlyPlayed = []
        AuthService.updateUser(state.user)
      }
    },
    
    followArtist: (state, action) => {
      if (state.user && state.user.musicData) {
        const artist = action.payload
        
        // Ensure followedArtists array exists
        if (!state.user.musicData.followedArtists) {
          state.user.musicData.followedArtists = []
        }
        
        if (!state.user.musicData.followedArtists.find(a => a.id === artist.id)) {
          state.user.musicData.followedArtists.push({
            ...artist,
            followedAt: new Date().toISOString()
          })
          AuthService.updateUser(state.user)
        }
      }
    },
    
    unfollowArtist: (state, action) => {
      if (state.user && state.user.musicData && state.user.musicData.followedArtists) {
        const artistId = action.payload
        state.user.musicData.followedArtists = state.user.musicData.followedArtists.filter(a => a.id !== artistId)
        AuthService.updateUser(state.user)
      }
    }
  }
})

// FIXED: Enhanced async action creators with backward compatibility
export const signup = (userData) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    // Handle both old format (just name string) and new format (userData object)
    let signupData
    if (typeof userData === 'string') {
      // Old format from your forms: signup(name)
      signupData = userData
    } else {
      // New format: signup({name, email, password})
      signupData = userData
    }
    
    const result = AuthService.signup(signupData)
    dispatch(signupSuccess(result))
    
    // Initialize user playlists after successful signup
    dispatch({ type: 'playlist/initializeUserPlaylists', payload: result.user.id })
  } catch (error) {
    dispatch(setError(error.message))
  }
}

export const login = (nameOrCredentials, codename) => async (dispatch) => {
  dispatch(setLoading(true))
  try {
    let user
    
    if (typeof nameOrCredentials === 'string' && codename) {
      // Old format from your forms: login(name, codename)
      user = AuthService.login(nameOrCredentials, codename)
    } else {
      // New format: login({name, codename})
      user = AuthService.login(nameOrCredentials)
    }
    
    dispatch(loginSuccess(user))
    
    // Initialize user playlists after successful login
    dispatch({ type: 'playlist/initializeUserPlaylists', payload: user.id })
  } catch (error) {
    dispatch(setError(error.message))
  }
}

// Enhanced logout with playlist cleanup
export const logoutUser = () => (dispatch, getState) => {
  const state = getState()
  const userId = state.auth.user?.id
  
  // Clear user playlists before logout
  if (userId) {
    dispatch({ type: 'playlist/clearPlaylists' })
  }
  
  dispatch(logout())
}

export const {
  setLoading,
  setError,
  clearError,
  signupSuccess,
  loginSuccess,
  logout,
  updateUserData,
  hideCodenamePopup,
  addToLikedSongs,
  removeFromLikedSongs,
  addToRecentlyPlayed,
  clearRecentlyPlayed,
  followArtist,
  unfollowArtist
} = authSlice.actions

export default authSlice.reducer

// Basic selectors (unchanged)
export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectAuthLoading = (state) => state.auth.isLoading
export const selectAuthError = (state) => state.auth.error
export const selectShowCodenamePopup = (state) => state.auth.showCodenamePopup
export const selectGeneratedCodename = (state) => state.auth.generatedCodename

// Memoized selectors (unchanged)
export const selectLikedSongs = createSelector(
  [(state) => state.auth.user?.musicData?.likedSongs],
  (likedSongs) => likedSongs || []
)

export const selectRecentlyPlayed = createSelector(
  [(state) => state.auth.user?.musicData?.recentlyPlayed],
  (recentlyPlayed) => recentlyPlayed || []
)

export const selectFollowedArtists = createSelector(
  [(state) => state.auth.user?.musicData?.followedArtists],
  (followedArtists) => followedArtists || []
)

export const selectUserPreferences = createSelector(
  [(state) => state.auth.user?.preferences],
  (preferences) => preferences || {}
)

export const selectUserMusicData = createSelector(
  [(state) => state.auth.user?.musicData],
  (musicData) => musicData || {
    likedSongs: [],
    recentlyPlayed: [],
    followedArtists: [],
    playlists: [],
    savedAlbums: []
  }
)

// Computed selectors (unchanged)
export const selectLikedSongsCount = createSelector(
  [selectLikedSongs],
  (likedSongs) => likedSongs.length
)

export const selectRecentlyPlayedCount = createSelector(
  [selectRecentlyPlayed],
  (recentlyPlayed) => recentlyPlayed.length
)

export const selectFollowedArtistsCount = createSelector(
  [selectFollowedArtists],
  (followedArtists) => followedArtists.length
)

// Helper selectors (unchanged)
export const selectIsSongLiked = createSelector(
  [selectLikedSongs, (state, songId) => songId],
  (likedSongs, songId) => likedSongs.some(song => song.id === songId)
)

export const selectIsArtistFollowed = createSelector(
  [selectFollowedArtists, (state, artistId) => artistId],
  (followedArtists, artistId) => followedArtists.some(artist => artist.id === artistId)
)
