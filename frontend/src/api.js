import axios from 'axios'

const API_BASE = (import.meta.env.VITE_API_BASE) || 'http://localhost:5000/api/v1/mannkibaat'

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

export const setAuthToken = (token) => {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`
  else delete api.defaults.headers.common.Authorization
}

export default api
