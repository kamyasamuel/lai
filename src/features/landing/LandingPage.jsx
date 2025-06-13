import React, { useState, useEffect } from 'react'
import { menuStructure } from '../../constants/menuStructure'
import { starterContent } from '../../constants/starterContent'
import SignIn from '../../auth/SignIn'
import API_BASE_URL from '../../config'

export default function LandingPage({ onSelect }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      // Check for token in localStorage
      const token = localStorage.getItem('authToken')
      const tokenExpiry = localStorage.getItem('tokenExpiry')

      // Check if token exists and is not expired
      if (token && tokenExpiry) {
        // Check if token has expired
        if (new Date().getTime() > parseInt(tokenExpiry)) {
          console.log('Token expired, logging out')
          handleSignOut()
          setIsLoading(false)
          return
        }

        try {
          // Validate token with the backend
          const response = await fetch(`${API_BASE_URL}/auth/check`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (response.ok) {
            const data = await response.json()
            if (data.authenticated) {
              setIsAuthenticated(true)
              setUser(data.user)
              // Store authentication state for other components
              localStorage.setItem('isAuthenticated', 'true')
              // Optionally store user info
              localStorage.setItem('userInfo', JSON.stringify(data.user))
            } else {
              handleSignOut()
            }
          } else {
            handleSignOut()
          }
        } catch (error) {
          console.error('Auth check failed:', error)
          handleSignOut()
        }
      } else {
        handleSignOut()
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const handleSignOut = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('tokenExpiry')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('token') // Add this line to match what Sidebar is checking
    setIsAuthenticated(false)
    setUser(null)
    
    // Trigger storage event for other components (like Sidebar) to react
    window.dispatchEvent(new Event('storage'))
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="h-full flex justify-center items-center text-white">
        Loading...
      </div>
    )
  }

  // If not authenticated, show the sign-in component
  if (!isAuthenticated) {
    return <SignIn />
  }

  // Otherwise, show the regular landing page content with sign out button
  return (
    <div className="h-full flex flex-col justify-center items-center text-center text-white page-container-padding">
      <div className="static w-full flex flex-col items-center mb-8 p-8 sm:mb-0 sm:flex-row sm:absolute sm:top-4 sm:right-4 sm:p-0 sm:w-auto sm:justify-end">
        <span className="mb-2 sm:mb-0 sm:mr-4">Welcome {user?.name || ''}</span>
        <button
          onClick={handleSignOut}
          className="px-4 py-2 custom-button"
        >
          Log Out
        </button>
      </div>

      <h1 className="text-4xl font-bold mb-4 mt-4 sm:mt-0">Welcome to Legal AI Africa</h1>
      <p className="text-gray-400 text-lg max-w-2xl mb-8 px-4 sm:px-0">
        Your AI-powered legal assistant for document analysis, research,
        drafting, and more. Select a feature from the menu to get started.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 w-full px-4 sm:px-0 sm:w-auto">
        {Object.entries(menuStructure).flatMap(([_, items]) =>
          items.map(({ name, icon: Icon }) => (
            <button
              key={name}
              onClick={() => onSelect(name)}
              className="border border-[#333] bg-[#111] rounded p-4 flex flex-col items-center
                         text-center shadow-md hover:bg-[#2a2a2a]"
            >
              <Icon size={32} className="mb-2 text-[#8c00cc]" />
              <h3 className="font-semibold text-lg mb-1">{name}</h3>
              <p className="text-sm text-gray-400">
                {starterContent[name] || 'Explore this feature.'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  )
}