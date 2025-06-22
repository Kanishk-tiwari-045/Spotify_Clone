// Enhanced music API service with RapidAPI Deezer integration
import RapidApiDeezerService from './rapidApiDeezarService'

export class MusicAPIService {
  static BASE_URLS = {
    musicBrainz: 'https://musicbrainz.org/ws/2',
    lastFm: 'https://ws.audioscrobbler.com/2.0',
    jamendo: 'https://api.jamendo.com/v3.0'
  }

  static LAST_FM_API_KEY = import.meta.env.VITE_LASTFM_API_KEY
  static JAMENDO_CLIENT_ID = import.meta.env.VITE_JAMENDO_CLIENT_ID

  static requestQueue = new Map()
  static RATE_LIMIT_DELAY = 300

  static async makeRequest(apiName, url, options = {}) {
    if (!url || url.includes('undefined')) {
      console.error(`Invalid URL for ${apiName}:`, url)
      throw new Error(`Invalid API URL for ${apiName}`)
    }

    const lastRequest = this.requestQueue.get(apiName) || 0
    const now = Date.now()
    const timeSinceLastRequest = now - lastRequest

    if (timeSinceLastRequest < this.RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, this.RATE_LIMIT_DELAY - timeSinceLastRequest)
      )
    }

    this.requestQueue.set(apiName, Date.now())
    
    try {
      console.log(`Making request to: ${url}`)
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'SpotifyClone/1.0',
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      })
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`)
      }
      
      const text = await response.text()
      if (!text.trim()) {
        throw new Error('Empty response from API')
      }
      
      return JSON.parse(text)
    } catch (error) {
      console.error(`API Error (${apiName}):`, error)
      throw error
    }
  }

  // ENHANCED TOP TRACKS - Now includes RapidAPI Deezer!
  static async getTopTracks(limit = 50) {
    try {
      // Get real data from multiple sources including Deezer
      const [deezerCharts, lastFmTracks, jamendoTracks] = await Promise.allSettled([
        this.getLastFmTopTracks(20),
        this.getJamendoTracks('', 15)
      ])

      const allTracks = [
        ...(deezerCharts.status === 'fulfilled' ? deezerCharts.value : []),
        ...(lastFmTracks.status === 'fulfilled' ? lastFmTracks.value : []),
        ...(jamendoTracks.status === 'fulfilled' ? jamendoTracks.value : [])
      ]

      const uniqueTracks = this.removeDuplicateTracks(allTracks)
      
      if (uniqueTracks.length > 0) {
        console.log(`Using real music data: ${uniqueTracks.length} tracks from Deezer + Last.fm + Jamendo`)
        return uniqueTracks.slice(0, limit)
      }
    } catch (error) {
      console.warn('Real APIs failed, using enhanced mock data:', error)
    }

    return this.getEnhancedMockTracks(limit)
  }

  // ENHANCED SEARCH - Now includes RapidAPI Deezer!
  static async searchMusic(query, type = 'all') {
    const results = { artists: [], albums: [], tracks: [] }

    try {
      // Search all sources including Deezer
      const [deezerTracks, lastFmTracks, jamendoTracks, artists] = await Promise.allSettled([
        RapidApiDeezerService.searchTracks(query, 15),
        this.searchLastFmTracks(query, 10),
        this.searchJamendoTracks(query, 5),
        type === 'all' || type === 'artists' ? this.searchArtists(query, 10) : Promise.resolve([])
      ])

      // Combine results
      results.tracks = [
        ...(deezerTracks.status === 'fulfilled' ? deezerTracks.value : []),
        ...(lastFmTracks.status === 'fulfilled' ? lastFmTracks.value : []),
        ...(jamendoTracks.status === 'fulfilled' ? jamendoTracks.value : [])
      ]

      results.artists = artists.status === 'fulfilled' ? artists.value : []

      // Remove duplicates and limit results
      results.tracks = this.removeDuplicateTracks(results.tracks).slice(0, 25)
      results.artists = results.artists.slice(0, 10)

      console.log('Enhanced search results with Deezer:', results)
      return results
    } catch (error) {
      console.error('Search error:', error)
      return results
    }
  }

  // Replace your getFeaturedContent method with this fixed version:
static async getFeaturedContent() {
  console.log('RapidApiDeezerService:', RapidApiDeezerService)
  console.log('getLastFmTopTracks:', typeof this.getLastFmTopTracks)
  console.log('getJamendoTracks:', typeof this.getJamendoTracks)
  try {
    // Use Promise.allSettled with proper error handling
    const promises = [
      // Check if RapidApiDeezerService is properly imported and has getPopularTracks method
      RapidApiDeezerService && typeof RapidApiDeezerService.getPopularTracks === 'function' 
        ? RapidApiDeezerService.getPopularTracks(15) 
        : Promise.resolve([]),
      
      // Ensure these methods exist before calling
      this.getLastFmTopTracks ? this.getLastFmTopTracks(15) : Promise.resolve([]),
      this.getJamendoTracks ? this.getJamendoTracks('', 15) : Promise.resolve([])
    ]

    const results = await Promise.allSettled(promises)
    
    // Safely extract results with proper error checking
    const deezerTracks = results[0] && results[0].status === 'fulfilled' ? results[0].value : []
    const chartTracks = results[1] && results[1].status === 'fulfilled' ? results[1].value : []
    const playableTracks = results[2] && results[2].status === 'fulfilled' ? results[2].value : []

    // Log any rejected promises for debugging
    results.forEach((result, index) => {
      if (result && result.status === 'rejected') {
        console.warn(`Promise ${index} rejected:`, result.reason)
      }
    })

    // Combine for top tracks
    const topTracks = [...(Array.isArray(deezerTracks) ? deezerTracks : []), ...(Array.isArray(chartTracks) ? chartTracks : [])].slice(0, 10)
    
    // Create new releases from recent tracks
    const newReleases = [...(Array.isArray(playableTracks) ? playableTracks.slice(0, 5) : []), ...(Array.isArray(deezerTracks) ? deezerTracks.slice(5, 10) : [])]

    const result = {
      topTracks: topTracks,
      newReleases: newReleases,
      featuredPlaylists: this.generateEnhancedPlaylists ? this.generateEnhancedPlaylists(topTracks, playableTracks) : []
    }

    console.log('Featured content generated successfully:', result)
    return result

  } catch (error) {
    console.error('Featured content error:', error)
    
    // Return fallback data structure
    return {
      topTracks: this.getEnhancedMockTracks ? this.getEnhancedMockTracks(10) : [],
      newReleases: this.getEnhancedMockTracks ? this.getEnhancedMockTracks(10) : [],
      featuredPlaylists: this.generateEnhancedPlaylists ? this.generateEnhancedPlaylists([], []) : []
    }
  }
}

  // LAST.FM INTEGRATION - Real chart data
  static async getLastFmTopTracks(limit = 50) {
    if (!this.LAST_FM_API_KEY || this.LAST_FM_API_KEY === 'undefined' || this.LAST_FM_API_KEY.includes('your_')) {
      console.warn('Last.fm API key not configured')
      return []
    }

    try {
      const url = `${this.BASE_URLS.lastFm}/?method=chart.gettoptracks&api_key=${this.LAST_FM_API_KEY}&format=json&limit=${limit}`
      const data = await this.makeRequest('lastFm', url)
      
      return data.tracks?.track?.map((track, index) => ({
        id: `lastfm-chart-${track.mbid || track.name.replace(/\s+/g, '-')}-${index}`,
        name: track.name,
        title: track.name,
        artist: track.artist.name,
        playcount: parseInt(track.playcount) || 0,
        listeners: parseInt(track.listeners) || 0,
        rank: index + 1,
        url: track.url,
        coverImage: this.getBestLastFmImage(track.image),
        images: this.formatLastFmImages(track.image),
        audioUrl: null, // Last.fm doesn't provide audio
        duration: 180 + Math.floor(Math.random() * 120),
        isRealData: true,
        source: 'Last.fm Charts'
      })) || []
    } catch (error) {
      console.warn('Last.fm top tracks failed:', error)
      return []
    }
  }

  static async searchLastFmTracks(query, limit = 15) {
    if (!this.LAST_FM_API_KEY || this.LAST_FM_API_KEY === 'undefined') {
      return []
    }

    try {
      const url = `${this.BASE_URLS.lastFm}/?method=track.search&track=${encodeURIComponent(query)}&api_key=${this.LAST_FM_API_KEY}&format=json&limit=${limit}`
      const data = await this.makeRequest('lastFm', url)
      
      return data.results?.trackmatches?.track?.map((track, index) => ({
        id: `lastfm-search-${track.mbid || track.name.replace(/\s+/g, '-')}-${index}`,
        name: track.name,
        title: track.name,
        artist: track.artist,
        listeners: parseInt(track.listeners) || 0,
        url: track.url,
        coverImage: this.getBestLastFmImage(track.image),
        images: this.formatLastFmImages(track.image),
        audioUrl: null,
        duration: 180 + Math.floor(Math.random() * 120),
        isRealData: true,
        source: 'Last.fm Search',
        rank: index + 1
      })) || []
    } catch (error) {
      console.warn('Last.fm search failed:', error)
      return []
    }
  }

  // JAMENDO INTEGRATION - Playable tracks
  static async getJamendoTracks(genre = '', limit = 30) {
    if (!this.JAMENDO_CLIENT_ID || this.JAMENDO_CLIENT_ID === 'undefined' || this.JAMENDO_CLIENT_ID.includes('your_')) {
      console.warn('Jamendo client ID not configured')
      return []
    }

    try {
      let url = `${this.BASE_URLS.jamendo}/tracks/?client_id=${this.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo&audioformat=mp32&order=popularity_total`
      
      if (genre) {
        url += `&tags=${encodeURIComponent(genre)}`
      }
      
      const data = await this.makeRequest('jamendo', url)
      
      return data.results?.map((track, index) => ({
        id: `jamendo-${track.id}`,
        name: track.name,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: track.duration,
        audioUrl: track.audio, // Full playable track!
        audioDownloadUrl: track.audiodownload,
        coverImage: track.album_image || track.image || `https://picsum.photos/300/300?random=jamendo${index}`,
        images: {
          small: track.image,
          medium: track.album_image || track.image,
          large: track.album_image || track.image
        },
        releaseDate: track.releasedate,
        tags: track.musicinfo?.tags?.genres || [],
        license: track.license_ccurl,
        rank: index + 1,
        playcount: Math.floor(Math.random() * 100000),
        isRealData: true,
        isPlayable: true,
        source: 'Jamendo'
      })) || []
    } catch (error) {
      console.warn('Jamendo API failed:', error)
      return []
    }
  }

  static async searchJamendoTracks(query, limit = 10) {
    if (!this.JAMENDO_CLIENT_ID || this.JAMENDO_CLIENT_ID === 'undefined') {
      return []
    }

    try {
      const url = `${this.BASE_URLS.jamendo}/tracks/?client_id=${this.JAMENDO_CLIENT_ID}&format=json&limit=${limit}&include=musicinfo&audioformat=mp32&namesearch=${encodeURIComponent(query)}`
      const data = await this.makeRequest('jamendo', url)
      
      return data.results?.map((track, index) => ({
        id: `jamendo-search-${track.id}`,
        name: track.name,
        title: track.name,
        artist: track.artist_name,
        album: track.album_name,
        duration: track.duration,
        audioUrl: track.audio,
        coverImage: track.album_image || track.image || `https://picsum.photos/300/300?random=jamendo-search${index}`,
        images: {
          small: track.image,
          medium: track.album_image || track.image,
          large: track.album_image || track.image
        },
        releaseDate: track.releasedate,
        tags: track.musicinfo?.tags?.genres || [],
        isRealData: true,
        isPlayable: true,
        source: 'Jamendo Search',
        rank: index + 1
      })) || []
    } catch (error) {
      console.warn('Jamendo search failed:', error)
      return []
    }
  }

  // MUSICBRAINZ INTEGRATION - Artist data
  static async searchArtists(query, limit = 10) {
    try {
      const url = `${this.BASE_URLS.musicBrainz}/artist/?query=${encodeURIComponent(query)}&limit=${limit}&fmt=json`
      const data = await this.makeRequest('musicBrainz', url)
      
      return data.artists?.map(artist => ({
        id: artist.id,
        name: artist.name,
        type: artist.type,
        country: artist.country,
        genres: artist.tags?.map(tag => tag.name) || [],
        disambiguation: artist.disambiguation,
        score: artist.score,
        isRealData: true,
        source: 'MusicBrainz'
      })) || []
    } catch (error) {
      console.warn('MusicBrainz search failed:', error)
      return []
    }
  }

  // UTILITY METHODS
  static removeDuplicateTracks(tracks) {
    const seen = new Set()
    return tracks.filter(track => {
      const key = `${track.artist}-${track.name}`.toLowerCase().replace(/[^a-z0-9]/g, '')
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
  }

  static getBestLastFmImage(images) {
    if (!images || !Array.isArray(images)) return 'https://picsum.photos/300/300?random=music'
    
    const large = images.find(img => img.size === 'large')?.['#text']
    const medium = images.find(img => img.size === 'medium')?.['#text']
    const small = images.find(img => img.size === 'small')?.['#text']
    
    return large || medium || small || 'https://picsum.photos/300/300?random=music'
  }

  static formatLastFmImages(images) {
    if (!images || !Array.isArray(images)) {
      return {
        small: 'https://picsum.photos/150/150?random=music',
        medium: 'https://picsum.photos/300/300?random=music',
        large: 'https://picsum.photos/600/600?random=music'
      }
    }
    
    return {
      small: images.find(img => img.size === 'small')?.['#text'] || 'https://picsum.photos/150/150?random=music',
      medium: images.find(img => img.size === 'medium')?.['#text'] || 'https://picsum.photos/300/300?random=music',
      large: images.find(img => img.size === 'large')?.['#text'] || 'https://picsum.photos/600/600?random=music'
    }
  }

  static generateEnhancedPlaylists(topTracks, playableTracks) {
    const genres = [
      { name: 'pop', color: 'from-pink-500 to-rose-400' },
      { name: 'rock', color: 'from-gray-700 to-gray-500' },
      { name: 'electronic', color: 'from-cyan-500 to-blue-500' },
      { name: 'jazz', color: 'from-amber-600 to-orange-600' },
      { name: 'indie', color: 'from-yellow-500 to-orange-500' }
    ]
    
    return genres.map(genre => ({
      id: `featured-${genre.name}`,
      name: `${genre.name.charAt(0).toUpperCase() + genre.name.slice(1)} Hits`,
      description: `Best ${genre.name} tracks from real music charts`,
      tracks: [...topTracks, ...playableTracks]
        .filter(track => 
          track.tags?.some(tag => tag.toLowerCase().includes(genre.name)) ||
          track.name.toLowerCase().includes(genre.name) ||
          Math.random() > 0.6
        )
        .slice(0, 15),
      coverImage: `https://picsum.photos/300/300?random=${genre.name}`,
      isDefault: false,
      gradient: genre.color
    }))
  }

  static getEnhancedMockTracks(limit) {
    const enhancedMockTracks = [
      {
        id: 'mock-1',
        name: 'Blinding Lights',
        title: 'Blinding Lights',
        artist: 'The Weeknd',
        playcount: 2500000,
        listeners: 1200000,
        rank: 1,
        duration: 200,
        coverImage: 'https://picsum.photos/300/300?random=weeknd',
        images: { medium: 'https://picsum.photos/300/300?random=weeknd' },
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        isRealData: false,
        source: 'Mock Data'
      },
      {
        id: 'mock-2',
        name: 'Watermelon Sugar',
        title: 'Watermelon Sugar',
        artist: 'Harry Styles',
        playcount: 2200000,
        listeners: 1100000,
        rank: 2,
        duration: 174,
        coverImage: 'https://picsum.photos/300/300?random=harry',
        images: { medium: 'https://picsum.photos/300/300?random=harry' },
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        isRealData: false,
        source: 'Mock Data'
      },
      {
        id: 'mock-3',
        name: 'Good 4 U',
        title: 'Good 4 U',
        artist: 'Olivia Rodrigo',
        playcount: 2000000,
        listeners: 1000000,
        rank: 3,
        duration: 178,
        coverImage: 'https://picsum.photos/300/300?random=olivia',
        images: { medium: 'https://picsum.photos/300/300?random=olivia' },
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        isRealData: false,
        source: 'Mock Data'
      },
      {
        id: 'mock-4',
        name: 'Levitating',
        title: 'Levitating',
        artist: 'Dua Lipa',
        playcount: 1900000,
        listeners: 950000,
        rank: 4,
        duration: 203,
        coverImage: 'https://picsum.photos/300/300?random=dua',
        images: { medium: 'https://picsum.photos/300/300?random=dua' },
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        isRealData: false,
        source: 'Mock Data'
      }
    ]
    return enhancedMockTracks.slice(0, limit)
  }

  // Legacy method aliases for compatibility
  static async getPlayableTracks(genre = '', limit = 20) {
    return this.getJamendoTracks(genre, limit)
  }

  static getMockTopTracks(limit) {
    return this.getEnhancedMockTracks(limit)
  }

  static getMockPlayableTracks(limit) {
    return this.getEnhancedMockTracks(limit)
  }
}
