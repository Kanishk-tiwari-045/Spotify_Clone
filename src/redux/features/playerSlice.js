import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  isShuffled: false,
  repeatMode: 'off', // 'off', 'all', 'one'
  queue: [],
  currentIndex: 0,
  isLoading: false,
  error: null,
  shuffleHistory: [], // Track played songs in shuffle mode
  originalQueue: [], // Store original queue order before shuffle
}

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    setCurrentSong: (state, action) => {
      state.currentSong = action.payload
      state.currentTime = 0 // Reset time when song changes
      state.error = null
      
      // Update currentIndex if song is in queue
      if (state.queue.length > 0) {
        const songIndex = state.queue.findIndex(song => song.id === action.payload.id)
        if (songIndex !== -1) {
          state.currentIndex = songIndex
        }
      }
    },
    
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload
    },
    
    setCurrentTime: (state, action) => {
      state.currentTime = action.payload
    },
    
    setDuration: (state, action) => {
      state.duration = action.payload
    },
    
    setVolume: (state, action) => {
      state.volume = Math.max(0, Math.min(1, action.payload))
      // Don't auto-mute when volume is set to 0 programmatically
    },
    
    toggleMute: (state) => {
      state.isMuted = !state.isMuted
    },
    
    toggleShuffle: (state) => {
      state.isShuffled = !state.isShuffled
      
      if (state.isShuffled) {
        // Store original queue order
        state.originalQueue = [...state.queue]
        state.shuffleHistory = []
        
        // Add current song to history if it exists
        if (state.currentSong) {
          state.shuffleHistory.push(state.currentIndex)
        }
      } else {
        // Restore original queue order
        if (state.originalQueue.length > 0) {
          state.queue = [...state.originalQueue]
          
          // Find current song in restored queue
          if (state.currentSong) {
            const songIndex = state.queue.findIndex(song => song.id === state.currentSong.id)
            if (songIndex !== -1) {
              state.currentIndex = songIndex
            }
          }
        }
        state.shuffleHistory = []
        state.originalQueue = []
      }
    },
    
    setRepeatMode: (state) => {
      const modes = ['off', 'all', 'one']
      const currentIndex = modes.indexOf(state.repeatMode)
      state.repeatMode = modes[(currentIndex + 1) % modes.length]
    },
    
    setQueue: (state, action) => {
      state.queue = action.payload
      state.currentIndex = 0
      state.shuffleHistory = []
      
      // If we have a current song, find its index in the new queue
      if (state.currentSong && action.payload.length > 0) {
        const songIndex = action.payload.findIndex(song => song.id === state.currentSong.id)
        if (songIndex !== -1) {
          state.currentIndex = songIndex
        } else {
          // If current song not in queue, set first song as current
          state.currentSong = action.payload[0]
          state.currentIndex = 0
        }
      }
    },
    
    addToQueue: (state, action) => {
      state.queue.push(action.payload)
      
      // If no current song, set this as current
      if (!state.currentSong && state.queue.length === 1) {
        state.currentSong = action.payload
        state.currentIndex = 0
      }
    },
    
    removeFromQueue: (state, action) => {
      const indexToRemove = action.payload
      
      // Remove song from queue
      state.queue = state.queue.filter((_, index) => index !== indexToRemove)
      
      // Adjust current index
      if (indexToRemove < state.currentIndex) {
        state.currentIndex -= 1
      } else if (indexToRemove === state.currentIndex) {
        // If we removed the current song
        if (state.queue.length === 0) {
          // No songs left
          state.currentSong = null
          state.currentIndex = 0
          state.isPlaying = false
        } else {
          // Set next song or wrap to beginning
          if (state.currentIndex >= state.queue.length) {
            state.currentIndex = 0
          }
          state.currentSong = state.queue[state.currentIndex]
        }
      }
    },
    
    nextSong: (state) => {
      if (state.queue.length === 0) return
      
      if (state.queue.length === 1) {
        // Only one song - restart it or stop based on repeat mode
        if (state.repeatMode === 'one' || state.repeatMode === 'all') {
          state.currentTime = 0
        } else {
          state.isPlaying = false
        }
        return
      }
      
      if (state.isShuffled) {
        // Shuffle mode: pick random song not in recent history
        const availableIndices = state.queue
          .map((_, index) => index)
          .filter(index => 
            index !== state.currentIndex && 
            !state.shuffleHistory.slice(-Math.floor(state.queue.length / 2)).includes(index)
          )
        
        if (availableIndices.length === 0) {
          // All songs played recently, reset history and pick any song except current
          state.shuffleHistory = [state.currentIndex]
          const otherIndices = state.queue
            .map((_, index) => index)
            .filter(index => index !== state.currentIndex)
          
          if (otherIndices.length > 0) {
            state.currentIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)]
          }
        } else {
          state.currentIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)]
        }
        
        // Add to shuffle history
        state.shuffleHistory.push(state.currentIndex)
        
        // Keep history reasonable size
        if (state.shuffleHistory.length > state.queue.length) {
          state.shuffleHistory = state.shuffleHistory.slice(-Math.floor(state.queue.length / 2))
        }
      } else {
        // Normal mode: next song in order
        if (state.currentIndex < state.queue.length - 1) {
          state.currentIndex += 1
        } else if (state.repeatMode === 'all') {
          state.currentIndex = 0
        } else {
          // End of queue and no repeat
          state.isPlaying = false
          return
        }
      }
      
      // Set the new current song
      if (state.queue[state.currentIndex]) {
        state.currentSong = state.queue[state.currentIndex]
        state.currentTime = 0
      }
    },
    
    previousSong: (state) => {
      if (state.queue.length === 0) return
      
      if (state.queue.length === 1) {
        // Only one song - restart it
        state.currentTime = 0
        return
      }
      
      if (state.isShuffled) {
        // Shuffle mode: go to previous song in shuffle history
        if (state.shuffleHistory.length > 1) {
          // Remove current song from history
          state.shuffleHistory.pop()
          // Get previous song from history
          state.currentIndex = state.shuffleHistory[state.shuffleHistory.length - 1]
        } else {
          // No history, pick random song
          const otherIndices = state.queue
            .map((_, index) => index)
            .filter(index => index !== state.currentIndex)
          
          if (otherIndices.length > 0) {
            state.currentIndex = otherIndices[Math.floor(Math.random() * otherIndices.length)]
            state.shuffleHistory = [state.currentIndex]
          }
        }
      } else {
        // Normal mode: previous song in order
        if (state.currentIndex > 0) {
          state.currentIndex -= 1
        } else if (state.repeatMode === 'all') {
          state.currentIndex = state.queue.length - 1
        } else {
          // Beginning of queue and no repeat - restart current song
          state.currentTime = 0
          return
        }
      }
      
      // Set the new current song
      if (state.queue[state.currentIndex]) {
        state.currentSong = state.queue[state.currentIndex]
        state.currentTime = 0
      }
    },
    
    setCurrentIndex: (state, action) => {
      const newIndex = action.payload
      
      if (newIndex >= 0 && newIndex < state.queue.length) {
        state.currentIndex = newIndex
        state.currentSong = state.queue[newIndex]
        state.currentTime = 0
        
        // Add to shuffle history if in shuffle mode
        if (state.isShuffled) {
          state.shuffleHistory.push(newIndex)
          if (state.shuffleHistory.length > state.queue.length) {
            state.shuffleHistory = state.shuffleHistory.slice(-Math.floor(state.queue.length / 2))
          }
        }
      }
    },
    
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
    
    resetPlayer: (state) => {
      return { 
        ...initialState, 
        volume: state.volume,
        isMuted: state.isMuted 
      }
    },
    
    // New helper actions
    playNext: (state, action) => {
      // Add song to play next in queue
      const song = action.payload
      const nextIndex = state.currentIndex + 1
      
      state.queue.splice(nextIndex, 0, song)
      
      // Adjust shuffle history if needed
      if (state.isShuffled) {
        state.shuffleHistory = state.shuffleHistory.map(index => 
          index >= nextIndex ? index + 1 : index
        )
      }
    },
    
    addToQueueEnd: (state, action) => {
      // Add song to end of queue
      state.queue.push(action.payload)
    },
    
    clearQueue: (state) => {
      state.queue = []
      state.currentIndex = 0
      state.shuffleHistory = []
      state.originalQueue = []
      state.currentSong = null
      state.isPlaying = false
    },
    
    shuffleQueue: (state) => {
      if (state.queue.length <= 1) return
      
      // Store original order
      state.originalQueue = [...state.queue]
      
      // Create shuffled queue with current song first
      const currentSong = state.currentSong
      const otherSongs = state.queue.filter(song => song.id !== currentSong?.id)
      
      // Shuffle other songs
      for (let i = otherSongs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [otherSongs[i], otherSongs[j]] = [otherSongs[j], otherSongs[i]]
      }
      
      // Set new queue with current song first
      if (currentSong) {
        state.queue = [currentSong, ...otherSongs]
        state.currentIndex = 0
      } else {
        state.queue = otherSongs
      }
      
      state.isShuffled = true
      state.shuffleHistory = [0]
    }
  },
})

