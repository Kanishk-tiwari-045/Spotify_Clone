import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import LoginForm from './LoginForm'
import SignupForm from './SignupForm'

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [isAnimating, setIsAnimating] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  // Handle form switching with animation
  const handleFormSwitch = (toLogin) => {
    setIsAnimating(true)
    setTimeout(() => {
      setIsLogin(toLogin)
      setIsAnimating(false)
    }, 300)
  }

  // Track mouse movement for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Floating music notes animation
  const FloatingNote = ({ delay, size, position }) => (
    <div 
      className={`absolute text-spotify-green opacity-20 animate-bounce`}
      style={{
        fontSize: `${size}rem`,
        left: `${position.x}%`,
        top: `${position.y}%`,
        animationDelay: `${delay}s`,
        animationDuration: '3s'
      }}
    >
      ♪
    </div>
  )

  return (
    <div className="min-h-screen max-h-screen bg-gradient-to-br from-spotify-black via-gray-900 to-spotify-gray flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Animated gradient orbs */}
        <div 
          className="absolute w-96 h-96 bg-spotify-green opacity-10 rounded-full blur-3xl animate-pulse-slow transition-transform duration-1000"
          style={{
            top: '-10%',
            right: '-10%',
            transform: `translate(${mousePosition.x * 0.1}px, ${mousePosition.y * 0.1}px)`
          }}
        ></div>
        <div 
          className="absolute w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl animate-pulse-slow transition-transform duration-1000"
          style={{
            bottom: '-10%',
            left: '-10%',
            animationDelay: '1s',
            transform: `translate(${-mousePosition.x * 0.05}px, ${-mousePosition.y * 0.05}px)`
          }}
        ></div>
        <div 
          className="absolute w-64 h-64 bg-purple-500 opacity-8 rounded-full blur-3xl animate-pulse-slow transition-transform duration-1000"
          style={{
            top: '50%',
            left: '10%',
            animationDelay: '2s',
            transform: `translate(${mousePosition.x * 0.08}px, ${mousePosition.y * 0.08}px)`
          }}
        ></div>

        {/* Floating music notes */}
        <FloatingNote delay={0} size={1.5} position={{ x: 15, y: 20 }} />
        <FloatingNote delay={1} size={1.2} position={{ x: 85, y: 30 }} />
        <FloatingNote delay={2} size={1.8} position={{ x: 25, y: 70 }} />
        <FloatingNote delay={3} size={1.3} position={{ x: 75, y: 80 }} />
        <FloatingNote delay={4} size={1.6} position={{ x: 50, y: 15 }} />
        <FloatingNote delay={5} size={1.1} position={{ x: 90, y: 60 }} />

        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(29, 185, 84, 0.3) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}
        ></div>
      </div>

      {/* Spotify Logo and Branding - Made responsive */}
      <div className="absolute top-4 left-4 lg:top-8 lg:left-8 z-20">
        <div className="flex items-center space-x-2 lg:space-x-3">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-spotify-green rounded-full flex items-center justify-center shadow-2xl">
            <span className="text-black text-xl lg:text-2xl font-bold">♪</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-white text-xl lg:text-2xl font-bold">Spotify Clone</h1>
            <p className="text-spotify-text-gray text-xs lg:text-sm">Music for everyone</p>
          </div>
        </div>
      </div>

      {/* Main Content Container - Fixed height and scrolling */}
      <div className="relative z-10 w-full max-w-md h-full max-h-[90vh] flex items-center justify-center">
        {/* Form Container with Glass Effect */}
        <div className="relative w-full max-h-full overflow-y-auto">
          {/* Glassmorphism background */}
          <div className="absolute inset-0 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl"></div>
          
          {/* Content */}
          <div className={`relative p-6 lg:p-8 transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            {/* Header - Made more compact */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="relative inline-block">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-spotify-green to-green-400 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <span className="text-black text-2xl lg:text-3xl font-bold relative z-10">
                    {isLogin ? '🎵' : '✨'}
                  </span>
                </div>
                {/* Pulse ring animation */}
                <div className="absolute inset-0 w-16 h-16 lg:w-20 lg:h-20 mx-auto rounded-full border-2 border-spotify-green opacity-30 animate-ping"></div>
              </div>
              
              <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                {isLogin ? 'Welcome Back' : 'Join the Beat'}
              </h2>
              <p className="text-spotify-text-gray text-sm lg:text-base">
                {isLogin 
                  ? 'Sign in to continue your musical journey' 
                  : 'Create your account and discover amazing music'
                }
              </p>
            </div>

            {/* Form Toggle Buttons */}
            <div className="flex bg-spotify-gray/50 rounded-2xl p-1 mb-4 lg:mb-6 backdrop-blur-sm">
              <button
                onClick={() => handleFormSwitch(true)}
                className={`flex-1 py-2 lg:py-3 px-3 lg:px-3 rounded-2xl font-medium transition-all duration-300 text-sm lg:text-base ${
                  isLogin 
                    ? 'bg-spotify-green text-black shadow-lg transform scale-105' 
                    : 'text-spotify-text-gray hover:text-white'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => handleFormSwitch(false)}
                className={`flex-1 py-2 lg:py-3 px-3 lg:px-4 rounded-2xl font-medium transition-all duration-300 text-sm lg:text-base ${
                  !isLogin 
                    ? 'bg-spotify-green text-black shadow-lg transform scale-105' 
                    : 'text-spotify-text-gray hover:text-white'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Form Content */}
            <div className="relative">
              {isLogin ? (
                <LoginForm onSwitchToSignup={() => handleFormSwitch(false)} />
              ) : (
                <SignupForm onSwitchToLogin={() => handleFormSwitch(true)} />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements - Made responsive */}
      <div className="absolute bottom-2 right-2 lg:bottom-8 lg:right-8 text-spotify-text-gray/30 text-xs lg:text-sm">
        <p>© 2025 Spotify Clone</p>
      </div>

      {/* Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from { 
            opacity: 0; 
            transform: scale(0.9); 
          }
          to { 
            opacity: 1; 
            transform: scale(1); 
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  )
}

export default AuthScreen
