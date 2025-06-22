import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  query: '',
  searchResults: {
    songs: [],
    artists: [],
    albums: [],
    playlists: [],
  },
  recentSearches: [],
  searchHistory: [],
  isSearching: false,
  searchFilters: {
    type: 'all', // 'all', 'songs', 'artists', 'albums', 'playlists'
    genre: 'all',
    duration: 'all', // 'all', 'short', 'medium', 'long'
    year: 'all',
  },
  suggestions: [],
  trendingSearches: [
    'Pop hits',
    'Rock classics',
    'Hip hop',
    'Electronic',
    'Indie',
    'Jazz',
    'Classical',
    'Country'
  ],
  error: null,
  hasSearched: false,
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.query = action.payload
      if (action.payload === '') {
        state.hasSearched = false
        state.searchResults = {
          songs: [],
          artists: [],
          albums: [],
          playlists: [],
        }
      }
    },
    
    setSearchResults: (state, action) => {
      state.searchResults = action.payload
      state.isSearching = false
      state.hasSearched = true
      state.error = null
    },
    
    setIsSearching: (state, action) => {
      state.isSearching = action.payload
    },
    
    addToRecentSearches: (state, action) => {
      const query = action.payload
      if (query && query.trim()) {
        state.recentSearches = [
          query,
          ...state.recentSearches.filter(item => item !== query)
        ].slice(0, 10) // Keep only last 10 searches
      }
    },
    
    removeFromRecentSearches: (state, action) => {
      state.recentSearches = state.recentSearches.filter(
        item => item !== action.payload
      )
    },
    
    clearRecentSearches: (state) => {
      state.recentSearches = []
    },
    
    addToSearchHistory: (state, action) => {
      const searchEntry = {
        query: action.payload.query,
        timestamp: new Date().toISOString(),
        resultsCount: action.payload.resultsCount || 0,
      }
      
      state.searchHistory = [
        searchEntry,
        ...state.searchHistory.filter(item => item.query !== searchEntry.query)
      ].slice(0, 50) // Keep last 50 search entries
    },
    
    clearSearchHistory: (state) => {
      state.searchHistory = []
    },
    
    setSearchFilter: (state, action) => {
      const { filterType, value } = action.payload
      state.searchFilters[filterType] = value
    },
    
    resetSearchFilters: (state) => {
      state.searchFilters = {
        type: 'all',
        genre: 'all',
        duration: 'all',
        year: 'all',
      }
    },
    
    setSuggestions: (state, action) => {
      state.suggestions = action.payload
    },
    
    clearSuggestions: (state) => {
      state.suggestions = []
    },
    
    updateTrendingSearches: (state, action) => {
      state.trendingSearches = action.payload
    },
    
    setSearchError: (state, action) => {
      state.error = action.payload
      state.isSearching = false
    },
    
    clearSearchError: (state) => {
      state.error = null
    },
    
    clearSearchResults: (state) => {
      state.searchResults = {
        songs: [],
        artists: [],
        albums: [],
        playlists: [],
      }
      state.hasSearched = false
      state.query = ''
    },
    
    filterSearchResults: (state, action) => {
      const { type, results } = action.payload
      if (state.searchResults[type]) {
        state.searchResults[type] = results
      }
    },
    
    sortSearchResults: (state, action) => {
      const { type, sortBy } = action.payload
      
      if (state.searchResults[type]) {
        const results = [...state.searchResults[type]]
        
        switch (sortBy) {
          case 'relevance':
            // Keep original order (already sorted by relevance)
            break
          case 'name':
            results.sort((a, b) => a.name.localeCompare(b.name))
            break
          case 'artist':
            results.sort((a, b) => (a.artist || '').localeCompare(b.artist || ''))
            break
          case 'duration':
            results.sort((a, b) => (a.duration || 0) - (b.duration || 0))
            break
          case 'year':
            results.sort((a, b) => (b.year || 0) - (a.year || 0))
            break
          default:
            break
        }
        
        state.searchResults[type] = results
      }
    },
    
    toggleSearchResultFavorite: (state, action) => {
      const { type, id } = action.payload
      
      if (state.searchResults[type]) {
        const item = state.searchResults[type].find(item => item.id === id)
        if (item) {
          item.isFavorite = !item.isFavorite
        }
      }
    },
  },
})

export const {
  setSearchQuery,
  setSearchResults,
  setIsSearching,
  addToRecentSearches,
  removeFromRecentSearches,
  clearRecentSearches,
  addToSearchHistory,
  clearSearchHistory,
  setSearchFilter,
  resetSearchFilters,
  setSuggestions,
  clearSuggestions,
  updateTrendingSearches,
  setSearchError,
  clearSearchError,
  clearSearchResults,
  filterSearchResults,
  sortSearchResults,
  toggleSearchResultFavorite,
} = searchSlice.actions

export default searchSlice.reducer

// Enhanced Selectors
export const selectSearchQuery = (state) => state.search.query
export const selectSearchResults = (state) => state.search.searchResults
export const selectIsSearching = (state) => state.search.isSearching
export const selectRecentSearches = (state) => state.search.recentSearches
export const selectSearchFilters = (state) => state.search.searchFilters
export const selectSuggestions = (state) => state.search.suggestions
export const selectTrendingSearches = (state) => state.search.trendingSearches
export const selectHasSearched = (state) => state.search.hasSearched
export const selectSearchError = (state) => state.search.error

// Complex selectors
export const selectFilteredResults = (state) => {
  const { searchResults, searchFilters } = state.search
  
  if (searchFilters.type === 'all') {
    return searchResults
  }
  
  return {
    [searchFilters.type]: searchResults[searchFilters.type] || []
  }
}

export const selectTotalResultsCount = (state) => {
  const results = state.search.searchResults
  return Object.values(results).reduce((total, arr) => total + arr.length, 0)
}
