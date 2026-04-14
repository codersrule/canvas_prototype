/**
 * API client for Classroom backend.
 * Uses VITE_API_URL in production; falls back to mock data when API is unavailable.
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001'

function getToken() {
  try {
    const auth = localStorage.getItem('classroom_auth')
    if (!auth) return null
    const parsed = JSON.parse(auth)
    return parsed.token ?? null
  } catch {
    return null
  }
}

async function request(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (res.status === 401) {
    localStorage.removeItem('classroom_auth')
    throw new Error('Session expired')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Request failed: ${res.status}`)
  }

  return res.json().catch(() => ({}))
}

export const api = {
  async login(email, password) {
    return request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  async getMe() {
    return request('/api/auth/me')
  },

  async getCourses(role) {
    const qs = role === 'teacher' ? '?role=teacher' : ''
    return request(`/api/courses${qs}`)
  },

  async getCourse(id) {
    return request(`/api/courses/${id}`)
  },

  async getAvailableCourses(query = '') {
    const qs = query ? `?q=${encodeURIComponent(query)}` : ''
    return request(`/api/courses/available${qs}`)
  },

  async enrollInCourse(courseId) {
    return request(`/api/courses/${courseId}/enroll`, { method: 'POST' })
  },
}
