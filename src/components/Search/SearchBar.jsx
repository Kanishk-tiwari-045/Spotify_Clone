import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon, ClockIcon, FireIcon } from '@heroicons/react/24/outline'
import {
  setSearchQuery,
  addToRecentSearches,
  selectSearchQuery,
  selectRecentSearches
} from '../../redux/features/searchSlice'
import { searchMusic } from '../../redux/features/musicDataSlice'
import toast from 'react-hot-toast'

const SearchBar = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  
  const query = useSelector(selectSearchQuery)
  const recentSearches = useSelector(selectRecentSearches)
  const isSearching = useSelector(state => state.musicData.isLoading)
  
  const [inputValue, setInputValue] = useState(query)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [debounceTimer, setDebounceTimer] = useState(null)
  const [isFocused, setIsFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const containerRef = useRef(null)
  const suggestionsRef = useRef([])

  // Focus input when component mounts
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Debounced search with enhanced logic
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (inputValue.trim() && inputValue.length > 2) {
      const timer = setTimeout(() => {
        performSearch(inputValue.trim())
      }, 300) // Faster response
      setDebounceTimer(timer)
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [inputValue])

  const performSearch = async (searchTerm) => {
    if (!searchTerm) return

    dispatch(setSearchQuery(searchTerm))
    dispatch(searchMusic(searchTerm))
    dispatch(addToRecentSearches(searchTerm))
    toast.success(`Searching for "${searchTerm}"`, { icon: '🔍' })
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputValue(value)
    setSelectedIndex(-1)
    
    if (value.length > 0) {
      setShowSuggestions(true)
    } else {
      setShowSuggestions(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (inputValue.trim()) {
      performSearch(inputValue.trim())
      setShowSuggestions(false)
      setSelectedIndex(-1)
      navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`)
    }
  }

  const handleRecentSearchClick = (recentSearch) => {
    setInputValue(recentSearch)
    dispatch(setSearchQuery(recentSearch))
    performSearch(recentSearch)
    setShowSuggestions(false)
    setSelectedIndex(-1)
    navigate(`/search?q=${encodeURIComponent(recentSearch)}`)
  }

  const handleClearInput = () => {
    setInputValue('')
    dispatch(setSearchQuery(''))
    setShowSuggestions(false)
    setSelectedIndex(-1)
    if (inputRef.current) {
      inputRef.current.focus()
    }
    toast.success('Search cleared', { icon: '🧹' })
  }

  const handleFocus = () => {
    setIsFocused(true)
    if (recentSearches.length > 0 || !inputValue) {
      setShowSuggestions(true)
    }
  }

  const handleBlur = () => {
    setIsFocused(false)
    // Delay hiding suggestions to allow clicks
    setTimeout(() => {
      if (!containerRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }, 150)
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions) return

    const allSuggestions = [
      ...recentSearches.slice(0, 5),
      ...(inputValue ? [] : trendingSearches.slice(0, 6))
    ]

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        )
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && allSuggestions[selectedIndex]) {
          handleRecentSearchClick(allSuggestions[selectedIndex])
        } else if (inputValue.trim()) {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        if (inputRef.current) {
          inputRef.current.blur()
        }
        break
    }
  }

  const trendingSearches = [
    'Pop hits', 'Rock classics', 'Hip hop', 'Electronic', 
    'Indie', 'Jazz', 'Classical', 'Country'
  ]

  const allSuggestions = [
    ...recentSearches.slice(0, 5),
    ...(inputValue ? [] : trendingSearches.slice(0, 6))
  ]

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative group">
          {/* Background glow effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-full opacity-0 transition-opacity duration-300 ${
            isFocused ? 'opacity-100' : ''
          }`}></div>
          
          <div className="relative">
            <MagnifyingGlassIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
              isFocused ? 'text-spotify-green' : 'text-gray-400'
            }`} />
            
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to listen to?"
              className={`w-full bg-white text-black rounded-full pl-12 pr-12 py-3 transition-all duration-300 border-2 ${
                isFocused 
                  ? 'border-spotify-green shadow-lg shadow-spotify-green/25' 
                  : 'border-transparent hover:border-spotify-green/30'
              } focus:outline-none placeholder-gray-500`}
              autoComplete="off"
            />
            
            {/* Clear button */}
            {inputValue && (
              <button
                type="button"
                onClick={handleClearInput}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-all duration-300 p-1 rounded-full hover:bg-gray-200"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
            
            {/* Loading indicator */}
            {isSearching && (
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-spotify-green border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </div>
      </form>

      {/* Enhanced Search Suggestions */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-spotify-light-gray rounded-2xl shadow-2xl border border-spotify-green/30 max-h-96 overflow-hidden z-50 animate-slideIn backdrop-blur-xl">
          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="py-3">
              <div className="px-4 py-2 flex items-center space-x-2">
                <ClockIcon className="w-4 h-4 text-spotify-green" />
                <span className="text-xs text-spotify-text-gray font-medium uppercase tracking-wide">
                  Recent searches
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {recentSearches.slice(0, 5).map((recentSearch, index) => (
                  <button
                    key={index}
                    ref={el => suggestionsRef.current[index] = el}
                    onClick={() => handleRecentSearchClick(recentSearch)}
                    className={`w-full px-4 py-3 hover:bg-spotify-green/20 transition-all duration-300 flex items-center space-x-3 text-left group ${
                      selectedIndex === index ? 'bg-spotify-green/20' : ''
                    }`}
                  >
                    <div className="w-8 h-8 bg-spotify-green/20 rounded-full flex items-center justify-center group-hover:bg-spotify-green/30 transition-colors">
                      <ClockIcon className="w-4 h-4 text-spotify-green" />
                    </div>
                    <span className="text-white text-sm truncate group-hover:text-spotify-green transition-colors">
                      {recentSearch}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Trending Searches */}
          {!inputValue && (
            <div className="py-3">
              {recentSearches.length > 0 && (
                <hr className="border-spotify-green/20 mx-4 mb-3" />
              )}
              <div className="px-4 py-2 flex items-center space-x-2">
                <FireIcon className="w-4 h-4 text-spotify-green" />
                <span className="text-xs text-spotify-text-gray font-medium uppercase tracking-wide">
                  Try searching for
                </span>
              </div>
              <div className="max-h-48 overflow-y-auto">
                {trendingSearches.slice(0, 6).map((trending, index) => {
                  const adjustedIndex = recentSearches.length + index
                  return (
                    <button
                      key={index}
                      ref={el => suggestionsRef.current[adjustedIndex] = el}
                      onClick={() => handleRecentSearchClick(trending)}
                      className={`w-full px-4 py-3 hover:bg-spotify-green/20 transition-all duration-300 flex items-center space-x-3 text-left group ${
                        selectedIndex === adjustedIndex ? 'bg-spotify-green/20' : ''
                      }`}
                    >
                      <div className="w-8 h-8 bg-spotify-green/20 rounded-full flex items-center justify-center group-hover:bg-spotify-green/30 transition-colors">
                        <FireIcon className="w-4 h-4 text-spotify-green" />
                      </div>
                      <span className="text-white text-sm group-hover:text-spotify-green transition-colors">
                        {trending}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Empty state */}
          {recentSearches.length === 0 && inputValue && (
            <div className="py-8 text-center">
              <MagnifyingGlassIcon className="w-12 h-12 text-spotify-text-gray mx-auto mb-3" />
              <p className="text-spotify-text-gray text-sm">
                Start typing to search for music
              </p>
            </div>
          )}
        </div>
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
    </div>
  )
}

export default SearchBar
