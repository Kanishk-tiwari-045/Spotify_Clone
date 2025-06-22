import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { signup, clearError, selectAuthLoading, selectAuthError } from '../../redux/features/authSlice'
import { UserIcon, SparklesIcon, ArrowRightIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const SignupForm = ({ onSwitchToLogin }) => {
  const dispatch = useDispatch()
  const isLoading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  
  const [name, setName] = useState('')
  const [focusedField, setFocusedField] = useState(false)
  const [isNameValid, setIsNameValid] = useState(false)
  const [nameError, setNameError] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  // Real-time validation
  useEffect(() => {
    const trimmedName = name.trim()
    
    if (trimmedName.length === 0) {
      setIsNameValid(false)
      setNameError('')
      setShowPreview(false)
    } else if (trimmedName.length < 2) {
      setIsNameValid(false)
      setNameError('Name must be at least 2 characters')
      setShowPreview(false)
    } else if (trimmedName.length > 30) {
      setIsNameValid(false)
      setNameError('Name must be less than 30 characters')
      setShowPreview(false)
    } else if (!/^[a-zA-Z\s]+$/.test(trimmedName)) {
      setIsNameValid(false)
      setNameError('Name can only contain letters and spaces')
      setShowPreview(false)
    } else {
      setIsNameValid(true)
      setNameError('')
      setShowPreview(true)
    }
  }, [name])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isNameValid) {
      dispatch(signup(name.trim()))
    } else {
      toast.error('Please enter a valid name')
    }
  }

  const handleInputChange = (e) => {
    setName(e.target.value)
    if (error) dispatch(clearError())
  }

  const handleFocus = () => {
    setFocusedField(true)
  }

  const handleBlur = () => {
    setFocusedField(false)
  }

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Input */}
        <div className="relative">
          
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              focusedField ? 'opacity-100' : ''
            }`}></div>
            
            <div className="relative">
              <UserIcon className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField ? 'text-spotify-green' : 'text-spotify-text-gray'
              }`} />
              
              <input
                type="text"
                value={name}
                onChange={handleInputChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder="Enter your full name"
                className={`w-full bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl pl-12 pr-12 py-3 transition-all duration-300 border-2 ${
                  focusedField 
                    ? 'border-spotify-green shadow-lg bg-spotify-gray' 
                    : nameError 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-transparent hover:border-spotify-green/30'
                } focus:outline-none`}
                required
                minLength={2}
                maxLength={30}
              />
              
              {/* Validation indicator */}
              {name && (
                <div className={`absolute right-4 top-1/2 transform -translate-y-1/2 transition-all duration-300 ${
                  isNameValid ? 'text-spotify-green' : 'text-red-500'
                }`}>
                  {isNameValid ? (
                    <CheckCircleIcon className="w-5 h-5" />
                  ) : (
                    <ExclamationTriangleIcon className="w-5 h-5" />
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Character count */}
          <div className="flex justify-between items-center mt-2">
          </div>
        </div>

        {/* Name Preview */}
        {showPreview && (
          <div className="bg-gradient-to-r from-spotify-green/10 via-green-400/10 to-spotify-green/10 border border-spotify-green/30 rounded-xl p-4 animate-slideIn">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-spotify-green rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-lg">
                  {name.trim().charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-spotify-green font-medium">Preview</p>
                <p className="text-white text-sm">Welcome, {name.trim()}!</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Message */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20 border border-red-500/50 rounded-xl p-4 animate-slideIn">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-red-300 font-medium">Registration Failed</p>
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isNameValid}
          className={`w-full relative overflow-hidden rounded-xl py-3 px-6 font-bold text-base transition-all duration-300 transform ${
            isNameValid && !isLoading
              ? 'bg-gradient-to-r from-spotify-green to-green-400 text-black hover:from-green-400 hover:to-spotify-green hover:scale-105 shadow-lg hover:shadow-spotify-green/25'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {/* Button background animation */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative z-10 flex items-center justify-center space-x-2">
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRightIcon className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </div>
        </button>
      </form>

      {/* Custom animations */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default SignupForm
