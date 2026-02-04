/**
 * Storage Mock - LocalStorage persistence layer
 * Handles storing and retrieving data from localStorage
 */

const STORAGE_PREFIX = 'campus_master_'

/**
 * Storage keys
 */
export const STORAGE_KEYS = {
  AUTH_TOKEN: `${STORAGE_PREFIX}auth_token`,
  CURRENT_USER: `${STORAGE_PREFIX}current_user`,
  REMEMBER_ME: `${STORAGE_PREFIX}remember_me`,
} as const

/**
 * Mock Storage Service
 */
export class MockStorage {
  /**
   * Save item to localStorage
   */
  static set<T>(key: string, value: T): void {
    try {
      if (typeof window === 'undefined') return
      const serialized = JSON.stringify(value)
      localStorage.setItem(key, serialized)
    } catch (error) {
      console.error('Error saving to localStorage:', error)
    }
  }

  /**
   * Get item from localStorage
   */
  static get<T>(key: string): T | null {
    try {
      if (typeof window === 'undefined') return null
      const item = localStorage.getItem(key)
      if (!item) return null
      return JSON.parse(item) as T
    } catch (error) {
      console.error('Error reading from localStorage:', error)
      return null
    }
  }

  /**
   * Remove item from localStorage
   */
  static remove(key: string): void {
    try {
      if (typeof window === 'undefined') return
      localStorage.removeItem(key)
    } catch (error) {
      console.error('Error removing from localStorage:', error)
    }
  }

  /**
   * Clear all app data from localStorage
   */
  static clear(): void {
    try {
      if (typeof window === 'undefined') return
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  /**
   * Check if item exists
   */
  static has(key: string): boolean {
    return localStorage.getItem(key) !== null
  }
}

/**
 * Auth-specific storage helpers
 */
export class AuthStorage {
  static setToken(token: string): void {
    MockStorage.set(STORAGE_KEYS.AUTH_TOKEN, token)
  }

  static getToken(): string | null {
    return MockStorage.get<string>(STORAGE_KEYS.AUTH_TOKEN)
  }

  static removeToken(): void {
    MockStorage.remove(STORAGE_KEYS.AUTH_TOKEN)
  }

  static setCurrentUser(user: any): void {
    MockStorage.set(STORAGE_KEYS.CURRENT_USER, user)
  }

  static getCurrentUser<T>(): T | null {
    return MockStorage.get<T>(STORAGE_KEYS.CURRENT_USER)
  }

  static removeCurrentUser(): void {
    MockStorage.remove(STORAGE_KEYS.CURRENT_USER)
  }

  static isAuthenticated(): boolean {
    return MockStorage.has(STORAGE_KEYS.AUTH_TOKEN)
  }

  static clearAuth(): void {
    AuthStorage.removeToken()
    AuthStorage.removeCurrentUser()
  }
}

/**
 * Generate a mock JWT token
 */
export function generateMockToken(userId: string, email: string): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const payload = btoa(
    JSON.stringify({
      sub: userId,
      email,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
    })
  )
  const signature = btoa('mock-signature')
  
  return `${header}.${payload}.${signature}`
}

/**
 * Validate mock token (basic check)
 */
export function validateMockToken(token: string): boolean {
  if (!token) return false
  
  const parts = token.split('.')
  if (parts.length !== 3) return false
  
  try {
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    return payload.exp > now
  } catch {
    return false
  }
}

/**
 * Decode mock token
 */
export function decodeMockToken(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    return JSON.parse(atob(parts[1]))
  } catch {
    return null
  }
}
