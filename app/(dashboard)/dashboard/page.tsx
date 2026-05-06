'use client'

import { useEffect, useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { createClient } from '@/lib/supabase/client'
import { UserProfile, Application } from '@/types'
import { BarChart3, Briefcase, BookmarkCheck, Calendar, Globe2, Zap, TrendingUp, AlertCircle, FileText, Brain, DollarSign, BookOpen, Target, Star } from 'lucide-react'
import Link from 'next/link'
import { CareerBot } from '@/components/chatbot/career-bot'
import axios from 'axios'

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [showBot, setShowBot] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [profileRes, appsRes] = await Promise.all([
          axios.get('/api/profile'),
          axios.get('/api/applications'),
        ])
        setProfile(profileRes.data)
        setApplications(appsRes.data || [])
      } catch {
        // redirect to login if unauthorized
      }
      setLoading(false)
    }
    load()
  }, [])

  const stats = {
    applied: applications.filter(a => a.status === 'applied').length,
    saved: applications.filter(a => a.status === 'saved').length,
    interviews: applications.filter(a => a.status === 'interview').length,
    offers: applications.filter(a => a.status === 'offer').length,
  }

  const resumeStrength = profile ? Math.min(100, Math.round(
    (profile.skills?.length > 0 ? 20 : 0) +
    (profile.experience_years > 0 ? 20 : 0) +
    (profile.resume_url ? 20 : 0) +
    (profile.linkedin_url ? 15 : 0) +
    (profile.summary ? 15 : 0) +
    (profile.job_titles?.length > 0 ? 10 : 0)
  )) : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-24 px-4 max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-32 rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        {/* Welcome banner */}
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-primary/20 via-blue-500/10 to-cyan-500/10 border border-primary/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}! 👋
              </h1>
              <p className="text-muted-foreground">Your AI job search is active. Let&apos;s find your next opportunity.</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowBot(true)} className="gap-2 bg-primary hover:bg-primary/90">
                <Zap className="h-4 w-4" /> Ask CareerBot
              </Button>
              <Link href="/jobs">
                <Button variant="outline" className="gap-2">
                  <Globe2 className="h-4 w-4" /> Find Jobs
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Applied', value: stats.applied, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-400/10' },
            { label: 'Saved', value: stats.saved, icon: BookmarkCheck, color: 'text-yellow-400', bg: 'bg-yellow-400/10' },
            { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-green-400', bg: 'bg-green-400/10' },
            { label: 'Offers', value: stats.offers, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-400/10' },
          ].map((stat, i) => (
            <Card key={i} className="p-5 border-border/50">
              <div className={`inline-flex p-2 rounded-lg ${stat.bg} mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Resume strength */}
          <Card className="p-5 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="h-4 w-4 text-primary" />
              <h3 className="font-semibold">Profile Strength</h3>
            </div>
            <div className="text-4xl font-bold gradient-text mb-2">{resumeStrength}%</div>
            <Progress value={resumeStrength} className="mb-4" />
            <div className="space-y-2 text-sm">
              {[
                { label: 'Skills added', done: (profile?.skills?.length || 0) > 0 },
                { label: 'Experience set', done: (profile?.experience_years || 0) > 0 },
                { label: 'Resume uploaded', done: !!profile?.resume_url },
                { label: 'LinkedIn linked', done: !!profile?.linkedin_url },
                { label: 'Profile summary', done: !!profile?.summary },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 text-muted-foreground">
                  <span className={item.done ? 'text-green-400' : 'text-muted-foreground/30'}>
                    {item.done ? '✓' : '○'}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
            <Link href="/profile" className="mt-4 block">
              <Button size="sm" variant="outline" className="w-full">Complete Profile</Button>
            </Link>
          </Card>

          {/* Quick actions */}
          <Card className="p-5 border-border/50">
            <h3 className="font-semibold mb-4">Quick Search</h3>
            <div className="space-y-2">
              {[
                { label: '🌍 Remote jobs worldwide', href: '/jobs?q=remote&remote=true' },
                { label: '✈️ Visa sponsored roles', href: '/jobs?q=software engineer&sponsorship=true' },
                { label: '💼 Freelance projects', href: '/freelance' },
                { label: '🤖 QA automation jobs', href: '/jobs?q=QA automation engineer' },
                { label: '🚀 AI/ML opportunities', href: '/jobs?q=AI engineer machine learning' },
              ].map((item, i) => (
                <Link key={i} href={item.href}>
                  <Button variant="ghost" className="w-full justify-start text-sm h-9">{item.label}</Button>
                </Link>
              ))}
            </div>
          </Card>

          {/* Profile completeness tips */}
          <Card className="p-5 border-border/50">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <h3 className="font-semibold">AI Career Tips</h3>
            </div>
            <div className="space-y-3 text-sm text-muted-foreground">
              {profile?.skills && profile.skills.length > 0 ? (
                <>
                  <p>✅ Your top skills: <span className="text-foreground">{profile.skills.slice(0, 3).join(', ')}</span></p>
                  {profile.needs_visa && <p>🔍 Filter is set for visa sponsorship roles</p>}
                  {profile.preferred_countries?.length > 0 && <p>🌍 Target countries: {profile.preferred_countries.slice(0, 2).join(', ')}</p>}
                  <p>💡 Apply to 5+ jobs/day to increase callback rate by 3x</p>
                  <p>📅 Tuesday–Thursday 9am–11am is the best time to apply</p>
                </>
              ) : (
                <>
                  <p>👉 Add your skills to enable AI job matching</p>
                  <p>📄 Upload your resume for automatic profile parsing</p>
                  <p>🎯 Set target job titles to personalize search</p>
                </>
              )}
            </div>
          </Card>
        </div>

        {/* AI Feature Hub */}
        <div className="mt-8">
          <h2 className="font-semibold text-lg mb-4">AI Feature Hub</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { href: '/resume', icon: FileText, label: 'Resume Studio', color: 'text-blue-400', bg: 'bg-blue-400/10', desc: 'ATS optimize' },
              { href: '/interview', icon: Brain, label: 'Mock Interview', color: 'text-purple-400', bg: 'bg-purple-400/10', desc: 'AI practice' },
              { href: '/applications', icon: Briefcase, label: 'App Copilot', color: 'text-primary', bg: 'bg-primary/10', desc: 'Track pipeline' },
              { href: '/salary', icon: DollarSign, label: 'Salary Intel', color: 'text-green-400', bg: 'bg-green-400/10', desc: 'Know your worth' },
              { href: '/learn', icon: BookOpen, label: 'Learning Path', color: 'text-yellow-400', bg: 'bg-yellow-400/10', desc: 'Close gaps' },
              { href: '/coaching', icon: Target, label: 'Career Coach', color: 'text-red-400', bg: 'bg-red-400/10', desc: 'Weekly plans' },
            ].map(item => (
              <Link key={item.href} href={item.href}>
                <Card className="p-4 border-border/50 hover:border-primary/30 transition-colors cursor-pointer text-center h-full">
                  <div className={`inline-flex p-2.5 rounded-xl ${item.bg} mb-2`}>
                    <item.icon className={`h-5 w-5 ${item.color}`} />
                  </div>
                  <div className="font-medium text-sm">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.desc}</div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Profile Visibility Boost */}
        <Card className="mt-6 p-5 border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-2.5 rounded-xl bg-primary/10 shrink-0">
                <Star className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Profile Visibility Boost</h3>
                <p className="text-sm text-muted-foreground">Complete your profile to appear in recruiter searches. Profiles with a photo, skills, and resume get <span className="text-primary font-medium">4x more recruiter views</span>.</p>
                <div className="flex flex-wrap gap-3 mt-3">
                  {[
                    { label: 'Complete Profile', done: resumeStrength >= 80 },
                    { label: 'Add LinkedIn', done: !!profile?.linkedin_url },
                    { label: 'Upload Resume', done: !!profile?.resume_url },
                    { label: 'Add 5+ Skills', done: (profile?.skills?.length || 0) >= 5 },
                  ].map(item => (
                    <div key={item.label} className={`flex items-center gap-1.5 text-xs ${item.done ? 'text-green-400' : 'text-muted-foreground'}`}>
                      {item.done ? '✓' : '○'} {item.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <Link href="/profile" className="shrink-0">
              <Button size="sm" className="bg-primary hover:bg-primary/90">Boost Profile</Button>
            </Link>
          </div>
        </Card>

        {/* Recent applications */}
        {applications.length > 0 && (
          <Card className="mt-6 p-5 border-border/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Recent Applications</h3>
              <Link href="/applications"><Button size="sm" variant="outline">View All</Button></Link>
            </div>
            <div className="space-y-3">
              {applications.slice(0, 5).map(app => (
                <div key={app.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                  <div>
                    <div className="font-medium text-sm">{app.position}</div>
                    <div className="text-xs text-muted-foreground">{app.company}</div>
                  </div>
                  <Badge className={
                    app.status === 'offer' ? 'bg-green-500/10 text-green-400 border-green-500/30 border' :
                    app.status === 'interview' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 border' :
                    app.status === 'applied' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30 border' :
                    'bg-muted text-muted-foreground border-border border'
                  }>{app.status}</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {showBot && <CareerBot onClose={() => setShowBot(false)} />}
    </div>
  )
}
