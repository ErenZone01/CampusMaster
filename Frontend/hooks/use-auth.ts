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
  if (typeof window !== 'undefined' && window.location.pathname.startsWith('/login')) {
    return null
  }
  try {
    const result = await AuthService.getCurrentUser()
    return result.success ? result.data || null : null
  } catch (error) {
    return null
  }
}

export function useAuth() {
  const router = useRouter()
  const { data: user, error, isLoading, mutate } = useSWR<UserPublic | null>(
    'current-user',
    fetchCurrentUser,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
      dedupingInterval: 60000, // Cache for 1 minute
      focusThrottleInterval: 300000, // 5 minutes
    }
  )

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
  const { user, isLoading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Only check when loading is complete
    if (isLoading) return

    // Check authentication
    if (!isAuthenticated) {
      router.push('/login')
      return
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      const redirectPath = user.role === 'admin' 
        ? '/admin' 
        : user.role === 'teacher' 
          ? '/teacher' 
          : '/student'
      router.push(redirectPath)
    }
  }, [isLoading, isAuthenticated, user?.role, allowedRoles, router])

  return { user, isLoading, isAuthenticated }
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
