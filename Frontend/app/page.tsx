import { redirect } from 'next/navigation'
import { AuthService } from '@/lib/mock'

export default async function HomePage() {
  // Check if user is logged in
  const result = await AuthService.getCurrentUser()

  // If user is logged in, redirect to their dashboard
  if (result.success && result.data) {
    const user = result.data

    switch (user.role) {
      case 'student':
        redirect('/student')
      case 'teacher':
        redirect('/teacher')
      case 'admin':
        redirect('/admin')
      default:
        redirect('/student')
    }
  }

  // If not logged in, redirect to login page
  redirect('/login')
}
