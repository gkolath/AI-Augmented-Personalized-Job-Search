'use client'

import { useState, useEffect } from 'react'
import { Job } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Building2, MapPin, Clock, DollarSign, Star, Zap, Mail, ExternalLink } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Props { job: Job; onClick: () => void }

const priorityConfig = {
  'apply-immediately': { label: 'Apply Now!', className: 'bg-green-500/10 text-green-500 border-green-500/30' },
  'good-match': { label: 'Good Match', className: 'bg-blue-500/10 text-blue-500 border-blue-500/30' },
  'stretch-role': { label: 'Stretch Role', className: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' },
  'ignore': { label: 'Low Match', className: 'bg-muted text-muted-foreground border-border' },
}

const sponsorshipConfig = {
  yes: { label: '✈️ Visa Sponsored', className: 'bg-green-500/10 text-green-400 border-green-500/30' },
  possible: { label: '🔄 May Sponsor', className: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  no: { label: '🚫 No Sponsorship', className: 'bg-red-500/10 text-red-400 border-red-500/30' },
  unknown: { label: '❓ Sponsorship Unknown', className: 'bg-muted text-muted-foreground border-border' },
}

export function JobCard({ job, onClick }: Props) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const priority = job.priority ? priorityConfig[job.priority] : null
  const sponsorship = sponsorshipConfig[job.sponsorship]

  function getGmailLink() {
    if (!job.hr_email) return null
    const subject = encodeURIComponent(`Application for ${job.title} at ${job.company}`)
    const body = encodeURIComponent(`Dear Hiring Manager,\n\nI am writing to express my interest in the ${job.title} position at ${job.company}.\n\nBest regards`)
    return `https://mail.google.com/mail/?view=cm&to=${job.hr_email}&su=${subject}&body=${body}`
  }

  function formatSalary() {
    if (!job.salary_min && !job.salary_max) return null
    const currency = job.salary_currency || 'USD'
    const min = job.salary_min ? `${(job.salary_min / 1000).toFixed(0)}k` : ''
    const max = job.salary_max ? `${(job.salary_max / 1000).toFixed(0)}k` : ''
    return min && max ? `${currency} ${min}–${max}` : `${currency} ${min || max}`
  }

  return (
    <div
      className="group p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {priority && (
              <Badge className={`text-xs border ${priority.className}`}>{priority.label}</Badge>
            )}
            <Badge className={`text-xs border ${sponsorship.className}`}>{sponsorship.label}</Badge>
            {job.work_mode === 'remote' && (
              <Badge className="text-xs bg-cyan-500/10 text-cyan-400 border-cyan-500/30 border">🌐 Remote</Badge>
            )}
          </div>

          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors mb-1">{job.title}</h3>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5" /> {job.company}
              {job.company_rating && <span className="flex items-center gap-0.5 text-yellow-400"><Star className="h-3 w-3 fill-current" />{job.company_rating}</span>}
            </span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {mounted ? formatDistanceToNow(new Date(job.posted_at), { addSuffix: true }) : new Date(job.posted_at).toLocaleDateString()}</span>
            {formatSalary() && <span className="flex items-center gap-1"><DollarSign className="h-3.5 w-3.5" /> {formatSalary()}</span>}
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{job.description}</p>

          {job.skills_required.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {job.skills_required.slice(0, 5).map(skill => (
                <span key={skill} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{skill}</span>
              ))}
              {job.skills_required.length > 5 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{job.skills_required.length - 5}</span>
              )}
            </div>
          )}
        </div>

        {/* Match score */}
        {job.match_score !== undefined && (
          <div className="shrink-0 text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
              job.match_score >= 80 ? 'border-green-500 text-green-500' :
              job.match_score >= 60 ? 'border-blue-500 text-blue-500' :
              job.match_score >= 40 ? 'border-yellow-500 text-yellow-500' :
              'border-muted text-muted-foreground'
            }`}>
              <div>
                <div className="text-lg font-bold leading-none">{job.match_score}</div>
                <div className="text-xs opacity-70">match</div>
              </div>
            </div>
            {job.interview_probability !== undefined && (
              <div className="text-xs text-muted-foreground mt-1">{job.interview_probability}% call</div>
            )}
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-2 mt-4 pt-4 border-t border-border/30" onClick={e => e.stopPropagation()}>
        <a href={job.apply_url} target="_blank" rel="noopener noreferrer" className="flex-1">
          <Button size="sm" className="w-full gap-1.5 bg-primary hover:bg-primary/90">
            <ExternalLink className="h-3.5 w-3.5" /> Apply Now
          </Button>
        </a>
        {job.hr_email && (
          <a href={getGmailLink() || '#'} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Mail className="h-3.5 w-3.5" /> Email HR
            </Button>
          </a>
        )}
        <Button size="sm" variant="outline" className="gap-1.5" onClick={onClick}>
          <Zap className="h-3.5 w-3.5" /> Prep
        </Button>
      </div>

      {job.source && (
        <div className="mt-2 text-xs text-muted-foreground/50 text-right">via {job.source}</div>
      )}
    </div>
  )
}
