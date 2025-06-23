import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  PlayIcon,
  PlusIcon,
  HeartIcon,
  EllipsisHorizontalIcon,
  MusicalNoteIcon,
  UserIcon,
  RectangleStackIcon,
  FireIcon,
  StarIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, PlayIcon as PlayIconSolid } from '@heroicons/react/24/solid'
import { useSelector } from 'react-redux'
import AddToPlaylistModal from '../Sidebar/AddToPlaylistModal'
import { selectLikedSongs } from '../../redux/features/authSlice'
import toast from 'react-hot-toast'

const SearchResults = ({ 
  results, 
  selectedCategory, 
  onPlaySong, 
  onPlayAll, 
  onLikeSong,
  formatDuration 
}) => {
  const navigate = useNavigate()
  const likedSongs = useSelector(selectLikedSongs)
  const [hoveredTrack, setHoveredTrack] = useState(null)
  const [hoveredArtist, setHoveredArtist] = useState(null)
  const [hoveredAlbum, setHoveredAlbum] = useState(null)
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
  }, [])

  const isLiked = (songId) => {
    return likedSongs.some(song => song.id === songId)
  }

  const handlePlaySong = (track) => {
    onPlaySong(track)
    toast.success(`Playing "${track.name}"`, { icon: '🎵' })
  }

  const handleLikeSong = (track) => {
    onLikeSong(track)
    const isCurrentlyLiked = isLiked(track.id)
    toast.success(
      isCurrentlyLiked ? 'Removed from liked songs' : 'Added to liked songs',
      { icon: isCurrentlyLiked ? '💔' : '💚' }
    )
  }

  const renderTracks = (tracks) => {
    if (!tracks || tracks.length === 0) return null

    return (
      <div className={`space-y-3 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
              <MusicalNoteIcon className="w-6 h-6 text-black" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white">Songs</h3>
              <p className="text-spotify-text-gray text-sm">{tracks.length} results</p>
            </div>
          </div>
          {tracks.length > 0 && (
            <button
              onClick={() => {
                onPlayAll(tracks)
                toast.success(`Playing ${tracks.length} songs`, { icon: '🎶' })
              }}
              className="bg-gradient-to-r from-spotify-green to-green-400 text-black font-bold px-6 py-3 rounded-xl hover:from-green-400 hover:to-spotify-green transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-spotify-green/25 flex items-center space-x-2"
            >
              <PlayIconSolid className="w-5 h-5" />
              <span>Play all</span>
            </button>
          )}
        </div>
        
        <div className="space-y-2">
          {tracks.map((track, index) => (
            <div
              key={track.id}
              onMouseEnter={() => setHoveredTrack(track.id)}
              onMouseLeave={() => setHoveredTrack(null)}
              className="group flex items-center space-x-4 p-4 rounded-xl hover:bg-gradient-to-r hover:from-spotify-light-gray/50 hover:to-spotify-gray/50 transition-all duration-300 transform hover:scale-102 cursor-pointer"
              onClick={() => handlePlaySong(track)}
            >
              <div className="w-8 text-spotify-text-gray text-sm font-mono">
                {hoveredTrack === track.id ? (
                  <PlayIcon className="w-5 h-5 text-spotify-green" />
                ) : (
                  index + 1
                )}
              </div>
              
              <div className="w-14 h-14 bg-gray-600 rounded-lg overflow-hidden flex-shrink-0 relative group">
                {track.images?.medium || track.image ? (
                  <img 
                    src={track.images?.medium || track.image} 
                    alt={track.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = `https://picsum.photos/300/300?random=${track.id}`
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-spotify-green to-green-400 flex items-center justify-center">
                    <MusicalNoteIcon className="w-6 h-6 text-black" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate text-lg group-hover:text-spotify-green transition-colors">
                  {track.name}
                </p>
                <p className="text-spotify-text-gray text-sm truncate">{track.artist}</p>
                {track.playcount && (
                  <p className="text-spotify-text-gray text-xs">
                    {parseInt(track.playcount).toLocaleString()} plays
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleLikeSong(track)
                  }}
                  className={`p-2 rounded-full transition-all duration-300 transform hover:scale-110 ${
                    isLiked(track.id) 
                      ? 'text-spotify-green bg-spotify-green/20' 
                      : 'text-spotify-text-gray hover:text-spotify-green hover:bg-spotify-green/10'
                  }`}
                >
                  {isLiked(track.id) ? <HeartIconSolid className="w-5 h-5" /> : <HeartIcon className="w-5 h-5" />}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAddToPlaylist(track.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 text-spotify-text-gray hover:text-spotify-green transition-all duration-300 p-1 rounded-full hover:bg-spotify-green/20"
                  title="Add to playlist"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
              </div>
              <div className="text-spotify-text-gray text-sm font-mono">
                {formatDuration(track.duration)}
              </div>
            </div>
          ))}
        </div>
        {showAddToPlaylist && (
                  <AddToPlaylistModal 
                    song={tracks.find(t => t.id === showAddToPlaylist)} 
                    onClose={() => setShowAddToPlaylist(null)} 
                  />
                )}
      </div>
    )
  }

  const renderArtists = (artists) => {
    if (!artists || artists.length === 0) return null

    return (
      <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Artists</h3>
            <p className="text-spotify-text-gray text-sm">{artists.length} results</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {artists.map(artist => (
            <div
              key={artist.id}
              onMouseEnter={() => setHoveredArtist(artist.id)}
              onMouseLeave={() => setHoveredArtist(null)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/artist/${artist.id}`)}
            >
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-blue-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="w-32 h-32 bg-gray-600 rounded-full mx-auto mb-4 overflow-hidden relative">
                  {artist.images?.medium || artist.image ? (
                    <img 
                      src={artist.images?.medium || artist.image}
                      alt={artist.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/300/300?random=artist${artist.id}`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                      <UserIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="text-center">
                  <h4 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors">
                    {artist.name}
                  </h4>
                  <p className="text-spotify-text-gray text-sm truncate">Artist</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderAlbums = (albums) => {
    if (!albums || albums.length === 0) return null

    return (
      <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ animationDelay: '0.2s' }}>
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            <RectangleStackIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-white">Albums</h3>
            <p className="text-spotify-text-gray text-sm">{albums.length} results</p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {albums.map(album => (
            <div
              key={album.id}
              onMouseEnter={() => setHoveredAlbum(album.id)}
              onMouseLeave={() => setHoveredAlbum(null)}
              className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
              onClick={() => navigate(`/album/${album.id}`)}
            >
              <div className="bg-gradient-to-br from-spotify-light-gray to-spotify-gray rounded-2xl p-4 hover:from-spotify-green/20 hover:to-orange-500/20 transition-all duration-300 relative overflow-hidden">
                <div className="w-full h-40 bg-gray-600 rounded-xl mb-4 overflow-hidden relative">
                  {album.images?.medium || album.image ? (
                    <img 
                      src={album.images?.medium || album.image}
                      alt={album.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.target.src = `https://picsum.photos/300/300?random=album${album.id}`
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center">
                      <RectangleStackIcon className="w-12 h-12 text-white" />
                    </div>
                  )}
                  {hoveredAlbum === album.id && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <PlayIcon className="w-8 h-8 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                  <button className="bg-spotify-green text-black rounded-full p-3 shadow-lg hover:scale-110 transition-transform">
                    <PlayIcon className="w-6 h-6" />
                  </button>
                </div>
                
                <div>
                  <h4 className="text-white font-bold truncate text-lg group-hover:text-spotify-green transition-colors">
                    {album.title}
                  </h4>
                  <p className="text-spotify-text-gray text-sm truncate">{album.artistCredits || album.artist}</p>
                  {album.firstReleaseDate && (
                    <p className="text-spotify-text-gray text-xs mt-1">
                      {new Date(album.firstReleaseDate).getFullYear()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (selectedCategory === 'all') {
    return (
      <div className="space-y-12">
        {results.tracks && results.tracks.length > 0 && renderTracks(results.tracks.slice(0, 5))}
        {results.artists && results.artists.length > 0 && renderArtists(results.artists.slice(0, 6))}
        {results.albums && results.albums.length > 0 && renderAlbums(results.albums.slice(0, 6))}
      </div>
    )
  }

  // Render specific category
  switch (selectedCategory) {
    case 'tracks':
      return renderTracks(results.tracks)
    case 'artists':
      return renderArtists(results.artists)
    case 'albums':
      return renderAlbums(results.albums)
    default:
      return null
  }
}

export default SearchResults
