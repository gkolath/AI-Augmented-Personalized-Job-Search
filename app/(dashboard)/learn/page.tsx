'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Target, Zap, ExternalLink, Play, Clock, CheckCircle, AlertCircle, TrendingUp, RefreshCw } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { LearningPath, SkillGap, LearningModule } from '@/types'

const IMPORTANCE_COLOR = {
  critical: 'bg-red-500/10 text-red-400 border-red-500/30',
  important: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  'nice-to-have': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
}

const LEVEL_WIDTH: Record<string, number> = { none: 0, beginner: 25, intermediate: 55, advanced: 80, expert: 100 }

const TYPE_ICON: Record<string, string> = { video: '🎬', course: '📚', project: '🛠', reading: '📖', practice: '💻' }

export default function LearnPage() {
  const [targetRole, setTargetRole] = useState('')
  const [currentSkillsInput, setCurrentSkillsInput] = useState('')
  const [experienceYears, setExperienceYears] = useState('3')
  const [hoursPerDay, setHoursPerDay] = useState('2')
  const [path, setPath] = useState<LearningPath | null>(null)
  const [loading, setLoading] = useState(false)
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set())

  async function generatePath() {
    if (!targetRole.trim()) { toast.error('Enter your target role first'); return }
    setLoading(true)
    try {
      const currentSkills = currentSkillsInput.split(',').map(s => s.trim()).filter(Boolean)
      const { data } = await axios.post('/api/ai/learning-path', {
        currentSkills,
        targetRole,
        experienceYears: parseInt(experienceYears),
        hoursPerDay: parseInt(hoursPerDay),
      })
      setPath(data.path)
      toast.success('Learning path generated!')
    } catch { toast.error('Failed to generate learning path') }
    setLoading(false)
  }

  function toggleModule(id: string) {
    setCompletedModules(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
  }

  const completionPct = path
    ? Math.round((completedModules.size / (path.learning_modules?.length || 1)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Learning Accelerator</h1>
          </div>
          <p className="text-muted-foreground">Personalized skill paths tied to your target role — close gaps in weeks, not months</p>
        </div>

        {/* Setup Form */}
        <Card className="p-6 border-border/50 mb-8">
          <h3 className="font-semibold mb-4 flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Build Your Learning Path</h3>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Target Role *</label>
              <input
                className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. Senior React Developer, Data Scientist"
                value={targetRole}
                onChange={e => setTargetRole(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Current Skills (comma-separated)</label>
              <input
                className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="e.g. JavaScript, React, SQL"
                value={currentSkillsInput}
                onChange={e => setCurrentSkillsInput(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Years of Experience</label>
              <select
                className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none"
                value={experienceYears}
                onChange={e => setExperienceYears(e.target.value)}
              >
                {['0','1','2','3','5','7','10'].map(y => <option key={y} value={y}>{y === '0' ? 'No experience' : `${y}+ years`}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Hours Available Per Day</label>
              <select
                className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none"
                value={hoursPerDay}
                onChange={e => setHoursPerDay(e.target.value)}
              >
                {['1','2','3','4','6'].map(h => <option key={h} value={h}>{h} hour{parseInt(h) > 1 ? 's' : ''}/day</option>)}
              </select>
            </div>
          </div>
          <Button onClick={generatePath} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2">
            {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing skill gaps...</> : <><Zap className="h-4 w-4" /> Generate My Learning Path</>}
          </Button>
        </Card>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
            <Skeleton className="h-96 rounded-2xl" />
          </div>
        ) : path ? (
          <div className="space-y-6">
            {/* Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card className="p-4 border-border/50 text-center">
                <div className={`text-3xl font-bold mb-1 ${path.job_readiness_score >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{path.job_readiness_score}%</div>
                <div className="text-xs text-muted-foreground">Current Readiness</div>
                <Progress value={path.job_readiness_score} className="mt-2 h-1.5" />
              </Card>
              <Card className="p-4 border-border/50 text-center">
                <div className="text-3xl font-bold text-primary mb-1">{path.estimated_weeks}</div>
                <div className="text-xs text-muted-foreground">Weeks to Ready</div>
              </Card>
              <Card className="p-4 border-border/50 text-center">
                <div className="text-3xl font-bold text-blue-400 mb-1">{path.skill_gaps?.length || 0}</div>
                <div className="text-xs text-muted-foreground">Skill Gaps</div>
              </Card>
              <Card className="p-4 border-border/50 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{completionPct}%</div>
                <div className="text-xs text-muted-foreground">Path Completed</div>
                <Progress value={completionPct} className="mt-2 h-1.5" />
              </Card>
            </div>

            {/* Priority Skills */}
            {path.priority_skills?.length > 0 && (
              <Card className="p-4 border-primary/20 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm"><TrendingUp className="h-4 w-4 text-primary" /> Focus These First</h4>
                <div className="flex flex-wrap gap-2">
                  {path.priority_skills.map(s => (
                    <Badge key={s} className="text-xs bg-primary/20 text-primary border-primary/30">🎯 {s}</Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Skill Gaps */}
            <Card className="p-5 border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-yellow-400" /> Skill Gap Analysis</h3>
              <div className="space-y-4">
                {path.skill_gaps?.map((gap: SkillGap) => (
                  <div key={gap.skill}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{gap.skill}</span>
                        <Badge className={`text-xs border ${IMPORTANCE_COLOR[gap.importance]}`}>{gap.importance}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{gap.time_to_learn}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground w-20">Current: {gap.current_level}</div>
                      <div className="flex-1 relative h-2 bg-muted/50 rounded-full overflow-hidden">
                        <div className="absolute left-0 top-0 h-full bg-yellow-500/40 rounded-full" style={{ width: `${LEVEL_WIDTH[gap.current_level] || 0}%` }} />
                        <div className="absolute left-0 top-0 h-full bg-primary/20 rounded-full" style={{ width: `${LEVEL_WIDTH[gap.required_level] || 0}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground w-20 text-right">Target: {gap.required_level}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Learning Modules */}
            <Card className="p-5 border-border/50">
              <h3 className="font-semibold mb-4 flex items-center gap-2"><BookOpen className="h-4 w-4 text-primary" /> Your Learning Modules</h3>
              <div className="space-y-3">
                {path.learning_modules?.map((mod: LearningModule) => (
                  <div key={mod.id} className={`p-4 rounded-xl border transition-colors ${completedModules.has(mod.id) ? 'border-green-500/30 bg-green-500/5 opacity-70' : 'border-border/50 hover:border-primary/20'}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="text-lg">{TYPE_ICON[mod.type] || '📌'}</span>
                          <span className="font-medium text-sm">{mod.title}</span>
                          {mod.is_free && <Badge className="text-xs bg-green-500/10 text-green-400 border-green-500/30">Free</Badge>}
                          <Badge variant="outline" className="text-xs">{mod.difficulty}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{mod.provider}</span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {mod.duration}</span>
                          <span className="text-primary">{mod.skill}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{mod.description}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => toggleModule(mod.id)}
                          className={`p-1.5 rounded-lg transition-colors ${completedModules.has(mod.id) ? 'text-green-400 bg-green-500/10' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <a href={mod.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" variant="outline" className="gap-1.5 text-xs h-8">
                            <Play className="h-3 w-3" /> Start
                          </Button>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '🎯', title: 'Skill Gap Analysis', desc: 'AI compares your current skills vs what top companies require for your target role' },
              { icon: '📚', title: 'Curated Resources', desc: 'Real courses, videos, and projects — both free and paid — from Coursera, Udemy, YouTube' },
              { icon: '⏱️', title: 'Realistic Timeline', desc: 'Based on your available time, get an honest estimate of when you\'ll be job-ready' },
            ].map(f => (
              <Card key={f.title} className="p-5 border-border/50">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-semibold mb-1">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
