import React, { createContext, useContext, useEffect, useState } from 'react'
import api, { setAuthToken } from '../api'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem('token')
    if (t) setAuthToken(t)
    return t
  })
  const [role, setRole] = useState(localStorage.getItem('role'))

  useEffect(() => {
    if (token) {
      setAuthToken(token)
      localStorage.setItem('token', token)
    } else {
      setAuthToken(null)
      localStorage.removeItem('token')
    }

    if (role) localStorage.setItem('role', role)
    else localStorage.removeItem('role')
  }, [token, role])

  const login = async ({ identifier, password }) => {
    const res = await api.post('/auth/login', { identifier, password })
    const { token, role } = res.data
    setToken(token)
    setRole(role)
    return res.data
  }

  const logout = () => {
    setToken(null)
    setRole(null)
    setAuthToken(null)
  }

  return (
    <AuthContext.Provider value={{ token, role, login, logout, setToken, setRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
