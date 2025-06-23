import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { XMarkIcon, PlusIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { 
  selectAllPlaylists, 
  addSongToPlaylist, 
  createPlaylist 
} from '../../redux/features/playlistSlice'
import { selectUser } from '../../redux/features/authSlice'
import toast from 'react-hot-toast'

const AddToPlaylistModal = ({ song, onClose }) => {
  const dispatch = useDispatch()
  const user = useSelector(selectUser)
  const playlists = useSelector(selectAllPlaylists)
  const userPlaylists = playlists.filter(p => !p.isDefault)
  
  const [showCreateNew, setShowCreateNew] = useState(false)
  const [newPlaylistName, setNewPlaylistName] = useState('')

  const handleAddToPlaylist = (playlistId) => {
    dispatch(addSongToPlaylist({ playlistId, song }))
    const playlist = playlists.find(p => p.id === playlistId)
    toast.success(`Added to "${playlist.name}"`, { icon: '✅' })
    onClose()
  }

  const handleCreateAndAdd = () => {
    if (newPlaylistName.trim()) {
      dispatch(createPlaylist({ 
        name: newPlaylistName.trim(),
        description: `Created for "${song.title}"` 
      }))
      
      setTimeout(() => {
        const newPlaylists = JSON.parse(localStorage.getItem(`spotify_clone_playlists_${user.id}`) || '[]')
        const newPlaylist = newPlaylists[newPlaylists.length - 1]
        if (newPlaylist) {
          dispatch(addSongToPlaylist({ playlistId: newPlaylist.id, song }))
        }
      }, 100)
      
      toast.success(`Created "${newPlaylistName}" and added song`, { icon: '🎵' })
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-spotify-gray rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-white text-xl font-bold">Add to Playlist</h2>
          <button onClick={onClose} className="text-spotify-text-gray hover:text-white transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spotify-green rounded-lg flex items-center justify-center">
              {song.coverImage ? (
                <img src={song.coverImage} alt={song.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <MusicalNoteIcon className="w-6 h-6 text-black" />
              )}
            </div>
            <div>
              <p className="text-white font-medium">{song.title}</p>
              <p className="text-spotify-text-gray text-sm">{song.artist}</p>
            </div>
          </div>
        </div>

        <div className="max-h-60 overflow-y-auto">
          <div className="p-4">
            {!showCreateNew ? (
              <button
                onClick={() => setShowCreateNew(true)}
                className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors"
              >
                <div className="w-8 h-8 bg-spotify-green rounded-lg flex items-center justify-center">
                  <PlusIcon className="w-5 h-5 text-black" />
                </div>
                <span className="text-white font-medium">Create New Playlist</span>
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full bg-spotify-black text-white rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-spotify-green"
                  autoFocus
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleCreateAndAdd}
                    disabled={!newPlaylistName.trim()}
                    className="flex-1 bg-spotify-green text-black font-bold py-2 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50"
                  >
                    Create & Add
                  </button>
                  <button
                    onClick={() => setShowCreateNew(false)}
                    className="px-4 py-2 text-spotify-text-gray hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {userPlaylists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => handleAddToPlaylist(playlist.id)}
              className="w-full flex items-center space-x-3 p-4 hover:bg-white/10 transition-colors"
            >
              <div className="w-8 h-8 bg-spotify-light-gray rounded-lg flex items-center justify-center overflow-hidden">
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} alt={playlist.name} className="w-full h-full object-cover" />
                ) : (
                  <MusicalNoteIcon className="w-5 h-5 text-spotify-text-gray" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white font-medium">{playlist.name}</p>
                <p className="text-spotify-text-gray text-sm">{playlist.songs?.length || 0} songs</p>
              </div>
            </button>
          ))}

          {userPlaylists.length === 0 && !showCreateNew && (
            <div className="p-8 text-center">
              <p className="text-spotify-text-gray">No playlists yet</p>
              <p className="text-spotify-text-gray text-sm">Create your first playlist above</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AddToPlaylistModal
