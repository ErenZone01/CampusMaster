import { mockDb } from '../db.mock'

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submission_text: string | null
  file_url: string | null
  submitted_at: string
  grade: number | null
  feedback: string | null
  graded_at: string | null
  status: 'submitted' | 'graded'
}

export interface SubmissionCreate {
  assignment_id: string
  student_id: string
  submission_text?: string
  file_url?: string
}

export interface SubmissionUpdate {
  grade?: number
  feedback?: string
  graded_at?: string
  status?: 'submitted' | 'graded'
}

class SubmissionServiceClass {
  private submissions: Submission[] = []

  constructor() {
    this.initializeMockData()
  }

  private initializeMockData() {
    // Generate mock submissions for assignments
    const assignments = mockDb.assignments.slice(0, 30)
    const students = mockDb.users.filter((u: any) => u.role === 'student').slice(0, 30)

    this.submissions = []
    
    assignments.forEach((assignment: any, aIdx: number) => {
      // Random number of submissions per assignment (50-100% of students)
      const numSubmissions = Math.floor(students.length * (0.5 + Math.random() * 0.5))
      const selectedStudents = students.slice(0, numSubmissions)

      selectedStudents.forEach((student: any, sIdx: number) => {
        const submissionId = `sub-${aIdx}-${sIdx}`
        const daysAgo = Math.floor(Math.random() * 7)
        const isGraded = Math.random() > 0.4

        this.submissions.push({
          id: submissionId,
          assignment_id: assignment.id,
          student_id: student.id,
          submission_text: `Voici ma soumission pour ${assignment.title}. J'ai travaillé sur ce devoir pendant plusieurs heures et j'ai fait de mon mieux pour répondre à toutes les exigences.`,
          file_url: Math.random() > 0.5 ? `https://example.com/submissions/${submissionId}.pdf` : null,
          submitted_at: new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
          grade: isGraded ? Math.floor(60 + Math.random() * 40) : null,
          feedback: isGraded ? [
            'Bon travail ! Continue comme ça.',
            'Excellent devoir, très bien structuré.',
            'Bien, mais il y a quelques points à améliorer.',
            'Satisfaisant, mais manque de détails.',
            'Très bien rédigé et argumenté.'
          ][Math.floor(Math.random() * 5)] : null,
          graded_at: isGraded ? new Date(Date.now() - (daysAgo - 1) * 24 * 60 * 60 * 1000).toISOString() : null,
          status: isGraded ? 'graded' : 'submitted',
        })
      })
    })
  }

  async getSubmissions(filters?: { 
    assignment_id?: string
    student_id?: string
    status?: 'submitted' | 'graded'
  }): Promise<{ data: Submission[] }> {
    let filtered = [...this.submissions]

    if (filters?.assignment_id) {
      filtered = filtered.filter(s => s.assignment_id === filters.assignment_id)
    }

    if (filters?.student_id) {
      filtered = filtered.filter(s => s.student_id === filters.student_id)
    }

    if (filters?.status) {
      filtered = filtered.filter(s => s.status === filters.status)
    }

    // Sort by submission date (newest first)
    filtered.sort((a, b) => new Date(b.submitted_at).getTime() - new Date(a.submitted_at).getTime())

    return { data: filtered }
  }

  async getSubmissionById(id: string): Promise<{ data: Submission | null }> {
    const submission = this.submissions.find(s => s.id === id)
    return { data: submission || null }
  }

  async createSubmission(data: SubmissionCreate): Promise<{ data: Submission }> {
    const newSubmission: Submission = {
      id: `submission-${Date.now()}`,
      assignment_id: data.assignment_id,
      student_id: data.student_id,
      submission_text: data.submission_text || null,
      file_url: data.file_url || null,
      submitted_at: new Date().toISOString(),
      grade: null,
      feedback: null,
      graded_at: null,
      status: 'submitted',
    }

    this.submissions.push(newSubmission)
    return { data: newSubmission }
  }

  async updateSubmission(id: string, updates: SubmissionUpdate): Promise<{ data: Submission | null }> {
    const index = this.submissions.findIndex(s => s.id === id)
    if (index === -1) return { data: null }

    const submission = this.submissions[index]
    const updated: Submission = {
      ...submission,
      ...updates,
      // Auto-set graded_at if grade is being set
      graded_at: updates.grade !== undefined && !submission.graded_at 
        ? new Date().toISOString() 
        : updates.graded_at !== undefined 
          ? updates.graded_at 
          : submission.graded_at,
      // Auto-update status to graded if grade is set
      status: updates.grade !== undefined ? 'graded' : updates.status || submission.status,
    }

    this.submissions[index] = updated
    return { data: updated }
  }

  async deleteSubmission(id: string): Promise<{ success: boolean }> {
    const index = this.submissions.findIndex(s => s.id === id)
    if (index === -1) return { success: false }

    this.submissions.splice(index, 1)
    return { success: true }
  }
}

export const SubmissionService = new SubmissionServiceClass()
