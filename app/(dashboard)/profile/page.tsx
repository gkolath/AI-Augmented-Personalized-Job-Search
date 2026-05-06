'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Save, Plus, X, Upload, Loader2, User } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

const COUNTRIES = ['USA', 'UK', 'Canada', 'Germany', 'Australia', 'UAE', 'Singapore', 'Netherlands', 'France', 'India', 'Remote']
const SKILL_SUGGESTIONS = ['JavaScript', 'TypeScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'AWS', 'Docker', 'Selenium', 'Playwright', 'Cypress', 'Jest', 'API Testing', 'CI/CD', 'Git', 'Agile', 'Scrum']

export default function ProfilePage() {
  const [profile, setProfile] = useState<{
    full_name: string; phone: string; linkedin_url: string; github_url: string;
    skills: string[]; experience_years: number; experience_level: string;
    preferred_countries: string[]; needs_visa: boolean;
    expected_salary_min: number; expected_salary_max: number; salary_currency: string;
    job_titles: string[]; freelance_interest: boolean;
    work_mode: string[]; summary: string; resume_url?: string; resume_text?: string;
  }>({
    full_name: '', phone: '', linkedin_url: '', github_url: '',
    skills: [], experience_years: 0, experience_level: 'mid',
    preferred_countries: [], needs_visa: false,
    expected_salary_min: 0, expected_salary_max: 0, salary_currency: 'USD',
    job_titles: [], freelance_interest: false,
    work_mode: ['remote'], summary: '', resume_text: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [titleInput, setTitleInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  async function getSupabase() {
    const { createClient: mkClient } = await import('@/lib/supabase/client')
    return mkClient()
  }

  useEffect(() => {
    axios.get('/api/profile').then(({ data }) => {
      if (data) setProfile({ ...profile, ...data })
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function save() {
    setSaving(true)
    try {
      await axios.patch('/api/profile', profile)
      toast.success('Profile saved!')
    } catch {
      toast.error('Save failed. Please log in.')
    }
    setSaving(false)
  }

  function addSkill(skill: string) {
    const s = skill.trim()
    if (s && !profile.skills.includes(s)) {
      setProfile(p => ({ ...p, skills: [...p.skills, s] }))
    }
    setSkillInput('')
  }

  function addTitle(title: string) {
    const t = title.trim()
    if (t && !profile.job_titles.includes(t)) {
      setProfile(p => ({ ...p, job_titles: [...p.job_titles, t] }))
    }
    setTitleInput('')
  }

  function toggleCountry(c: string) {
    setProfile(p => ({
      ...p,
      preferred_countries: p.preferred_countries.includes(c)
        ? p.preferred_countries.filter(x => x !== c)
        : [...p.preferred_countries, c]
    }))
  }

  function toggleWorkMode(m: string) {
    setProfile(p => ({
      ...p,
      work_mode: p.work_mode.includes(m) ? p.work_mode.filter(x => x !== m) : [...p.work_mode, m]
    }))
  }

  async function uploadResume(file: File) {
    const supabase = await getSupabase()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('Please verify your email first, then log back in to upload files. You can paste your resume text below in the meantime.')
      return
    }

    const { data, error } = await supabase.storage
      .from('resumes')
      .upload(`${user.id}/resume.${file.name.split('.').pop()}`, file, { upsert: true })

    if (error) { toast.error('Upload failed: ' + error.message); return }

    const { data: { publicUrl } } = supabase.storage.from('resumes').getPublicUrl(data!.path)
    setProfile(p => ({ ...p, resume_url: publicUrl }))
    toast.success('Resume uploaded!')
  }

  if (loading) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground text-sm">Complete your profile to get better AI job matches</p>
          </div>
          <Button onClick={save} disabled={saving} className="gap-2 bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </Button>
        </div>

        <div className="space-y-6">
          {/* Basic info */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <User className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Basic Information</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Full Name</Label>
                <Input className="mt-1" value={profile.full_name} onChange={e => setProfile(p => ({ ...p, full_name: e.target.value }))} placeholder="John Doe" />
              </div>
              <div>
                <Label>Phone</Label>
                <Input className="mt-1" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+1 234 567 8900" />
              </div>
              <div>
                <Label>LinkedIn URL</Label>
                <Input className="mt-1" value={profile.linkedin_url} onChange={e => setProfile(p => ({ ...p, linkedin_url: e.target.value }))} placeholder="linkedin.com/in/yourname" />
              </div>
              <div>
                <Label>GitHub URL</Label>
                <Input className="mt-1" value={profile.github_url} onChange={e => setProfile(p => ({ ...p, github_url: e.target.value }))} placeholder="github.com/yourname" />
              </div>
            </div>
            <div className="mt-4">
              <Label>Professional Summary</Label>
              <textarea
                className="mt-1 w-full h-24 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                value={profile.summary}
                onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))}
                placeholder="Brief summary of your experience and goals..."
              />
            </div>
          </Card>

          {/* Resume */}
          <Card className="p-6 border-border/50">
            <div className="flex items-center gap-2 mb-5">
              <Upload className="h-4 w-4 text-primary" />
              <h2 className="font-semibold">Resume</h2>
            </div>

            {/* Option 1: Paste text (always available) */}
            <div className="mb-4">
              <Label className="mb-1 block text-sm">Paste Resume Text <span className="text-muted-foreground font-normal">(recommended — powers AI features)</span></Label>
              <textarea
                className="w-full h-36 rounded-lg border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Paste the full text of your resume here — used for AI job matching, interview prep, and resume analysis..."
                value={profile.resume_text || ''}
                onChange={e => setProfile(p => ({ ...p, resume_text: e.target.value }))}
              />
              {profile.resume_text && (
                <p className="mt-1 text-xs text-green-400">✓ Resume text saved ({profile.resume_text.length} characters)</p>
              )}
            </div>

            {/* Option 2: Upload file (requires verified login) */}
            <div>
              <Label className="mb-1 block text-sm text-muted-foreground">Or upload PDF / DOCX (requires email verification)</Label>
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-border/50 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-muted/20 transition-colors">
                <Upload className="h-5 w-5 text-muted-foreground mb-1" />
                <span className="text-sm text-muted-foreground">Click to upload</span>
                <input type="file" accept=".pdf,.docx,.doc" className="hidden" onChange={e => e.target.files?.[0] && uploadResume(e.target.files[0])} />
              </label>
              {profile.resume_url && (
                <p className="mt-2 text-xs text-green-400">✓ File uploaded</p>
              )}
            </div>
          </Card>

          {/* Experience */}
          <Card className="p-6 border-border/50">
            <h2 className="font-semibold mb-5">Experience</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Years of Experience</Label>
                <Input type="number" className="mt-1" value={profile.experience_years} onChange={e => setProfile(p => ({ ...p, experience_years: Number(e.target.value) }))} min={0} max={40} />
              </div>
              <div>
                <Label>Level</Label>
                <Select value={profile.experience_level} onValueChange={v => setProfile(p => ({ ...p, experience_level: v ?? "mid" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entry Level (0-2 yrs)</SelectItem>
                    <SelectItem value="mid">Mid Level (3-5 yrs)</SelectItem>
                    <SelectItem value="senior">Senior (6-10 yrs)</SelectItem>
                    <SelectItem value="lead">Lead/Principal (10+ yrs)</SelectItem>
                    <SelectItem value="executive">Executive/C-Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Skills */}
          <Card className="p-6 border-border/50">
            <h2 className="font-semibold mb-5">Skills</h2>
            <div className="flex gap-2 mb-3">
              <Input
                placeholder="Add a skill..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill(skillInput))}
                className="flex-1"
              />
              <Button size="icon" onClick={() => addSkill(skillInput)} variant="outline"><Plus className="h-4 w-4" /></Button>
            </div>
            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {SKILL_SUGGESTIONS.filter(s => !profile.skills.includes(s)).slice(0, 8).map(skill => (
                <button key={skill} onClick={() => addSkill(skill)} className="text-xs px-2.5 py-1 rounded-full border border-border/50 bg-muted hover:border-primary/50 hover:text-primary transition-colors">
                  + {skill}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <Badge key={skill} className="gap-1.5 pr-1 bg-primary/10 text-primary border-primary/20 border">
                  {skill}
                  <button onClick={() => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }))} className="hover:text-destructive">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </Card>

          {/* Job Preferences */}
          <Card className="p-6 border-border/50">
            <h2 className="font-semibold mb-5">Job Preferences</h2>

            <div className="mb-4">
              <Label className="mb-2 block">Target Job Titles</Label>
              <div className="flex gap-2 mb-2">
                <Input placeholder="e.g. QA Engineer, SDET..." value={titleInput} onChange={e => setTitleInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTitle(titleInput))} className="flex-1" />
                <Button size="icon" onClick={() => addTitle(titleInput)} variant="outline"><Plus className="h-4 w-4" /></Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profile.job_titles.map(t => (
                  <Badge key={t} className="gap-1.5 pr-1">
                    {t}
                    <button onClick={() => setProfile(p => ({ ...p, job_titles: p.job_titles.filter(x => x !== t) }))}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="mb-4">
              <Label className="mb-2 block">Work Mode</Label>
              <div className="flex gap-2 flex-wrap">
                {['remote', 'hybrid', 'onsite'].map(mode => (
                  <button
                    key={mode}
                    onClick={() => toggleWorkMode(mode)}
                    className={`px-4 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                      profile.work_mode.includes(mode) ? 'bg-primary text-white border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="mb-4">
              <Label className="mb-2 block">Target Countries</Label>
              <div className="flex flex-wrap gap-2">
                {COUNTRIES.map(c => (
                  <button
                    key={c}
                    onClick={() => toggleCountry(c)}
                    className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                      profile.preferred_countries.includes(c) ? 'bg-primary text-white border-primary' : 'border-border/50 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label>Min Salary</Label>
                <Input type="number" className="mt-1" value={profile.expected_salary_min || ''} onChange={e => setProfile(p => ({ ...p, expected_salary_min: Number(e.target.value) }))} placeholder="50000" />
              </div>
              <div>
                <Label>Max Salary</Label>
                <Input type="number" className="mt-1" value={profile.expected_salary_max || ''} onChange={e => setProfile(p => ({ ...p, expected_salary_max: Number(e.target.value) }))} placeholder="100000" />
              </div>
              <div>
                <Label>Currency</Label>
                <Select value={profile.salary_currency} onValueChange={v => setProfile(p => ({ ...p, salary_currency: v ?? "USD" }))}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['USD', 'GBP', 'EUR', 'AED', 'CAD', 'AUD', 'INR', 'SGD'].map(c => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={profile.needs_visa} onChange={e => setProfile(p => ({ ...p, needs_visa: e.target.checked }))} className="rounded" />
                <span className="text-sm">I need visa sponsorship</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={profile.freelance_interest} onChange={e => setProfile(p => ({ ...p, freelance_interest: e.target.checked }))} className="rounded" />
                <span className="text-sm">Interested in freelance</span>
              </label>
            </div>
          </Card>

          <Button onClick={save} disabled={saving} className="w-full gap-2 h-12 bg-primary hover:bg-primary/90">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
