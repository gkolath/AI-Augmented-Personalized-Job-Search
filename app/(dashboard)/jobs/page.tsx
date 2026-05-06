'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Navbar } from '@/components/layout/navbar'
import { JobCard } from '@/components/jobs/job-card'
import { JobFilters } from '@/components/jobs/job-filters'
import { JobDetailModal } from '@/components/jobs/job-detail-modal'
import { CareerBot } from '@/components/chatbot/career-bot'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Sparkles, Bot, Filter } from 'lucide-react'
import { Job } from '@/types'
import axios from 'axios'
import toast from 'react-hot-toast'

function JobsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [location, setLocation] = useState(searchParams.get('location') || '')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showBot, setShowBot] = useState(false)
  const [filters, setFilters] = useState({
    remote: false,
    sponsorship: false,
    country: '',
    jobType: '',
    minScore: 0,
  })

  useEffect(() => {
    const q = searchParams.get('q') || 'software engineer'
    const loc = searchParams.get('location') || ''
    setQuery(searchParams.get('q') || '')
    setLocation(loc)
    fetchJobs(q, loc)
  }, [])

  async function fetchJobs(q = query, loc = location) {
    const effectiveQ = q.trim() || 'software engineer'
    setLoading(true)
    try {
      const params = new URLSearchParams({ q: effectiveQ, location: loc, remote: String(filters.remote), sponsorship: String(filters.sponsorship) })
      if (filters.country) params.set('country', filters.country)
      const { data } = await axios.get(`/api/jobs/search?${params}`)
      setJobs(data.jobs || [])
      if (data.total > 0) toast.success(`Found ${data.total} jobs`)
    } catch {
      toast.error('Search failed. Check your API keys.')
      // Show demo jobs if API fails
      setJobs(DEMO_JOBS)
    }
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    router.push(`/jobs?q=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`)
    fetchJobs()
  }

  const filteredJobs = jobs.filter(job => {
    if (filters.remote && job.work_mode !== 'remote') return false
    if (filters.sponsorship && job.sponsorship !== 'yes' && job.sponsorship !== 'possible') return false
    if (filters.country && !job.country.toLowerCase().includes(filters.country.toLowerCase())) return false
    if (filters.jobType && job.job_type !== filters.jobType) return false
    if (filters.minScore && (job.match_score || 0) < filters.minScore) return false
    return true
  })

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-16">
        {/* Search header */}
        <div className="border-b border-border/50 bg-card/50 backdrop-blur sticky top-16 z-40 px-4 py-3">
          <div className="mx-auto max-w-7xl">
            <form onSubmit={handleSearch} className="flex gap-3 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Job title, skills, or keywords..." className="pl-10 h-10" value={query} onChange={e => setQuery(e.target.value)} />
              </div>
              <Input placeholder="Location or Remote" className="h-10 w-44 hidden sm:block" value={location} onChange={e => setLocation(e.target.value)} />
              <Button type="submit" className="gap-1.5 bg-primary hover:bg-primary/90 h-10 shrink-0">
                <Sparkles className="h-3.5 w-3.5" /> Search
              </Button>
              <Button type="button" variant="outline" size="icon" className="h-10 w-10 shrink-0" onClick={() => setShowBot(!showBot)}>
                <Bot className="h-4 w-4" />
              </Button>
            </form>
            {/* Quick search chips */}
            <div className="flex flex-wrap gap-1.5">
              {['Software Engineer', 'QA Automation', 'React Developer', 'Data Scientist', 'DevOps', 'Product Manager', 'Python Developer', 'Remote'].map(term => (
                <button
                  key={term}
                  type="button"
                  onClick={() => { setQuery(term === 'Remote' ? '' : term); fetchJobs(term === 'Remote' ? 'developer' : term, term === 'Remote' ? '' : location); }}
                  className="text-xs px-2.5 py-1 rounded-full border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors bg-muted/20"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-6 flex gap-6">
          {/* Filters sidebar */}
          <div className="w-64 shrink-0 hidden lg:block">
            <JobFilters filters={filters} onChange={setFilters} />
          </div>

          {/* Jobs list */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {loading ? 'Searching...' : `${filteredJobs.length} jobs found`}
                </span>
                {filters.remote && <Badge variant="secondary">Remote only</Badge>}
                {filters.sponsorship && <Badge variant="secondary">Sponsorship</Badge>}
              </div>
            </div>

            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-48 rounded-2xl" />
                ))}
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="space-y-4">
                {filteredJobs.map(job => (
                  <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-muted-foreground">
                <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No jobs found</p>
                <p className="text-sm mb-4">Try a different keyword or remove some filters</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {['Software Engineer', 'React Developer', 'QA Automation', 'Data Scientist'].map(t => (
                    <button
                      key={t}
                      onClick={() => { setQuery(t); fetchJobs(t, '') }}
                      className="text-sm px-3 py-1.5 rounded-full border border-primary/30 text-primary hover:bg-primary/10 transition-colors"
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedJob && (
        <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      )}

      {showBot && <CareerBot onClose={() => setShowBot(false)} />}
    </div>
  )
}

export default function JobsPage() {
  return (
    <Suspense>
      <JobsContent />
    </Suspense>
  )
}

const DEMO_JOBS: Job[] = [
  {
    id: 'demo-1', title: 'Senior QA Engineer', company: 'TechCorp Global', location: 'Dubai, UAE', country: 'UAE',
    salary_min: 120000, salary_max: 180000, salary_currency: 'AED', work_mode: 'hybrid',
    sponsorship: 'yes', posted_at: new Date().toISOString(), apply_url: '#',
    description: 'We are looking for a Senior QA Engineer with 5+ years experience in test automation using Selenium and Playwright.',
    requirements: ['5+ years QA experience', 'Selenium/Playwright', 'API testing', 'CI/CD knowledge'],
    skills_required: ['selenium', 'playwright', 'python', 'api testing', 'ci/cd'],
    source: 'Demo', job_type: 'full-time', match_score: 87, priority: 'apply-immediately',
    interview_probability: 75, urgency_score: 90, hr_email: 'careers@techcorp.example',
    recruiter_name: 'Sarah Johnson', company_rating: 4.2,
  },
  {
    id: 'demo-2', title: 'Automation Test Lead', company: 'FinTech Solutions', location: 'London, UK', country: 'UK',
    salary_min: 80000, salary_max: 110000, salary_currency: 'GBP', work_mode: 'remote',
    sponsorship: 'possible', posted_at: new Date(Date.now() - 86400000 * 2).toISOString(), apply_url: '#',
    description: 'Lead a team of automation engineers. Drive quality across our fintech platform.',
    requirements: ['7+ years testing', 'Team leadership', 'Playwright', 'TypeScript'],
    skills_required: ['playwright', 'typescript', 'leadership', 'api testing'],
    source: 'Demo', job_type: 'full-time', match_score: 72, priority: 'good-match',
    interview_probability: 60, urgency_score: 70, company_rating: 4.5,
  },
  {
    id: 'demo-3', title: 'QA Automation Engineer', company: 'Remote First Inc', location: 'Remote (Worldwide)', country: 'Remote',
    salary_min: 70000, salary_max: 100000, salary_currency: 'USD', work_mode: 'remote',
    sponsorship: 'unknown', posted_at: new Date(Date.now() - 86400000 * 5).toISOString(), apply_url: '#',
    description: 'Join our globally distributed team. Work on cutting-edge products with modern testing stack.',
    requirements: ['3+ years automation', 'JavaScript/TypeScript', 'REST API testing'],
    skills_required: ['javascript', 'typescript', 'playwright', 'rest'],
    source: 'RemoteOK', job_type: 'full-time', match_score: 65, priority: 'good-match',
    interview_probability: 55, urgency_score: 50,
  },
]