export const {
  setCurrentSong,
  setIsPlaying,
  setCurrentTime,
  setDuration,
  setVolume,
  toggleMute,
  toggleShuffle,
  setRepeatMode,
  setQueue,
  addToQueue,
  removeFromQueue,
  nextSong,
  previousSong,
  setCurrentIndex,
  setLoading,
  setError,
  clearError,
  resetPlayer,
  playNext,
  addToQueueEnd,
  clearQueue,
  shuffleQueue,
} = playerSlice.actions

export default playerSlice.reducer

// Enhanced Selectors
export const selectCurrentSong = (state) => state.player.currentSong
export const selectIsPlaying = (state) => state.player.isPlaying
export const selectPlayerState = (state) => state.player
export const selectQueue = (state) => state.player.queue
export const selectCurrentIndex = (state) => state.player.currentIndex
export const selectIsShuffled = (state) => state.player.isShuffled
export const selectRepeatMode = (state) => state.player.repeatMode
export const selectVolume = (state) => state.player.volume
export const selectIsMuted = (state) => state.player.isMuted
export const selectCurrentTime = (state) => state.player.currentTime
export const selectDuration = (state) => state.player.duration
export const selectIsLoading = (state) => state.player.isLoading
export const selectError = (state) => state.player.error

// Computed selectors
export const selectHasNextSong = (state) => {
  const { queue, currentIndex, repeatMode, isShuffled } = state.player
  if (queue.length <= 1) return repeatMode === 'one' || repeatMode === 'all'
  if (isShuffled) return true
  return currentIndex < queue.length - 1 || repeatMode === 'all'
}

export const selectHasPreviousSong = (state) => {
  const { queue, currentIndex, repeatMode, isShuffled } = state.player
  if (queue.length <= 1) return true // Can restart current song
  if (isShuffled) return true
  return currentIndex > 0 || repeatMode === 'all'
}

export const selectQueuePosition = (state) => {
  const { currentIndex, queue } = state.player
  return {
    current: currentIndex + 1,
    total: queue.length
  }
}
