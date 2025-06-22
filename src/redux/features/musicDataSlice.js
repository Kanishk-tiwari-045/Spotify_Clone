import { createSlice } from '@reduxjs/toolkit'
import { MusicAPIService } from '../services/musicApiService'
import RapidApiDeezerService from '../services/rapidApiDeezarService'

const initialState = {
  featuredContent: {
    topTracks: [],
    newReleases: [],
    featuredPlaylists: []
  },
  searchResults: {
    artists: [],
    albums: [],
    tracks: []
  },
  artistDetails: {},
  albumDetails: {},
  playableTracks: [],
  deezerData: {
    topCharts: [],
    searchCache: {},
    lastUpdated: null
  },
  isLoading: false,
  error: null,
  lastFetched: null,
  searchQuery: '',
  hasSearched: false
}

const musicDataSlice = createSlice({
  name: 'musicData',
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
    
    setFeaturedContent: (state, action) => {
      state.featuredContent = action.payload
      state.lastFetched = new Date().toISOString()
      state.isLoading = false
      state.error = null
    },
    
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
      state.isLoading = false
      state.hasSearched = true
      state.error = null
    },
    
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload
      if (!action.payload) {
        state.hasSearched = false
        state.searchResults = {
          artists: [],
          albums: [],
          tracks: []
        }
      }
    },
    
    setArtistDetails: (state, action) => {
      const { artistId, details } = action.payload
      state.artistDetails[artistId] = {
        ...details,
        fetchedAt: new Date().toISOString()
      }
    },
    
    setAlbumDetails: (state, action) => {
      const { albumId, details } = action.payload
      state.albumDetails[albumId] = {
        ...details,
        fetchedAt: new Date().toISOString()
      }
    },
    
    setPlayableTracks: (state, action) => {
      state.playableTracks = action.payload
      state.isLoading = false
      state.error = null
    },
    
    addPlayableTrack: (state, action) => {
      const track = action.payload
      if (!state.playableTracks.find(t => t.id === track.id)) {
        state.playableTracks.push(track)
      }
    },
    
    // Enhanced Deezer-specific reducers
    setDeezerTopCharts: (state, action) => {
      state.deezerData.topCharts = action.payload
      state.deezerData.lastUpdated = new Date().toISOString()
    },
    
    cacheDeezerSearch: (state, action) => {
      const { query, results } = action.payload
      state.deezerData.searchCache[query] = {
        results,
        cachedAt: new Date().toISOString()
      }
    },
    
    clearSearchCache: (state) => {
      state.deezerData.searchCache = {}
    },
    
    // Enhanced error handling
    setApiError: (state, action) => {
      const { api, error } = action.payload
      state.error = {
        message: error,
        api,
        timestamp: new Date().toISOString()
      }
      state.isLoading = false
    }
  }
})

// ENHANCED ASYNC ACTION CREATORS with RapidAPI Deezer Integration

export const fetchFeaturedContent = (forceRefresh = false) => async (dispatch, getState) => {
  const state = getState()
  const lastFetched = state.musicData.lastFetched
  
  // Check if we have recent data (less than 30 minutes old) and not forcing refresh
  if (!forceRefresh && lastFetched) {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    const lastFetchedDate = new Date(lastFetched)
    if (lastFetchedDate > thirtyMinutesAgo) {
      console.log('Using cached featured content')
      return
    }
  }
  
  dispatch(setLoading(true))
  dispatch(clearError())
  
  try {
    console.log('Fetching fresh featured content with RapidAPI Deezer...')
    const content = await MusicAPIService.getFeaturedContent()
    
    // Validate the content structure
    const validatedContent = {
      topTracks: Array.isArray(content.topTracks) ? content.topTracks : [],
      newReleases: Array.isArray(content.newReleases) ? content.newReleases : [],
      featuredPlaylists: Array.isArray(content.featuredPlaylists) ? content.featuredPlaylists : []
    }
    
    dispatch(setFeaturedContent(validatedContent))
    console.log('Featured content loaded successfully with Deezer data:', validatedContent)
  } catch (error) {
    console.error('Failed to fetch featured content:', error)
    dispatch(setApiError({ 
      api: 'featuredContent', 
      error: 'Failed to load featured content. Please try again.' 
    }))
  }
}

