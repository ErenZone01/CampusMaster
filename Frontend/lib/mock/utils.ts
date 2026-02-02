/**
 * Mock utility functions
 */

/**
 * Simulate network delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Generate random delay (200-500ms)
 */
export function randomDelay(): Promise<void> {
  const ms = Math.floor(Math.random() * 300) + 200
  return delay(ms)
}

/**
 * Generate UUID
 */
export function generateId(prefix: string = ''): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  return prefix ? `${prefix}-${timestamp}-${random}` : `${timestamp}-${random}`
}

/**
 * Simulate random error (for testing)
 */
export function shouldSimulateError(probability: number = 0.05): boolean {
  return Math.random() < probability
}

/**
 * Format date for mock data
 */
export function formatMockDate(date: Date = new Date()): string {
  return date.toISOString()
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date()
}

/**
 * Check if date is in the future
 */
export function isFuture(dateString: string): boolean {
  return new Date(dateString) > new Date()
}

/**
 * Calculate days difference
 */
export function daysDifference(date1: string, date2: string): number {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diff = Math.abs(d1.getTime() - d2.getTime())
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

/**
 * Check if date is today
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString)
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Paginate array
 */
export function paginate<T>(
  items: T[],
  page: number = 1,
  pageSize: number = 10
): {
  data: T[]
  pagination: {
    page: number
    page_size: number
    total_items: number
    total_pages: number
  }
} {
  const total_items = items.length
  const total_pages = Math.ceil(total_items / pageSize)
  const start = (page - 1) * pageSize
  const end = start + pageSize
  const data = items.slice(start, end)

  return {
    data,
    pagination: {
      page,
      page_size: pageSize,
      total_items,
      total_pages,
    },
  }
}

/**
 * Sort array by field
 */
export function sortBy<T>(
  items: T[],
  field: keyof T,
  order: 'asc' | 'desc' = 'asc'
): T[] {
  return [...items].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]

    if (aVal === bVal) return 0

    if (order === 'asc') {
      return aVal > bVal ? 1 : -1
    } else {
      return aVal < bVal ? 1 : -1
    }
  })
}

/**
 * Filter items by search query
 */
export function searchFilter<T>(
  items: T[],
  query: string,
  fields: (keyof T)[]
): T[] {
  if (!query) return items

  const lowerQuery = query.toLowerCase()

  return items.filter(item => {
    return fields.some(field => {
      const value = item[field]
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowerQuery)
      }
      return false
    })
  })
}

/**
 * Group items by field
 */
export function groupBy<T>(items: T[], field: keyof T): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const key = String(item[field])
    if (!acc[key]) {
      acc[key] = []
    }
    acc[key].push(item)
    return acc
  }, {} as Record<string, T[]>)
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0
  return Math.round((value / total) * 100 * 100) / 100 // 2 decimal places
}

/**
 * Calculate average
 */
export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0
  const sum = numbers.reduce((acc, n) => acc + n, 0)
  return Math.round((sum / numbers.length) * 100) / 100
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Truncate text
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}
