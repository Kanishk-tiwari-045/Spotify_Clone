import React, { useState, useEffect, useRef } from 'react'
import { useDispatch } from 'react-redux'
import { 
  XMarkIcon, 
  PhotoIcon, 
  MusicalNoteIcon,
  SparklesIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { createPlaylist, setIsCreating } from '../../redux/features/playlistSlice'
import toast from 'react-hot-toast'

const CreatePlaylistModal = () => {
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPublic: false,
    coverImage: null
  })
  const [imagePreview, setImagePreview] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [nameError, setNameError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  
  const fileInputRef = useRef(null)
  const nameInputRef = useRef(null)

  // Entrance animation
  useEffect(() => {
    setIsVisible(true)
    // Auto-focus name input
    setTimeout(() => {
      nameInputRef.current?.focus()
    }, 300)
  }, [])

  // Real-time name validation
  useEffect(() => {
    if (formData.name.length > 0 && formData.name.length < 3) {
      setNameError('Playlist name must be at least 3 characters')
    } else if (formData.name.length > 100) {
      setNameError('Playlist name must be less than 100 characters')
    } else {
      setNameError('')
    }
  }, [formData.name])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      dispatch(setIsCreating(false))
      setFormData({ name: '', description: '', isPublic: false, coverImage: null })
      setImagePreview(null)
      setNameError('')
    }, 300)
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleImageChange = (file) => {
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file')
        return
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target.result)
        setFormData(prev => ({ ...prev, coverImage: e.target.result }))
        toast.success('Image uploaded successfully', { icon: '🖼️' })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleFileInputChange = (e) => {
    const file = e.target.files[0]
    handleImageChange(file)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    handleImageChange(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      toast.error('Please enter a playlist name')
      nameInputRef.current?.focus()
      return
    }

    if (nameError) {
      toast.error('Please fix the errors before creating playlist')
      return
    }

    setIsSubmitting(true)

    try {
      const playlistData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPublic: formData.isPublic,
        coverImage: formData.coverImage
      }

      dispatch(createPlaylist(playlistData))
      toast.success(`Created playlist "${playlistData.name}"`, { icon: '🎵' })
      handleClose()
    } catch (error) {
      toast.error('Failed to create playlist')
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateRandomName = () => {
    const adjectives = ['Awesome', 'Epic', 'Chill', 'Vibrant', 'Smooth', 'Electric', 'Dreamy', 'Cosmic']
    const nouns = ['Beats', 'Vibes', 'Mix', 'Playlist', 'Collection', 'Sounds', 'Tracks', 'Tunes']
    const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
    const randomName = `${randomAdjective} ${randomNoun}`
    
    setFormData(prev => ({ ...prev, name: randomName }))
    toast.success('Random name generated!', { icon: '🎲' })
  }

  const isFormValid = formData.name.trim().length >= 3 && !nameError

  return (
    <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pt-10 transition-all duration-300 ${
      isVisible ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className={`bg-gradient-to-br from-spotify-light-gray via-spotify-gray to-spotify-light-gray rounded-3xl p-8 w-full max-w-lg shadow-2xl border border-spotify-green/30 relative overflow-hidden transition-all duration-500 mt-16 ${
        isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'
      }`}>
        
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-r from-spotify-green/5 via-transparent to-blue-500/5 animate-pulse-slow"></div>
        
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-spotify-green rounded-full flex items-center justify-center">
              <SparklesIcon className="w-7 h-7 text-black" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Create Playlist</h2>
              <p className="text-spotify-text-gray text-sm">Build your perfect music collection</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-spotify-text-gray/20 text-spotify-text-gray hover:bg-white/20 hover:text-white transition-all duration-300 transform hover:scale-110"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
          {/* Cover Image Upload */}
          <div className="space-y-3">
            <label className="block text-white font-medium">Cover Image</label>
            <div className="flex items-center space-x-6">
              <div 
                className={`w-24 h-24 bg-spotify-gray rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed transition-all duration-300 cursor-pointer ${
                  dragOver ? 'border-spotify-green bg-spotify-green/10' : 'border-gray-600 hover:border-spotify-green/50'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="Cover" className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="text-center">
                    <PhotoIcon className="w-8 h-8 text-spotify-text-gray mx-auto mb-1" />
                    <span className="text-xs text-spotify-text-gray">Drop image</span>
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-spotify-green/20 text-spotify-green border border-spotify-green/30 font-medium px-4 py-2 rounded-xl hover:bg-spotify-green/30 transition-all duration-300 text-sm"
                >
                  Choose Photo
                </button>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null)
                      setFormData(prev => ({ ...prev, coverImage: null }))
                    }}
                    className="block text-red-400 hover:text-red-300 text-sm transition-colors"
                  >
                    Remove
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Playlist Name */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="block text-white font-medium">Playlist Name</label>
              <button
                type="button"
                onClick={generateRandomName}
                className="text-spotify-green hover:text-green-400 text-sm transition-colors flex items-center space-x-1"
              >
                <span>🎲</span>
                <span>Random</span>
              </button>
            </div>
            <div className="relative">
              <input
                ref={nameInputRef}
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="My Awesome Playlist"
                className={`w-full bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl px-4 py-3 pr-12 transition-all duration-300 border-2 ${
                  focusedField === 'name' 
                    ? 'border-spotify-green shadow-lg shadow-spotify-green/25' 
                    : nameError 
                      ? 'border-red-500/50' 
                      : 'border-transparent hover:border-spotify-green/30'
                } focus:outline-none`}
                maxLength={100}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {formData.name.length >= 3 && !nameError ? (
                  <CheckCircleIcon className="w-5 h-5 text-spotify-green" />
                ) : (
                  <span className="text-spotify-text-gray text-sm">{formData.name.length}/100</span>
                )}
              </div>
            </div>
            {nameError && (
              <p className="text-red-400 text-sm flex items-center space-x-1">
                <span>⚠️</span>
                <span>{nameError}</span>
              </p>
            )}
          </div>

          {/* Privacy Setting */}
          <div className="bg-spotify-gray/50 rounded-xl p-4 border border-spotify-green/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-spotify-green/20 rounded-full flex items-center justify-center">
                  {formData.isPublic ? (
                    <EyeIcon className="w-5 h-5 text-spotify-green" />
                  ) : (
                    <EyeSlashIcon className="w-5 h-5 text-spotify-text-gray" />
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">
                    {formData.isPublic ? 'Public Playlist' : 'Private Playlist'}
                  </p>
                  <p className="text-spotify-text-gray text-sm">
                    {formData.isPublic ? 'Anyone can see this playlist' : 'Only you can see this playlist'}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-spotify-green"></div>
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-spotify-green/20">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 bg-spotify-text-gray/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className={`px-6 py-3 font-bold rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center space-x-2 ${
                isFormValid && !isSubmitting
                  ? 'bg-gradient-to-r from-spotify-green to-green-400 text-black hover:from-green-400 hover:to-spotify-green shadow-lg hover:shadow-spotify-green/25'
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <MusicalNoteIcon className="w-5 h-5" />
                  <span>Create Playlist</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlaylistModal
