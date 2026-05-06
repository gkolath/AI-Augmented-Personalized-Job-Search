'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Target, RefreshCw, CheckCircle, Circle, ExternalLink,
  TrendingUp, Calendar, BookOpen, Users, Search, Zap
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { CoachingPlan, CoachingTask } from '@/types'

const TASK_TYPE_CONFIG = {
  apply:    { icon: Zap, color: 'text-primary', bg: 'bg-primary/10' },
  learn:    { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  network:  { icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10' },
  practice: { icon: Target, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  research: { icon: Search, color: 'text-green-400', bg: 'bg-green-500/10' },
}

const PRIORITY_COLOR = {
  high: 'border-l-2 border-l-red-500/60',
  medium: 'border-l-2 border-l-yellow-500/60',
  low: 'border-l-2 border-l-blue-500/60',
}

export default function CoachingPage() {
  const [plan, setPlan] = useState<CoachingPlan | null>(null)
  const [loading, setLoading] = useState(false)
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set())
  const [weekNumber, setWeekNumber] = useState(1)
  const [role, setRole] = useState('Software Engineer')

  useEffect(() => { fetchPlan() }, [])

  async function fetchPlan(week = weekNumber) {
    setLoading(true)
    try {
      const { data } = await axios.post('/api/coaching', {
        profile: { skills: ['JavaScript', 'React', 'TypeScript'], job_titles: [role], experience_years: 3 },
        weekNumber: week,
        applicationsThisWeek: completedTasks.size,
        interviewsScheduled: 0,
      })
      setPlan(data.plan)
    } catch { toast.error('Failed to load coaching plan') }
    setLoading(false)
  }

  function toggleTask(taskId: string) {
    setCompletedTasks(prev => {
      const n = new Set(prev)
      n.has(taskId) ? n.delete(taskId) : n.add(taskId)
      return n
    })
  }

  function nextWeek() {
    const next = weekNumber + 1
    setWeekNumber(next)
    setCompletedTasks(new Set())
    fetchPlan(next)
  }

  const allTasks = plan?.daily_tasks?.flatMap(d => d.tasks) || []
  const completedCount = allTasks.filter(t => completedTasks.has(t.id)).length
  const progressPct = allTasks.length ? Math.round((completedCount / allTasks.length) * 100) : 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Target className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Career Coach</h1>
            </div>
            <p className="text-muted-foreground">Weekly AI-generated plans with daily accountability tasks</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <input
              className="h-9 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none w-48"
              placeholder="Target role"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
            <Button onClick={() => fetchPlan(weekNumber)} disabled={loading} variant="outline" size="sm" className="gap-1.5">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-16 rounded-2xl" />
            {Array.from({length: 5}).map((_, i) => <Skeleton key={i} className="h-48 rounded-2xl" />)}
          </div>
        ) : plan ? (
          <div className="space-y-6">
            {/* Week Header */}
            <Card className="p-5 border-primary/20 bg-primary/5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className="text-xs bg-primary/20 text-primary border-primary/30">Week {plan.week_number}</Badge>
                    <span className="font-bold text-lg">{plan.theme}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{plan.motivational_insight}</p>
                  <div className="flex flex-wrap gap-2">
                    {plan.goals?.map((g, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-sm">
                        <TrendingUp className="h-3.5 w-3.5 text-primary" />
                        <span className="text-muted-foreground">{g}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center shrink-0">
                  <div className="text-3xl font-bold text-primary mb-1">{progressPct}%</div>
                  <div className="text-xs text-muted-foreground mb-1">Complete</div>
                  <Progress value={progressPct} className="w-24 h-2" />
                </div>
              </div>
            </Card>

            {/* Metrics */}
            {plan.metrics?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {plan.metrics.map((m, i) => (
                  <Card key={i} className="p-3 border-border/50 text-center">
                    <div className="font-bold text-primary text-sm">{m.target}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{m.label}</div>
                  </Card>
                ))}
              </div>
            )}

            {/* Daily Tasks */}
            {plan.daily_tasks?.map(day => {
              const dayCompleted = day.tasks.filter(t => completedTasks.has(t.id)).length
              return (
                <Card key={day.day} className="p-5 border-border/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {day.day}
                    </h3>
                    <span className="text-sm text-muted-foreground">{dayCompleted}/{day.tasks.length} done</span>
                  </div>
                  <div className="space-y-2">
                    {day.tasks.map((task: CoachingTask) => {
                      const isComplete = completedTasks.has(task.id)
                      const cfg = TASK_TYPE_CONFIG[task.type] || TASK_TYPE_CONFIG.research
                      const TypeIcon = cfg.icon
                      return (
                        <div
                          key={task.id}
                          className={`p-3 rounded-xl ${PRIORITY_COLOR[task.priority]} bg-muted/20 transition-opacity ${isComplete ? 'opacity-50' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <button onClick={() => toggleTask(task.id)} className="mt-0.5 shrink-0">
                              {isComplete
                                ? <CheckCircle className="h-5 w-5 text-green-400" />
                                : <Circle className="h-5 w-5 text-muted-foreground" />}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                                <span className={`text-sm font-medium ${isComplete ? 'line-through text-muted-foreground' : ''}`}>{task.title}</span>
                                <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                                  <TypeIcon className="h-3 w-3" /> {task.type}
                                </span>
                                {task.priority === 'high' && <Badge className="text-xs bg-red-500/10 text-red-400 border-red-500/30">High Priority</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{task.description}</p>
                              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                <span>⏱️ {task.duration}</span>
                                {task.resource_url && (
                                  <a href={task.resource_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline">
                                    <ExternalLink className="h-3 w-3" /> Open Resource
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              )
            })}

            {/* Week Preview + Next */}
            <Card className="p-5 border-border/50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold mb-1">Next Week Preview</h4>
                  <p className="text-sm text-muted-foreground">{plan.next_week_preview}</p>
                </div>
                <Button onClick={nextWeek} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2 shrink-0">
                  <RefreshCw className="h-4 w-4" /> Week {plan.week_number + 1}
                </Button>
              </div>
            </Card>
          </div>
        ) : null}
      </div>
    </div>
  )
}
