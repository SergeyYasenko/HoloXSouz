// API configuration and base functions
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

/**
 * Base fetch function with error handling
 * @param {string} endpoint - API endpoint
 * @param {RequestInit} options - Fetch options
 * @returns {Promise<any>}
 */
export async function apiRequest(endpoint, options = {}) {
   const url = `${API_BASE_URL}${endpoint}`

   const defaultOptions = {
      headers: {
         'Content-Type': 'application/json',
         ...options.headers,
      },
   }

   try {
      const response = await fetch(url, { ...defaultOptions, ...options })

      if (!response.ok) {
         throw new Error(`HTTP error! status: ${response.status}`)
      }

      return await response.json()
   } catch (error) {
      console.error('API request failed:', error)
      throw error
   }
}

// Example API functions
export const api = {
   // GET request
   get: (endpoint) => apiRequest(endpoint, { method: 'GET' }),

   // POST request
   post: (endpoint, data) => apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
   }),

   // PUT request
   put: (endpoint, data) => apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
   }),

   // DELETE request
   delete: (endpoint) => apiRequest(endpoint, { method: 'DELETE' }),
}

