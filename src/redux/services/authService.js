// Simple user authentication service with localStorage persistence
export class AuthService {
  static USER_KEY = 'spotify_clone_user'
  static USERS_KEY = 'spotify_clone_users'
  static PLAYLISTS_KEY = 'spotify_clone_playlists_'

  static generateCodename() {
    const adjectives = ['Musical', 'Sonic', 'Rhythmic', 'Melodic', 'Harmonic', 'Acoustic', 'Digital', 'Cosmic', 'Electric', 'Vibrant']
    const nouns = ['Beat', 'Wave', 'Pulse', 'Echo', 'Vibe', 'Soul', 'Flow', 'Tune', 'Mix', 'Drop']
    const numbers = Math.floor(Math.random() * 999) + 1
    
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    
    return `${adjective}${noun}${numbers}`
  }

  static signup(userData) {
    const users = this.getUsers()
    const codename = this.generateCodename()
    
    // Enhanced validation for signup with email
    const name = userData.name?.trim()
    const email = userData.email?.trim()
    
    if (!name || name.length < 2) {
      throw new Error('Name must be at least 2 characters long.')
    }
    
    // Check if name already exists
    if (users.find(user => user.name.toLowerCase() === name.toLowerCase())) {
      throw new Error('Name already exists. Please choose a different name.')
    }
    
    // Check email if provided
    if (email && users.find(user => user.email?.toLowerCase() === email.toLowerCase())) {
      throw new Error('Email already exists. Please use a different email.')
    }

    const newUser = {
      id: Date.now().toString(),
      name: name,
      email: email || null,
      codename,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        volume: 0.7,
        theme: 'dark',
        autoplay: true
      },
      musicData: {
        likedSongs: [],
        playlists: [],
        recentlyPlayed: [],
        followedArtists: [],
        savedAlbums: []
      }
    }

    users.push(newUser)
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
    localStorage.setItem(this.USER_KEY, JSON.stringify(newUser))
    
    // Initialize user's playlist storage
    this.initializeUserPlaylists(newUser.id)
    
    return { user: newUser, codename }
  }

  static login(credentials) {
    const users = this.getUsers()
    const { name, email, codename } = credentials
    
    let user = null
    
    // Support login with name+codename or email+codename
    if (name && codename) {
      user = users.find(u => 
        u.name.toLowerCase() === name.toLowerCase() && 
        u.codename === codename
      )
    } else if (email && codename) {
      user = users.find(u => 
        u.email?.toLowerCase() === email.toLowerCase() && 
        u.codename === codename
      )
    }

    if (!user) {
      throw new Error('Invalid credentials. Please check your name/email and codename.')
    }

    // Update last login
    user.lastLogin = new Date().toISOString()
    this.updateUser(user)
    localStorage.setItem(this.USER_KEY, JSON.stringify(user))
    
    return user
  }

  static logout() {
    localStorage.removeItem(this.USER_KEY)
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem(this.USER_KEY)
    return userStr ? JSON.parse(userStr) : null
  }

  static updateUser(userData) {
    const users = this.getUsers()
    const userIndex = users.findIndex(u => u.id === userData.id)
    
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...userData }
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users))
      localStorage.setItem(this.USER_KEY, JSON.stringify(users[userIndex]))
    }
  }

  static getUsers() {
    const usersStr = localStorage.getItem(this.USERS_KEY)
    return usersStr ? JSON.parse(usersStr) : []
  }

  static isAuthenticated() {
    return this.getCurrentUser() !== null
  }

  // NEW: Playlist persistence methods
  static initializeUserPlaylists(userId) {
    const playlistKey = `${this.PLAYLISTS_KEY}${userId}`
    
    // Check if user already has playlists
    const existingPlaylists = localStorage.getItem(playlistKey)
    if (!existingPlaylists) {
      // Create default "Liked Songs" playlist
      const defaultPlaylists = [
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
          userId: userId
        }
      ]
      
      localStorage.setItem(playlistKey, JSON.stringify(defaultPlaylists))
    }
  }

  static getUserPlaylists(userId) {
    try {
      const playlistKey = `${this.PLAYLISTS_KEY}${userId}`
      const playlistsStr = localStorage.getItem(playlistKey)
      return playlistsStr ? JSON.parse(playlistsStr) : []
    } catch (error) {
      console.error('Error loading user playlists:', error)
      return []
    }
  }

  static saveUserPlaylists(userId, playlists) {
    try {
      const playlistKey = `${this.PLAYLISTS_KEY}${userId}`
      localStorage.setItem(playlistKey, JSON.stringify(playlists))
    } catch (error) {
      console.error('Error saving user playlists:', error)
    }
  }

  static clearUserPlaylists(userId) {
    try {
      const playlistKey = `${this.PLAYLISTS_KEY}${userId}`
      localStorage.removeItem(playlistKey)
    } catch (error) {
      console.error('Error clearing user playlists:', error)
    }
  }

  // NEW: Enhanced logout with playlist cleanup option
  static logoutWithCleanup(clearPlaylists = false) {
    const currentUser = this.getCurrentUser()
    
    if (clearPlaylists && currentUser) {
      this.clearUserPlaylists(currentUser.id)
    }
    
    this.logout()
  }
}
