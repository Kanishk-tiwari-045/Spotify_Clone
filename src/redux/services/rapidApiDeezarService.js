class RapidApiDeezerService {
  constructor() {
    this.baseURL = 'https://deezerdevs-deezer.p.rapidapi.com'
    this.apiKey = import.meta.env.VITE_RAPIDAPI_KEY || '5389ccde0bmshe2d75f6589a7b8cp14764bjsn2f728f9e89d7'
    this.apiHost = import.meta.env.VITE_RAPIDAPI_HOST || 'deezerdevs-deezer.p.rapidapi.com'
    this.rateLimitDelay = 200
    this.lastRequestTime = 0
  }

  async makeRequest(endpoint, options = {}) {
    // Rate limiting
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      )
    }
    this.lastRequestTime = Date.now()

    try {
      const url = `${this.baseURL}${endpoint}`
      console.log(`RapidAPI Deezer request: ${url}`)
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': this.apiHost,
          'Accept': 'application/json',
          ...options.headers
        },
        ...options
      })

      if (!response.ok) {
        throw new Error(`RapidAPI Deezer error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('RapidAPI Deezer request failed:', error)
      throw error
    }
  }

  // Search tracks
  async searchTracks(query, limit = 25) {
    try {
      const data = await this.makeRequest(`/search?q=${encodeURIComponent(query)}`)
      
      return data.data?.slice(0, limit).map((track, index) => ({
        id: track.id.toString(),
        name: track.title,
        title: track.title,
        artist: track.artist.name,
        artistId: track.artist.id,
        album: track.album.title,
        albumId: track.album.id,
        duration: track.duration,
        rank: track.rank || index + 1,
        preview: track.preview,
        explicit: track.explicit_lyrics,
        images: {
          small: track.album.cover_small,
          medium: track.album.cover_medium,
          large: track.album.cover_xl
        },
        coverImage: track.album.cover_medium,
        audioUrl: track.preview,
        isRealData: true,
        isPreview: true,
        source: 'Deezer Search'
      })) || []
    } catch (error) {
      console.warn('Failed to search Deezer tracks:', error)
      return []
    }
  }

  // Get artist info
  async getArtist(artistId) {
    try {
      const data = await this.makeRequest(`/artist/${artistId}`)
      
      return {
        id: data.id.toString(),
        name: data.name,
        fans: data.nb_fan,
        albums: data.nb_album,
        image: data.picture_xl,
        images: {
          small: data.picture_small,
          medium: data.picture_medium,
          large: data.picture_xl
        },
        isRealData: true,
        source: 'Deezer'
      }
    } catch (error) {
      console.warn('Failed to fetch Deezer artist:', error)
      return null
    }
  }

  // Get album info
  async getAlbum(albumId) {
    try {
      const data = await this.makeRequest(`/album/${albumId}`)
      
      return {
        id: data.id.toString(),
        title: data.title,
        artist: data.artist.name,
        artistId: data.artist.id,
        releaseDate: data.release_date,
        duration: data.duration,
        tracks: data.tracks?.data?.map(track => ({
          id: track.id.toString(),
          title: track.title,
          duration: track.duration,
          preview: track.preview,
          rank: track.track_position
        })) || [],
        images: {
          small: data.cover_small,
          medium: data.cover_medium,
          large: data.cover_xl
        },
        coverImage: data.cover_medium,
        genres: data.genres?.data?.map(genre => genre.name) || [],
        fans: data.fans,
        isRealData: true,
        source: 'Deezer'
      }
    } catch (error) {
      console.warn('Failed to fetch Deezer album:', error)
      return null
    }
  }
}

export default new RapidApiDeezerService()
