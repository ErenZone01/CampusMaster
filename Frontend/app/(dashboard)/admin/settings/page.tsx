'use client'

import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Settings, Save } from 'lucide-react'

interface SystemSettings {
  academic_year: string
  grading_scale_max: number
  grading_scale_min: number
  passing_grade: number
  notifications_enabled: boolean
  notification_email: string
  maintenance_mode: boolean
  system_name: string
  logo_url: string
}

export default function AdminSettingsPage() {
  useRequireAuth(['admin'])

  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      // Mock: Use default settings stored in localStorage
      const stored = localStorage.getItem('system_settings')
      if (stored) {
        setSettings(JSON.parse(stored))
      } else {
        // Default settings
        const defaults = {
          academic_year: new Date().getFullYear().toString(),
          grading_scale_max: 20,
          grading_scale_min: 0,
          passing_grade: 10,
          notifications_enabled: true,
          notification_email: 'admin@campus.com',
          maintenance_mode: false,
          system_name: 'CampusMaster',
          logo_url: '/images/logo.png',
        }
        setSettings(defaults)
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      // Mock: Save to localStorage
      localStorage.setItem('system_settings', JSON.stringify(settings))

      toast({
        description: 'Paramètres sauvegardés avec succès',
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        description: 'Erreur lors de la sauvegarde des paramètres',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="space-y-6">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-48" />
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Paramètres système</h1>
          <p className="text-muted-foreground">
            Configurez les paramètres généraux du système
          </p>
        </div>
      </div>

      {/* Academic Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Paramètres académiques
          </CardTitle>
          <CardDescription>Configuration de l'année académique et de la notation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="academic_year">Année académique</Label>
              <Input
                id="academic_year"
                value={settings.academic_year}
                onChange={(e) =>
                  setSettings({ ...settings, academic_year: e.target.value })
                }
                placeholder="2024-2025"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="system_name">Nom du système</Label>
              <Input
                id="system_name"
                value={settings.system_name}
                onChange={(e) =>
                  setSettings({ ...settings, system_name: e.target.value })
                }
                placeholder="CampusMaster"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grading_scale_max">Note maximale</Label>
              <Input
                id="grading_scale_max"
                type="number"
                value={settings.grading_scale_max}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    grading_scale_max: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grading_scale_min">Note minimale</Label>
              <Input
                id="grading_scale_min"
                type="number"
                value={settings.grading_scale_min}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    grading_scale_min: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="passing_grade">Note de passage</Label>
              <Input
                id="passing_grade"
                type="number"
                value={settings.passing_grade}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    passing_grade: parseInt(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="logo_url">URL du logo</Label>
              <Input
                id="logo_url"
                value={settings.logo_url}
                onChange={(e) =>
                  setSettings({ ...settings, logo_url: e.target.value })
                }
                placeholder="/images/logo.png"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Configuration des notifications système</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="notifications">Activer les notifications</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par email aux utilisateurs
              </p>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications_enabled}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, notifications_enabled: checked })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notification_email">Email de notification</Label>
            <Input
              id="notification_email"
              type="email"
              value={settings.notification_email}
              onChange={(e) =>
                setSettings({ ...settings, notification_email: e.target.value })
              }
              placeholder="notifications@campusmaster.com"
              disabled={!settings.notifications_enabled}
            />
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance</CardTitle>
          <CardDescription>Options de maintenance du système</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenance">Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Mettez le système en mode maintenance pour les réparations
              </p>
            </div>
            <Switch
              id="maintenance"
              checked={settings.maintenance_mode}
              onCheckedChange={(checked) =>
                setSettings({ ...settings, maintenance_mode: checked })
              }
            />
          </div>

          {settings.maintenance_mode && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-md">
              <p className="font-semibold">⚠️ Mode maintenance activé</p>
              <p className="text-sm mt-1">
                Les utilisateurs verront un message de maintenance et ne pourront pas accéder à la plateforme.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          size="lg"
          className="gap-2"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </Button>
      </div>
    </div>
  )
}
