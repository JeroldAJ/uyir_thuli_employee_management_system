import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
})

let refreshRequest

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('currentUser') || 'null')
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('currentUser')
}

function redirectToLogin() {
  clearSession()
  if (window.location.pathname !== '/login') window.location.assign('/login')
}

api.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken')
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const refreshToken = localStorage.getItem('refreshToken')
    const isAuthRequest = originalRequest?.url?.includes('/token/')

    if (error.response?.status !== 401 || !refreshToken || isAuthRequest || originalRequest?._retry) {
      if (error.response?.status === 401 && !isAuthRequest) redirectToLogin()
      return Promise.reject(error)
    }

    originalRequest._retry = true
    try {
      refreshRequest ??= api.post('/token/refresh/', { refresh: refreshToken })
      const { data } = await refreshRequest
      localStorage.setItem('accessToken', data.access)
      originalRequest.headers.Authorization = `Bearer ${data.access}`
      return api(originalRequest)
    } catch (refreshError) {
      redirectToLogin()
      return Promise.reject(refreshError)
    } finally {
      refreshRequest = undefined
    }
  },
)

export default api
