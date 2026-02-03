'use client'

import { useState, useEffect } from 'react'
import { AssignmentApi, AssignmentResponse } from '@/lib/api/services/assignment.api'
import { SubmissionApi, SubmissionResponse } from '@/lib/api/services/submission.api'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import {
  CheckCircle,
  Clock,
  User,
  FileText,
  Star,
  MessageSquare,
  Save,
  Download,
  Eye,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'

export default function GradeAssignmentPage() {
  const params = useParams()
  const assignmentId = parseInt(params.id as string)
  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null)
  const [submissions, setSubmissions] = useState<SubmissionResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeStudent, setActiveStudent] = useState<number | null>(null)
  const [grades, setGrades] = useState<{ [key: number]: number }>({})
  const [feedbacks, setFeedbacks] = useState<{ [key: number]: string }>({})
  const [savingId, setSavingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [assignmentId])

  const fetchData = async () => {
    try {
      // Fetch assignment
      const assignmentData = await AssignmentApi.getAssignmentById(assignmentId)
      setAssignment(assignmentData)

      // Fetch submissions
      const submissionsData = await SubmissionApi.getSubmissionsByAssignment(assignmentId)
      setSubmissions(submissionsData)
      
      if (submissionsData.length > 0) {
        setActiveStudent(submissionsData[0].id)
        // Initialize grades and feedbacks
        const initialGrades: { [key: number]: number } = {}
        const initialFeedbacks: { [key: number]: string } = {}
        submissionsData.forEach(sub => {
          initialGrades[sub.id] = sub.grade || 0
          initialFeedbacks[sub.id] = sub.feedback || ''
        })
        setGrades(initialGrades)
        setFeedbacks(initialFeedbacks)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Erreur lors du chargement des données')
    } finally {
      setLoading(false)
    }
  }

  const saveGrade = async (submissionId: number) => {
    setSavingId(submissionId)
    try {
      const updatedSubmission = await SubmissionApi.gradeSubmission(
        submissionId,
        grades[submissionId] || 0,
        feedbacks[submissionId] || undefined
      )

      // Update local state
      setSubmissions(submissions.map(sub =>
        sub.id === submissionId ? updatedSubmission : sub
      ))
      
      toast.success('Note enregistrée avec succès')
    } catch (error) {
      console.error('Error saving grade:', error)
      toast.error('Erreur lors de l\'enregistrement de la note')
    } finally {
      setSavingId(null)
    }
  }

  if (loading || !assignment) {
    return <Skeleton className="h-96" />
  }

  const activeSubmission = submissions.find(s => s.id === activeStudent)
  const gradedCount = submissions.filter(s => s.grade !== null).length

  return (
    <div className="space-y-6">
      <Link href="/teacher/assignments">
        <Button variant="outline" size="sm">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">{assignment.title}</h1>
        <p className="text-muted-foreground mt-2">
          {assignment.courseCode || 'N/A'} • Correction des devoirs
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
                  {submission.studentName || 'Étudiant Inconnu'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(submission.submittedAt).toLocaleDateString('fr-FR')}
                  {submission.isLate && (
                    <span className="text-orange-500 ml-2">(En retard)</span>
                  )}
                </div>
                {submission.grade !== null ? (
                  <Badge className="mt-2 bg-green-100 text-green-800">
                    Corrigé • {submission.grade}/20
                  </Badge>
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
                    {activeSubmission.studentName || 'Étudiant Inconnu'}
                  </CardTitle>
                  <CardDescription>
                    Soumis le {new Date(activeSubmission.submittedAt).toLocaleDateString('fr-FR')}
                    {activeSubmission.isLate && (
                      <span className="text-orange-500 ml-2">(En retard)</span>
                    )}
                  </CardDescription>
                </div>
                {activeSubmission.grade !== null && (
                  <Badge className="bg-green-100 text-green-800">
                    Corrigé • {activeSubmission.grade}/20
                  </Badge>
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
                  {/* File download/view */}
                  {activeSubmission.filePath ? (
                    <div className="flex items-center gap-3 p-4 border rounded-lg bg-muted/50">
                      <FileText className="h-10 w-10 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Document soumis</p>
                        <p className="text-sm text-muted-foreground">
                          {activeSubmission.filePath.split('/').pop()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={activeSubmission.filePath.startsWith('http') ? activeSubmission.filePath : `http://localhost:8080${activeSubmission.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Voir
                          </a>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a
                            href={activeSubmission.filePath.startsWith('http') ? activeSubmission.filePath : `http://localhost:8080${activeSubmission.filePath}`}
                            download
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-muted rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">
                        Aucun fichier soumis
                      </p>
                    </div>
                  )}
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
