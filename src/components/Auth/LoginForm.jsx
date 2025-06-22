import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { login, clearError, selectAuthLoading, selectAuthError } from '../../redux/features/authSlice'
import { UserIcon, KeyIcon, EyeIcon, EyeSlashIcon, ArrowRightIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const LoginForm = ({ onSwitchToSignup }) => {
  const dispatch = useDispatch()
  const isLoading = useSelector(selectAuthLoading)
  const error = useSelector(selectAuthError)
  
  const [formData, setFormData] = useState({
    name: '',
    codename: ''
  })
  const [showCodename, setShowCodename] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const [isFormValid, setIsFormValid] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  // Form validation
  useEffect(() => {
    const nameValid = formData.name.trim().length >= 2
    const codenameValid = formData.codename.trim().length >= 3
    setIsFormValid(nameValid && codenameValid)
    
    // Real-time field validation
    const errors = {}
    if (formData.name && formData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters'
    }
    if (formData.codename && formData.codename.trim().length < 3) {
      errors.codename = 'Codename must be at least 3 characters'
    }
    setFieldErrors(errors)
  }, [formData])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isFormValid) {
      dispatch(login(formData.name.trim(), formData.codename.trim()))
    } else {
      toast.error('Please fill in all fields correctly')
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) dispatch(clearError())
  }

  const handleFocus = (fieldName) => {
    setFocusedField(fieldName)
  }

  const handleBlur = () => {
    setFocusedField(null)
  }

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input - Made more compact */}
        <div className="relative">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              focusedField === 'name' ? 'opacity-100' : ''
            }`}></div>
            
            <div className="relative">
              <UserIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'name' ? 'text-spotify-green' : 'text-spotify-text-gray'
              }`} />
              
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => handleFocus('name')}
                onBlur={handleBlur}
                placeholder="Enter your name"
                className={`w-full bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl pl-10 pr-4 py-3 transition-all duration-300 border-2 ${
                  focusedField === 'name' 
                    ? 'border-spotify-green shadow-lg bg-spotify-gray' 
                    : fieldErrors.name 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-transparent hover:border-spotify-green/30'
                } focus:outline-none`}
                required
              />
              
              {/* Field validation indicator */}
              {formData.name && (
                <div className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full transition-colors duration-300 ${
                  fieldErrors.name ? 'bg-red-500' : 'bg-spotify-green'
                }`}></div>
              )}
            </div>
          </div>
          
          {/* Field error message */}
          {fieldErrors.name && (
            <p className="text-red-400 text-xs mt-1 flex items-center space-x-1 animate-slideIn">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>{fieldErrors.name}</span>
            </p>
          )}
        </div>

        {/* Codename Input - Made more compact */}
        <div className="relative">
          <div className="relative group">
            <div className={`absolute inset-0 bg-gradient-to-r from-spotify-green/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
              focusedField === 'codename' ? 'opacity-100' : ''
            }`}></div>
            
            <div className="relative">
              <KeyIcon className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 transition-colors duration-300 ${
                focusedField === 'codename' ? 'text-spotify-green' : 'text-spotify-text-gray'
              }`} />
              
              <input
                type={showCodename ? "text" : "password"}
                name="codename"
                value={formData.codename}
                onChange={handleInputChange}
                onFocus={() => handleFocus('codename')}
                onBlur={handleBlur}
                placeholder="Enter your secret codename"
                className={`w-full bg-spotify-gray/80 backdrop-blur-sm text-white rounded-xl pl-10 pr-12 py-3 transition-all duration-300 border-2 ${
                  focusedField === 'codename' 
                    ? 'border-spotify-green shadow-lg bg-spotify-gray' 
                    : fieldErrors.codename 
                      ? 'border-red-500/50 bg-red-500/5' 
                      : 'border-transparent hover:border-spotify-green/30'
                } focus:outline-none font-mono tracking-wider`}
                required
              />
              
              <button
                type="button"
                onClick={() => setShowCodename(!showCodename)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-spotify-text-gray hover:text-white transition-all duration-300 p-1 rounded-lg hover:bg-white/10"
                title={showCodename ? "Hide codename" : "Show codename"}
              >
                {showCodename ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>
          
          {/* Field error message */}
          {fieldErrors.codename && (
            <p className="text-red-400 text-xs mt-1 flex items-center space-x-1 animate-slideIn">
              <ExclamationTriangleIcon className="w-3 h-3" />
              <span>{fieldErrors.codename}</span>
            </p>
          )}
        </div>

        {/* Global Error Message - Made more compact */}
        {error && (
          <div className="bg-gradient-to-r from-red-500/20 via-red-500/10 to-red-500/20 border border-red-500/50 rounded-xl p-3 animate-slideIn">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0">
                <ExclamationTriangleIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-red-300 font-medium text-sm">Authentication Failed</p>
                <p className="text-red-400 text-xs">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button - Made more compact */}
        <button
          type="submit"
          disabled={isLoading || !isFormValid}
          className={`w-full relative overflow-hidden rounded-xl py-3 px-6 font-bold text-base transition-all duration-300 transform ${
            isFormValid && !isLoading
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
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
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

export default LoginForm
