import { configureStore } from '@reduxjs/toolkit'
import playerReducer from './features/playerSlice'
import playlistReducer from './features/playlistSlice'
import searchReducer from './features/searchSlice'
import authReducer from './features/authSlice'
import musicDataReducer from './features/musicDataSlice'

export const store = configureStore({
  reducer: {
    player: playerReducer,
    playlist: playlistReducer,
    search: searchReducer,
    auth: authReducer,
    musicData: musicDataReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.MODE !== 'production',
})

// NEW: Simple persistence helper
export const initializeUserSession = (userId) => {
  console.log(`Initializing session for user: ${userId}`)
  store.dispatch({ 
    type: 'playlist/initializeUserPlaylists', 
    payload: userId 
  })
}

// NEW: Clear user data on logout
export const clearUserData = (userId) => {
  const keysToRemove = [
    `spotify_clone_playlists_${userId}`,
  ]
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key)
  })
}

export const RootState = () => store.getState()
export const AppDispatch = store.dispatch
