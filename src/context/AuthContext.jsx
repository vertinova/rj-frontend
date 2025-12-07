import { createContext, useState, useContext, useEffect } from 'react'
import { authService } from '../services/authService'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (token) {
        try {
          // Try to get fresh user data from server
          const userData = await authService.getProfile()
          setUser(userData)
          localStorage.setItem('user', JSON.stringify(userData))
        } catch (error) {
          // If failed, try to use stored user data
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              setUser(parsedUser)
            } catch (parseError) {
              // If parsing failed, clear storage
              localStorage.removeItem('token')
              localStorage.removeItem('user')
            }
          } else {
            // If no stored user, clear token
            localStorage.removeItem('token')
          }
        }
      }
      
      setLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (username, password) => {
    try {
      const data = await authService.login(username, password)
      const userData = data.user || data
      setUser(userData)
      
      // Store user data in localStorage for persistence
      localStorage.setItem('user', JSON.stringify(userData))
      
      // Toast notification handled in Login.jsx component
      return data
    } catch (error) {
      // Error toast handled in Login.jsx component
      throw error
    }
  }

  const register = async (userData) => {
    try {
      await authService.register(userData)
      // Toast notification handled in Register.jsx component
    } catch (error) {
      // Error toast handled in Register.jsx component
      throw error
    }
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    // Toast notification handled in Dashboard components
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
