import React, { createContext, useContext, useState, useEffect } from 'react'

const STORAGE_KEY = 'classroom_auth'
const USE_API = !!import.meta.env.VITE_API_URL

const AuthContext = createContext(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

function loadAuth() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const stored = JSON.parse(raw)
    const u = USE_API ? (stored.user || stored) : stored
    if (!u) return null
    if (!u.initials && u.name) {
      u.initials = u.name.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase()
    }
    if (u.role === 'student' && u.studentId == null) {
      u.studentId = 1
    }
    return u
  } catch {
    return null
  }
}

function saveAuth(data) {
  if (typeof window === 'undefined') return
  if (data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } else {
    localStorage.removeItem(STORAGE_KEY)
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    setUser(loadAuth())
    setReady(true)
  }, [])

  const login = async (credentials) => {
    if (USE_API && credentials.email && credentials.password) {
      const { api } = await import('../api/client.js')
      const res = await api.login(credentials.email, credentials.password)
      const u = {
        ...res.user,
        studentId: res.user.role === 'student' ? 1 : undefined,
      }
      setUser(u)
      saveAuth({ token: res.token, user: u })
      return u
    }

    const { role, email, name } = credentials
    const fullName = name || (role === 'teacher' ? 'Prof. Sarah Chen' : 'Sadiq Haruna')
    const initials =
      fullName.split(/\s+/).map((s) => s[0]).join('').slice(0, 2).toUpperCase() ||
      (role === 'teacher' ? 'SC' : 'PA')
    const u = {
      role: role || 'student',
      email: email || '',
      name: fullName,
      initials,
      ...(role === 'student' ? { studentId: 1 } : {}),
    }
    setUser(u)
    saveAuth(u)
    return u
  }

  const logout = () => {
    setUser(null)
    saveAuth(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, ready }}>
      {children}
    </AuthContext.Provider>
  )
}
