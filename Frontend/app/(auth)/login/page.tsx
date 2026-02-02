'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useAuth, useAuthRedirect } from '@/hooks/use-auth'
import { Loader2, GraduationCap, BookOpen, Users, Award } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const { toast } = useToast()
  const { signIn } = useAuth()
  const { isAuthenticated, isLoading, getRedirectPath } = useAuthRedirect()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(getRedirectPath())
    }
  }, [isLoading, isAuthenticated, router, getRedirectPath])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast({ 
        title: 'Champs requis', 
        description: 'Veuillez remplir tous les champs', 
        variant: 'destructive' 
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await signIn(email, password)
      
      const user = result.user as any
      const redirectPath = user?.role === 'admin' 
        ? '/admin' 
        : user?.role === 'teacher' 
          ? '/teacher' 
          : '/student'
      
      toast({ 
        title: 'Connexion réussie', 
        description: 'Redirection en cours...',
        variant: 'success'
      })

      router.push(redirectPath)
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Identifiants incorrects'
      toast({ 
        title: 'Erreur de connexion', 
        description: message, 
        variant: 'destructive' 
      })
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const features = [
    { icon: BookOpen, title: 'Gestion des cours', desc: 'Accedez a vos cours et supports pedagogiques' },
    { icon: Users, title: 'Collaboration', desc: 'Echangez avec vos enseignants et camarades' },
    { icon: Award, title: 'Suivi des notes', desc: 'Consultez vos resultats en temps reel' },
  ]

  return (
    <div className="flex min-h-screen">
      {/* Left side - Illustration & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-primary relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-125 h-125 bg-white rounded-full translate-x-1/4 translate-y-1/4" />
        </div>
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
              <GraduationCap className="h-7 w-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">CampusMaster</span>
          </div>
          
          {/* Main illustration */}
          <div className="flex-1 flex items-center justify-center py-8">
            <div className="relative w-full max-w-lg">
              <Image
                src="/images/campus-illustration.jpg"
                alt="Illustration campus universitaire"
                width={600}
                height={400}
                className="rounded-2xl shadow-2xl"
                priority
              />
              {/* Floating stats cards */}
              <div className="absolute -top-4 -right-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-primary">2,500+</div>
                <div className="text-sm text-muted-foreground">Etudiants actifs</div>
              </div>
              <div className="absolute -bottom-4 -left-4 bg-white rounded-xl p-4 shadow-lg">
                <div className="text-2xl font-bold text-accent">150+</div>
                <div className="text-sm text-muted-foreground">Cours disponibles</div>
              </div>
            </div>
          </div>
          
          {/* Features */}
          <div className="grid grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm mb-3">
                  <feature.icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-white/70">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 xl:w-2/5 flex-col items-center justify-center min-h-screen px-8 sm:px-12 lg:px-16 xl:px-24 bg-background">
        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-12 w-full max-w-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary">
            <GraduationCap className="h-6 w-6 text-white" />
          </div>
          <span className="text-xl font-bold text-foreground">CampusMaster</span>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Bienvenue
            </h1>
            <p className="text-muted-foreground">
              Connectez-vous a votre espace personnel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">
                Adresse email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nom@universite.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 px-4"
                disabled={isSubmitting}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mot de passe
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 px-4"
                disabled={isSubmitting}
                autoComplete="current-password"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-muted-foreground text-center">
          2026 CampusMaster. Plateforme de gestion universitaire.
        </p>
      </div>
    </div>
  )
}
