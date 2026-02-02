'use client'

import { useState, useEffect } from 'react'
import { AssignmentService, SubmissionService, UserService, CourseService } from '@/lib/mock'
import { useRequireAuth } from '@/hooks/use-auth'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  CheckCircle,
  Clock,
  User,
  FileText,
  Star,
  MessageSquare,
  Save,
} from 'lucide-react'

interface Submission {
  id: string
  student_id: string
  student?: { first_name: string; last_name: string }
  submission_text: string | null
  submitted_at: string
  grade: number | null
  feedback: string | null
  graded_at: string | null
}

interface Assignment {
  id: string
  title: string
  description: string
  course?: { name: string; code: string }
}

export default function GradeAssignmentPage() {
  useRequireAuth(['teacher'])

  const params = useParams()
  const assignmentId = params.id as string
  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStudent, setActiveStudent] = useState<string | null>(null)
  const [grades, setGrades] = useState<{ [key: string]: number }>({})
  const [feedbacks, setFeedbacks] = useState<{ [key: string]: string }>({})
  const [savingId, setSavingId] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    try {
      // Fetch assignment
      const assignmentResponse = await AssignmentService.getAssignmentById(assignmentId)
      if (!assignmentResponse.data) throw new Error('Devoir introuvable')

      const assignmentData = assignmentResponse.data
      
      // Fetch course for assignment
      const courseResponse = await CourseService.getCourseById(assignmentData.course_id)
      const course = courseResponse.data

      setAssignment({
        id: assignmentData.id,
        title: assignmentData.title,
        description: assignmentData.description || '',
        course: course ? { name: course.name, code: course.code } : undefined,
      })

      // Fetch submissions
      const submissionsResponse = await SubmissionService.getSubmissions({ assignment_id: assignmentId })
      const submissionsData = submissionsResponse.data || []

      // Enrich submissions with student data
      const enrichedSubmissions = await Promise.all(
        submissionsData.map(async (sub) => {
          const userResponse = await UserService.getUserById(sub.student_id)
          const user = userResponse.data
          return {
            ...sub,
            student: user ? {
              first_name: user.first_name || '',
              last_name: user.last_name || '',
            } : { first_name: 'Inconnu', last_name: '' },
          }
        })
      )

      setSubmissions(enrichedSubmissions)
      if (enrichedSubmissions.length > 0) {
        setActiveStudent(enrichedSubmissions[0].id)
        // Initialize grades and feedbacks
        const initialGrades: { [key: string]: number } = {}
        const initialFeedbacks: { [key: string]: string } = {}
        enrichedSubmissions.forEach(sub => {
          initialGrades[sub.id] = sub.grade || 0
          initialFeedbacks[sub.id] = sub.feedback || ''
        })
        setGrades(initialGrades)
        setFeedbacks(initialFeedbacks)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveGrade = async (submissionId: string) => {
    setSavingId(submissionId)
    try {
      await SubmissionService.updateSubmission(submissionId, {
        grade: grades[submissionId] || 0,
        feedback: feedbacks[submissionId] || '',
        graded_at: new Date().toISOString(),
      })

      // Update local state
      setSubmissions(submissions.map(sub =>
        sub.id === submissionId
          ? {
              ...sub,
              grade: grades[submissionId] || 0,
              feedback: feedbacks[submissionId] || '',
              graded_at: new Date().toISOString(),
            }
          : sub
      ))
    } catch (error) {
      console.error('Error saving grade:', error)
    } finally {
      setSavingId(null)
    }
  }

  if (loading || !assignment) {
    return <Skeleton className="h-96" />
  }

  const activeSubmission = submissions.find(s => s.id === activeStudent)
  const gradedCount = submissions.filter(s => s.graded_at).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground mt-2">
          {assignment.course?.code || 'N/A'} • Correction des devoirs
        </p>
      </div>

      {/* Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Progression</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>{gradedCount} sur {submissions.length} corrigés</span>
              <span className="font-semibold">
                {submissions.length > 0 ? Math.round((gradedCount / submissions.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all"
                style={{ width: `${submissions.length > 0 ? (gradedCount / submissions.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Submissions List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Soumissions ({submissions.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 max-h-96 overflow-y-auto">
            {submissions.map(submission => (
              <button
                key={submission.id}
                onClick={() => setActiveStudent(submission.id)}
                className={`w-full text-left p-3 rounded-lg border transition-colors ${
                  activeStudent === submission.id
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-muted border-muted'
                }`}
              >
                <div className="font-semibold text-sm">
                  {submission.student?.first_name || 'Étudiant'} {submission.student?.last_name || 'Inconnu'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(submission.submitted_at).toLocaleDateString('fr-FR')}
                </div>
                {submission.graded_at ? (
                  <Badge className="mt-2 bg-green-100 text-green-800">Corrigé</Badge>
                ) : (
                  <Badge className="mt-2 bg-yellow-100 text-yellow-800">À corriger</Badge>
                )}
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Grading Panel */}
        {activeSubmission && (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {activeSubmission.student?.first_name || 'Étudiant'} {activeSubmission.student?.last_name || 'Inconnu'}
                  </CardTitle>
                  <CardDescription>
                    Soumis le {new Date(activeSubmission.submitted_at).toLocaleDateString('fr-FR')}
                  </CardDescription>
                </div>
                {activeSubmission.graded_at && (
                  <Badge className="bg-green-100 text-green-800">Corrigé</Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Tabs defaultValue="submission" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="submission">Soumission</TabsTrigger>
                  <TabsTrigger value="grade">Notation & Commentaires</TabsTrigger>
                </TabsList>

                <TabsContent value="submission" className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-sm whitespace-pre-wrap">
                      {activeSubmission.submission_text || 'Aucun texte soumis'}
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="grade" className="space-y-4">
                  {/* Grade */}
                  <div>
                    <Label htmlFor="grade" className="text-base mb-2 block">
                      Note sur 20
                    </Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="20"
                      value={grades[activeSubmission.id] || 0}
                      onChange={(e) =>
                        setGrades({
                          ...grades,
                          [activeSubmission.id]: parseFloat(e.target.value) || 0,
                        })
                      }
                      placeholder="0"
                      className="text-lg"
                    />
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback" className="text-base mb-2 block">
                      Commentaires et feedback
                    </Label>
                    <Textarea
                      id="feedback"
                      value={feedbacks[activeSubmission.id] || ''}
                      onChange={(e) =>
                        setFeedbacks({
                          ...feedbacks,
                          [activeSubmission.id]: e.target.value,
                        })
                      }
                      placeholder="Entrez vos commentaires pour l'étudiant..."
                      className="min-h-32"
                    />
                  </div>

                  {/* Save Button */}
                  <Button
                    onClick={() => saveGrade(activeSubmission.id)}
                    disabled={savingId === activeSubmission.id}
                    className="w-full"
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {savingId === activeSubmission.id ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
