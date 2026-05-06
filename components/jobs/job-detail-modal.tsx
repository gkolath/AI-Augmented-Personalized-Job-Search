'use client'

import { useState, useEffect } from 'react'
import { Job, InterviewPrep } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  X, ExternalLink, Mail, Copy, Zap, Brain, FileText,
  ChevronDown, ChevronUp, Loader2, MapPin, Building2,
  Calendar, DollarSign, Plane, CheckCircle, AlertTriangle
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Props { job: Job; onClose: () => void }

type Tab = 'details' | 'interview' | 'cover'

export function JobDetailModal({ job, onClose }: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null)
  const [coverLetter, setCoverLetter] = useState('')
  const [loadingPrep, setLoadingPrep] = useState(false)
  const [loadingCover, setLoadingCover] = useState(false)
  const [expandedQ, setExpandedQ] = useState<number | null>(null)

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  async function handleTabChange(tab: Tab) {
    setActiveTab(tab)
    if (tab === 'interview' && !interviewPrep && !loadingPrep) {
      setLoadingPrep(true)
      try {
        const { data } = await axios.post('/api/ai/interview', { job })
        setInterviewPrep(data)
      } catch { toast.error('Add your OpenAI key to enable AI interview prep') }
      setLoadingPrep(false)
    }
    if (tab === 'cover' && !coverLetter && !loadingCover) {
      setLoadingCover(true)
      try {
        const { data } = await axios.post('/api/ai/cover-letter', { job })
        setCoverLetter(data.cover_letter)
      } catch { toast.error('Add your OpenAI key to enable AI cover letters') }
      setLoadingCover(false)
    }
  }

  function getGmailLink() {
    if (!job.hr_email) return null
    const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`)
    const body = encodeURIComponent(`Dear ${job.recruiter_name || 'Hiring Manager'},\n\nI am interested in the ${job.title} position at ${job.company}.\n\nBest regards`)
    return `https://mail.google.com/mail/?view=cm&to=${job.hr_email}&su=${subject}&body=${body}`
  }

  const tabs: { key: Tab; icon: React.ReactNode; label: string }[] = [
    { key: 'details',   icon: <FileText className="h-3.5 w-3.5" />,  label: 'Job Details' },
    { key: 'interview', icon: <Brain className="h-3.5 w-3.5" />,     label: 'Interview Prep' },
    { key: 'cover',     icon: <Zap className="h-3.5 w-3.5" />,       label: 'Cover Letter' },
  ]

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      {/* Modal panel — stop propagation so clicking inside doesn't close */}
      <div
        className="relative w-full max-w-2xl bg-background border border-border/60 rounded-2xl shadow-2xl flex flex-col"
        style={{ maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── Sticky Header ── */}
        <div className="shrink-0 p-5 pb-4 border-b border-border/50">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Title + match score */}
          <div className="flex items-start gap-4 pr-8">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold leading-snug truncate">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5" />{job.company}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{job.location}</span>
                {job.posted_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(job.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            </div>

            {job.match_score !== undefined && (
              <div className={`shrink-0 text-center w-16 h-16 rounded-2xl flex flex-col items-center justify-center border-2 ${
                job.match_score >= 80 ? 'border-green-500 bg-green-500/10 text-green-400' :
                job.match_score >= 60 ? 'border-blue-500 bg-blue-500/10 text-blue-400' :
                'border-border bg-muted/30 text-muted-foreground'
              }`}>
                <div className="text-xl font-black leading-none">{job.match_score}</div>
                <div className="text-[10px] opacity-70 mt-0.5">match</div>
              </div>
            )}
          </div>

          {/* Badges row */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <Badge variant="outline" className="text-xs">{job.work_mode}</Badge>
            <Badge variant="outline" className="text-xs">{job.job_type}</Badge>
            {job.source && <Badge variant="outline" className="text-xs">{job.source}</Badge>}
            {job.sponsorship === 'yes' && (
              <Badge className="text-xs bg-green-500/10 text-green-400 border border-green-500/30">
                <Plane className="h-3 w-3 mr-1" />Visa Sponsored
              </Badge>
            )}
            {job.sponsorship === 'possible' && (
              <Badge className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/30">
                Sponsorship Possible
              </Badge>
            )}
            {job.salary_min && (
              <Badge variant="outline" className="text-xs">
                <DollarSign className="h-3 w-3 mr-0.5" />
                {Math.round(job.salary_min / 1000)}k
                {job.salary_max ? `–${Math.round(job.salary_max / 1000)}k` : '+'}{' '}
                {job.salary_currency}
              </Badge>
            )}
          </div>

          {/* Apply actions */}
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <a href={job.apply_url} target="_blank" rel="noopener noreferrer">
              <Button size="sm" className="bg-primary hover:bg-primary/90 gap-1.5 h-8">
                <ExternalLink className="h-3.5 w-3.5" /> Apply Now
              </Button>
            </a>
            {job.hr_email && (
              <a href={getGmailLink() || '#'} target="_blank" rel="noopener noreferrer">
                <Button size="sm" variant="outline" className="gap-1.5 h-8">
                  <Mail className="h-3.5 w-3.5" /> Email Recruiter
                </Button>
              </a>
            )}
            {job.hr_email && (
              <Button
                size="sm" variant="ghost"
                className="gap-1.5 h-8 text-xs text-muted-foreground"
                onClick={() => { navigator.clipboard.writeText(job.hr_email!); toast.success('Email copied!') }}
              >
                <Copy className="h-3.5 w-3.5" /> {job.hr_email}
              </Button>
            )}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="shrink-0 flex gap-0 border-b border-border/50 px-5">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => handleTabChange(t.key)}
              className={`flex items-center gap-1.5 px-4 py-3 text-sm border-b-2 transition-colors -mb-px ${
                activeTab === t.key
                  ? 'border-primary text-foreground font-medium'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* ── Job Details Tab ── */}
            {activeTab === 'details' && (
              <>
                {/* Match breakdown (only if scored) */}
                {job.match_score !== undefined && (
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium">Compatibility Score</span>
                        <span className="text-muted-foreground">{job.match_score}/100</span>
                      </div>
                      <Progress value={job.match_score} className="h-1.5" />
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1">
                      {job.interview_probability !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          🎯 {job.interview_probability}% interview probability
                        </span>
                      )}
                      {job.competitor_score !== undefined && (
                        <span className="text-xs text-muted-foreground">
                          🏆 Stronger than {job.competitor_score}% of applicants
                        </span>
                      )}
                    </div>

                    {job.why_matched && job.why_matched.length > 0 && (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-green-400">Why this fits you</div>
                        {job.why_matched.map((reason, i) => (
                          <div key={i} className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <CheckCircle className="h-3 w-3 text-green-400 mt-0.5 shrink-0" /> {reason}
                          </div>
                        ))}
                      </div>
                    )}

                    {job.missing_skills && job.missing_skills.length > 0 && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground">
                        <AlertTriangle className="h-3 w-3 text-yellow-400 mt-0.5 shrink-0" />
                        <span>Skill gaps: {job.missing_skills.slice(0, 4).join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">About the Role</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {job.description || 'No description available.'}
                  </p>
                </div>

                {/* Requirements */}
                {job.requirements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Requirements</h4>
                    <ul className="space-y-1.5">
                      {job.requirements.map((req, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <span className="text-primary mt-1 shrink-0">•</span> {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skills */}
                {job.skills_required.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Required Skills</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills_required.map(skill => (
                        <span
                          key={skill}
                          className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── Interview Prep Tab ── */}
            {activeTab === 'interview' && (
              <>
                {loadingPrep ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Generating personalized interview prep…</p>
                  </div>
                ) : interviewPrep ? (
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-semibold text-sm mb-3">Likely Interview Questions</h4>
                      <div className="space-y-2">
                        {interviewPrep.questions?.map((qa, i) => (
                          <div key={i} className="border border-border/50 rounded-xl overflow-hidden">
                            <button
                              className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-muted/30 transition-colors"
                              onClick={() => setExpandedQ(expandedQ === i ? null : i)}
                            >
                              <div className="flex-1 min-w-0">
                                <Badge variant="outline" className="text-xs mb-1.5">{qa.category}</Badge>
                                <p className="text-sm font-medium leading-snug">{qa.question}</p>
                              </div>
                              {expandedQ === i
                                ? <ChevronUp className="h-4 w-4 shrink-0 mt-1 text-muted-foreground" />
                                : <ChevronDown className="h-4 w-4 shrink-0 mt-1 text-muted-foreground" />}
                            </button>
                            {expandedQ === i && (
                              <div className="px-4 pb-4 border-t border-border/50 pt-3 bg-muted/20">
                                <p className="text-sm text-muted-foreground leading-relaxed">{qa.answer}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {interviewPrep.technical_topics?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Technical Topics to Study</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {interviewPrep.technical_topics.map((t, i) => (
                            <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{t}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {interviewPrep.salary_tips?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">💰 Salary Negotiation Tips</h4>
                        <ul className="space-y-1.5">
                          {interviewPrep.salary_tips.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-green-400 shrink-0">•</span> {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {interviewPrep.resources?.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Prep Resources</h4>
                        <div className="space-y-2">
                          {interviewPrep.resources.map((r, i) => (
                            <a
                              key={i} href={r.url} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-muted/20 transition-colors"
                            >
                              <span className="text-base shrink-0">
                                {r.type === 'youtube' ? '▶️' : r.type === 'course' ? '🎓' : r.type === 'blog' ? '📝' : '📖'}
                              </span>
                              <span className="text-sm flex-1 min-w-0 truncate">{r.title}</span>
                              <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <Brain className="h-12 w-12 mx-auto mb-3 text-primary opacity-30" />
                    <p className="text-muted-foreground text-sm">Add your OpenAI API key to generate personalized interview prep</p>
                  </div>
                )}
              </>
            )}

            {/* ── Cover Letter Tab ── */}
            {activeTab === 'cover' && (
              <>
                {loadingCover ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm">Writing your personalized cover letter…</p>
                  </div>
                ) : coverLetter ? (
                  <div>
                    <div className="flex justify-end mb-3">
                      <Button
                        size="sm" variant="outline" className="gap-1.5 h-8"
                        onClick={() => { navigator.clipboard.writeText(coverLetter); toast.success('Copied!') }}
                      >
                        <Copy className="h-3.5 w-3.5" /> Copy
                      </Button>
                    </div>
                    <div className="p-5 rounded-xl bg-muted/20 border border-border/50">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-muted-foreground">{coverLetter}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-primary opacity-30" />
                    <p className="text-muted-foreground text-sm">Add your OpenAI API key to generate an AI-personalized cover letter</p>
                  </div>
                )}
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
