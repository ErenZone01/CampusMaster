'use client'

import { AuthService } from '@/lib/services/auth.service'
import type { UserPublic, UserRole } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import useSWR from 'swr'

interface AuthState {
  user: UserPublic | null
  isLoading: boolean
  error: string | null
}

async function fetchCurrentUser(): Promise<UserPublic | null> {
  console.log('[fetchCurrentUser] Called!')
  
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
    console.log('[fetchCurrentUser] On login page, skipping')
    return null
  }
  
  // Check if token exists first
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  if (!token) {
    console.log('[fetchCurrentUser] No token found in localStorage')
    return null
  }
  
  console.log('[fetchCurrentUser] Token found (length: ' + token.length + '), fetching user data...')
  
  try {
    const result = await AuthService.getCurrentUser()
    console.log('[fetchCurrentUser] API response:', result)
    
    if (!result.success) {
      // Token invalide, on le supprime
      console.log('[fetchCurrentUser] API returned success=false, clearing token')
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      }
      return null
    }
    
    console.log('[fetchCurrentUser] User authenticated successfully:', result.data)
    return result.data || null
  } catch (error) {
    // En cas d'erreur, on supprime le token
    console.error('[fetchCurrentUser] Error fetching user:', error)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
    return null
  }
}

export function useAuth() {
  const router = useRouter()
  
  // Use token as part of SWR key to refetch when token changes
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
  const isLoginPage = typeof window !== 'undefined' && window.location.pathname.startsWith('/login')
  
  // Don't use SWR on login page to avoid polluting the cache
  const swrKey = token && !isLoginPage ? ['current-user', token] : null
  
  console.log('[useAuth] SWR setup:', { 
    hasToken: !!token, 
    tokenLength: token?.length,
    swrKey: swrKey,
    isLoginPage,
    pathname: typeof window !== 'undefined' ? window.location.pathname : 'SSR'
  })
  
  const { data: user, error, isLoading, mutate } = useSWR<UserPublic | null>(
    swrKey,
    fetchCurrentUser,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 5000,
      focusThrottleInterval: 10000,
    }
  )

  console.log('[useAuth] State:', { 
    user, 
    isLoading, 
    token: !!token, 
    isAuthenticated: !!user,
    error: error?.message
  })

  const signIn = useCallback(async (email: string, password: string) => {
    const result = await AuthService.login({ email, password })

    if (!result.success) {
      throw new Error(result.error || 'Échec de connexion')
    }

    mutate()
    
    return { success: true, user: result.data }
  }, [mutate])

  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata: { 
      firstName: string
      lastName: string
      role?: UserRole
      departmentId?: string
    }
  ) => {
    const result = await AuthService.register({
      email,
      password,
      first_name: metadata.firstName,
      last_name: metadata.lastName,
      role: metadata.role || 'student',
      department_id: metadata.departmentId,
    })

    if (!result.success) {
      throw new Error(result.error || 'Échec d\'inscription')
    }

    return { success: true }
  }, [])

  const signOut = useCallback(async () => {
    await AuthService.logout()
    await mutate(null)
    router.push('/login')
  }, [mutate, router])

  const refreshUser = useCallback(async () => {
    await mutate()
  }, [mutate])

  return {
    user: user ?? null,
    isLoading,
    isAuthenticated: !!user,
    error: error?.message || null,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }
}

// Hook to require authentication
export function useRequireAuth(allowedRoles?: UserRole[]) {
  const { user, isLoading, isAuthenticated, refreshUser } = useAuth()
  const router = useRouter()

  useEffect(() => {
    console.log('[useRequireAuth] Check:', { isLoading, isAuthenticated, user: !!user })
    
    // Wait for loading to complete
    if (isLoading) {
      console.log('[useRequireAuth] Still loading, waiting...')
      return
    }

    // Check authentication
    if (!isAuthenticated) {
      console.log('[useRequireAuth] Not authenticated, redirecting to login')
      router.push('/login')
      return
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      console.log('[useRequireAuth] Role not allowed:', user.role, 'Required:', allowedRoles)
      const redirectPath = user.role === 'admin' 
        ? '/admin' 
        : user.role === 'teacher' 
          ? '/teacher' 
          : '/student'
      router.push(redirectPath)
    }
  }, [isLoading, isAuthenticated, user?.role, allowedRoles, router])

  return { user, isLoading, isAuthenticated, refreshUser }
}

// Hook to get redirect path based on user role
export function useAuthRedirect() {
  const { user, isLoading, isAuthenticated } = useAuth()

  const getRedirectPath = useCallback(() => {
    if (!user) return '/login'
    
    switch (user.role) {
      case 'admin':
        return '/admin'
      case 'teacher':
        return '/teacher'
      case 'student':
      default:
        return '/student'
    }
  }, [user])

  return { user, isLoading, isAuthenticated, getRedirectPath }
}