export const searchMusic = (query, type = 'all') => async (dispatch, getState) => {
  if (!query || query.trim().length === 0) {
    dispatch(setSearchQuery(''))
    return
  }
  
  const trimmedQuery = query.trim()
  dispatch(setSearchQuery(trimmedQuery))
  
  // Check cache first (reduced cache time for better freshness)
  const state = getState()
  const cachedResult = state.musicData.deezerData.searchCache[trimmedQuery]
  if (cachedResult) {
    const cacheAge = new Date() - new Date(cachedResult.cachedAt)
    if (cacheAge < 2 * 60 * 1000) { // 2 minutes cache for fresh results
      console.log('Using cached search results for:', trimmedQuery)
      dispatch(setSearchResults(cachedResult.results))
      return
    }
  }
  
  dispatch(setLoading(true))
  dispatch(clearError())
  
  try {
    console.log('Searching with RapidAPI Deezer for:', trimmedQuery, 'type:', type)
    const results = await MusicAPIService.searchMusic(trimmedQuery, type)
    
    // Validate results structure
    const validatedResults = {
      artists: Array.isArray(results.artists) ? results.artists : [],
      albums: Array.isArray(results.albums) ? results.albums : [],
      tracks: Array.isArray(results.tracks) ? results.tracks : []
    }
    
    dispatch(setSearchResults(validatedResults))
    dispatch(cacheDeezerSearch({ query: trimmedQuery, results: validatedResults }))
    console.log('Search results with Deezer data:', validatedResults)
  } catch (error) {
    console.error('Search failed:', error)
    dispatch(setApiError({ 
      api: 'search', 
      error: 'Search failed. Please try again.' 
    }))
  }
}

export const fetchArtistDetails = (artistName, artistId = null) => async (dispatch, getState) => {
  const state = getState()
  const existingDetails = state.musicData.artistDetails[artistName]
  
  // Check if we have recent data (less than 24 hours old)
  if (existingDetails && existingDetails.fetchedAt) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const fetchedDate = new Date(existingDetails.fetchedAt)
    if (fetchedDate > oneDayAgo) {
      console.log('Using cached artist details for:', artistName)
      return
    }
  }
  
  try {
    console.log('Fetching artist details for:', artistName)
    
    // Try RapidAPI Deezer first if we have artistId
    let details = null
    if (artistId) {
      try {
        details = await RapidApiDeezerService.getArtist(artistId)
      } catch (error) {
        console.warn('RapidAPI Deezer artist fetch failed:', error)
      }
    }
    
    // Fallback to other APIs if Deezer fails
    if (!details) {
      // Note: MusicAPIService doesn't have getArtistDetails, so we'll skip this
      console.log('No additional artist APIs available')
    }
    
    if (details) {
      dispatch(setArtistDetails({ artistId: artistName, details }))
      console.log('Artist details loaded:', details)
    }
  } catch (error) {
    console.error('Failed to fetch artist details:', error)
  }
}

export const fetchAlbumDetails = (albumName, artistName, albumId = null) => async (dispatch, getState) => {
  const state = getState()
  const cacheKey = `${artistName}-${albumName}`
  const existingDetails = state.musicData.albumDetails[cacheKey]
  
  // Check cache
  if (existingDetails && existingDetails.fetchedAt) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const fetchedDate = new Date(existingDetails.fetchedAt)
    if (fetchedDate > oneDayAgo) {
      console.log('Using cached album details for:', albumName)
      return
    }
  }
  
  try {
    console.log('Fetching album details for:', albumName, 'by', artistName)
    
    // Try RapidAPI Deezer first if we have albumId
    let details = null
    if (albumId) {
      try {
        details = await RapidApiDeezerService.getAlbum(albumId)
      } catch (error) {
        console.warn('RapidAPI Deezer album fetch failed:', error)
      }
    }
    
    if (details) {
      dispatch(setAlbumDetails({ albumId: cacheKey, details }))
      console.log('Album details loaded:', details)
    }
  } catch (error) {
    console.error('Failed to fetch album details:', error)
  }
}

export const fetchPlayableTracks = (genre = '', limit = 50) => async (dispatch) => {
  dispatch(setLoading(true))
  dispatch(clearError())
  
  try {
    console.log('Fetching playable tracks for genre:', genre || 'all')
    const tracks = await MusicAPIService.getPlayableTracks(genre, limit)
    
    const validatedTracks = Array.isArray(tracks) ? tracks : []
    dispatch(setPlayableTracks(validatedTracks))
    console.log('Playable tracks loaded:', validatedTracks.length, 'tracks')
  } catch (error) {
    console.error('Failed to fetch playable tracks:', error)
    dispatch(setApiError({ 
      api: 'playableTracks', 
      error: 'Failed to load playable tracks.' 
    }))
  }
}

