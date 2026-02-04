import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/lib/mock'

/**
 * Mock avatar upload endpoint
 * In production, this would upload to cloud storage
 * For now, we'll simulate it with a placeholder
 */
export async function POST(request: NextRequest) {
  try {
    // Verify user is authenticated
    const result = await AuthService.getCurrentUser()
    
    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = result.data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || userId !== user.id) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // In mock mode, return a placeholder avatar URL
    // In production, this would upload to real storage
    const mockAvatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`

    return NextResponse.json({ publicUrl: mockAvatarUrl })
  } catch (error) {
    console.error('Error uploading avatar:', error)
    return NextResponse.json(
      { error: 'Upload failed', details: String(error) },
      { status: 500 }
    )
  }
}