// NEW: Fetch RapidAPI Deezer top charts
export const fetchDeezerTopCharts = () => async (dispatch) => {
  try {
    console.log('Fetching RapidAPI Deezer top charts...')
    const charts = await RapidApiDeezerService.searchTracks(50)
    dispatch(setDeezerTopCharts(charts))
    console.log('RapidAPI Deezer top charts loaded:', charts.length, 'tracks')
  } catch (error) {
    console.error('Failed to fetch RapidAPI Deezer charts:', error)
  }
}

// Action to clear old cache
export const clearOldCache = () => (dispatch, getState) => {
  const state = getState()
  const searchCache = state.musicData.deezerData.searchCache
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000) // Reduced to 1 hour
  
  const cleanedCache = {}
  Object.keys(searchCache).forEach(query => {
    const cachedAt = new Date(searchCache[query].cachedAt)
    if (cachedAt > oneHourAgo) {
      cleanedCache[query] = searchCache[query]
    }
  })
  
  if (Object.keys(cleanedCache).length !== Object.keys(searchCache).length) {
    dispatch(clearSearchCache())
    // Re-add valid cache entries
    Object.keys(cleanedCache).forEach(query => {
      dispatch(cacheDeezerSearch({ query, results: cleanedCache[query].results }))
    })
    console.log('Cleaned old search cache entries')
  }
}

// NEW: Action to refresh Deezer data
export const refreshDeezerData = () => async (dispatch) => {
  try {
    dispatch(setLoading(true))
    
    // Fetch fresh Deezer charts
    await dispatch(fetchDeezerTopCharts())
    
    // Refresh featured content with new Deezer data
    await dispatch(fetchFeaturedContent(true))
    
    console.log('Deezer data refreshed successfully')
  } catch (error) {
    console.error('Failed to refresh Deezer data:', error)
    dispatch(setApiError({ 
      api: 'deezer', 
      error: 'Failed to refresh Deezer data.' 
    }))
  }
}

export const {
  setLoading,
  setError,
  clearError,
  setFeaturedContent,
  setSearchResults,
  setSearchQuery,
  setArtistDetails,
  setAlbumDetails,
  setPlayableTracks,
  addPlayableTrack,
  setDeezerTopCharts,
  cacheDeezerSearch,
  clearSearchCache,
  setApiError
} = musicDataSlice.actions

export default musicDataSlice.reducer

// Enhanced selectors
export const selectFeaturedContent = (state) => state.musicData.featuredContent
export const selectSearchResults = (state) => state.musicData.searchResults
export const selectMusicDataLoading = (state) => state.musicData.isLoading
export const selectMusicDataError = (state) => state.musicData.error
export const selectSearchQuery = (state) => state.musicData.searchQuery
export const selectHasSearched = (state) => state.musicData.hasSearched
export const selectArtistDetails = (state, artistId) => state.musicData.artistDetails[artistId]
export const selectAlbumDetails = (state, albumId) => state.musicData.albumDetails[albumId]
export const selectPlayableTracks = (state) => state.musicData.playableTracks
export const selectDeezerTopCharts = (state) => state.musicData.deezerData.topCharts
export const selectSearchCache = (state) => state.musicData.deezerData.searchCache

// Enhanced computed selectors
export const selectTotalTracksCount = (state) => {
  const { topTracks, newReleases } = state.musicData.featuredContent
  const { tracks } = state.musicData.searchResults
  const deezerCharts = state.musicData.deezerData.topCharts
  return topTracks.length + newReleases.length + tracks.length + deezerCharts.length
}

export const selectIsDataStale = (state) => {
  const lastFetched = state.musicData.lastFetched
  if (!lastFetched) return true
  
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
  return new Date(lastFetched) < thirtyMinutesAgo
}

export const selectHasDeezerData = (state) => {
  return state.musicData.deezerData.topCharts.length > 0
}

export const selectDeezerDataAge = (state) => {
  const lastUpdated = state.musicData.deezerData.lastUpdated
  if (!lastUpdated) return null
  
  const now = new Date()
  const updated = new Date(lastUpdated)
  return Math.floor((now - updated) / (1000 * 60)) // Age in minutes
}
