'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Search, DollarSign, Clock, Star, Briefcase } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import axios from 'axios'
import toast from 'react-hot-toast'

interface Gig {
  id: string
  title: string
  company: string
  company_logo?: string
  budget_min?: number
  budget_max?: number
  budget_type: 'fixed' | 'hourly'
  duration?: string
  skills_required: string[]
  description: string
  apply_url: string
  source: string
  posted_at: string
  client_rating?: number
  match_score?: number
}

const FREELANCE_PLATFORMS = [
  { name: 'Upwork', url: 'https://www.upwork.com/freelance-jobs', icon: '🟢', description: 'Largest freelance marketplace' },
  { name: 'Toptal', url: 'https://www.toptal.com/freelance-jobs', icon: '🔵', description: 'Top 3% of talent — premium rates' },
  { name: 'Contra', url: 'https://contra.com/jobs', icon: '⚡', description: 'Commission-free freelancing' },
  { name: 'PeoplePerHour', url: 'https://www.peopleperhour.com', icon: '🟡', description: 'UK-based freelance platform' },
  { name: 'Freelancer.com', url: 'https://www.freelancer.com', icon: '🟠', description: 'Largest bidding platform' },
  { name: 'Fiverr', url: 'https://www.fiverr.com', icon: '🟣', description: 'Service-based gig marketplace' },
]

const SOURCE_COLORS: Record<string, string> = {
  RemoteOK: 'bg-green-500/10 text-green-400 border-green-500/30',
  WeWorkRemotely: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  JSearch: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
}

export default function FreelancePage() {
  const [gigs, setGigs] = useState<Gig[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('developer')

  useEffect(() => { fetchGigs() }, [])

  async function fetchGigs(q = query) {
    setLoading(true)
    try {
      const { data } = await axios.get(`/api/jobs/freelance?q=${encodeURIComponent(q)}`)
      setGigs(data.gigs || [])
      if (data.total > 0) toast.success(`Found ${data.total} freelance gigs`)
    } catch {
      toast.error('Failed to load gigs')
    }
    setLoading(false)
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setQuery(search)
    fetchGigs(search)
  }

  const filtered = gigs.filter(g =>
    !search.trim() ||
    g.title.toLowerCase().includes(search.toLowerCase()) ||
    g.skills_required.some(s => s.toLowerCase().includes(search.toLowerCase())) ||
    g.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Freelance Hub</h1>
          <p className="text-muted-foreground">AI-matched contract & freelance gigs from top platforms worldwide</p>
        </div>

        {/* Platform links */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {FREELANCE_PLATFORMS.map(p => (
            <a key={p.name} href={p.url} target="_blank" rel="noopener noreferrer">
              <Card className="p-3 border-border/50 hover:border-primary/30 transition-colors text-center cursor-pointer h-full">
                <div className="text-2xl mb-1">{p.icon}</div>
                <div className="font-semibold text-sm">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5 leading-tight">{p.description}</div>
              </Card>
            </a>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by skill, role, or keyword..."
              className="pl-10 h-11"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" className="h-11 px-6 bg-primary hover:bg-primary/90">Search Gigs</Button>
        </form>

        {/* Results count */}
        {!loading && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} gigs found
            {gigs.some(g => g.source === 'RemoteOK') && <span className="ml-2 text-green-400">• Live data</span>}
          </p>
        )}

        {/* Gigs */}
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="space-y-4">
            {filtered.map(gig => (
              <Card key={gig.id} className="p-5 border-border/50 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <Badge
                        className={`text-xs border ${SOURCE_COLORS[gig.source] || 'bg-muted text-muted-foreground border-border'}`}
                      >
                        {gig.source}
                      </Badge>
                      <Badge variant="outline" className="text-xs">🌐 Remote</Badge>
                      <Badge variant="outline" className="text-xs">📋 Contract</Badge>
                    </div>

                    <h3 className="font-semibold text-lg mb-1">{gig.title}</h3>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5" /> {gig.company}
                      </span>
                      {(gig.budget_min || gig.budget_max) && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-3.5 w-3.5" />
                          {gig.budget_type === 'hourly'
                            ? `$${gig.budget_min}–$${gig.budget_max}/hr`
                            : `$${(gig.budget_min || 0).toLocaleString()}–$${(gig.budget_max || 0).toLocaleString()}`}
                        </span>
                      )}
                      {gig.duration && (
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {gig.duration}</span>
                      )}
                      {gig.client_rating && (
                        <span className="flex items-center gap-1 text-yellow-400">
                          <Star className="h-3.5 w-3.5 fill-current" /> {gig.client_rating}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-xs">
                        {formatDistanceToNow(new Date(gig.posted_at), { addSuffix: true })}
                      </span>
                    </div>

                    {gig.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{gig.description}</p>
                    )}

                    {gig.skills_required.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {gig.skills_required.slice(0, 6).map(s => (
                          <span key={s} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">{s}</span>
                        ))}
                        {gig.skills_required.length > 6 && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">+{gig.skills_required.length - 6}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Match score + apply */}
                  <div className="shrink-0 text-center space-y-2">
                    {gig.match_score !== undefined && (
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center border-2 ${
                        gig.match_score >= 80 ? 'border-green-500 text-green-500' : 'border-blue-500 text-blue-500'
                      }`}>
                        <div>
                          <div className="text-base font-bold leading-none">{gig.match_score}</div>
                          <div className="text-xs opacity-70">match</div>
                        </div>
                      </div>
                    )}
                    <a href={gig.apply_url} target="_blank" rel="noopener noreferrer">
                      <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90">
                        <ExternalLink className="h-3.5 w-3.5" /> Apply
                      </Button>
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">No gigs found</p>
            <p className="text-sm">Try different keywords like "python", "react", or "testing"</p>
          </div>
        )}
      </div>
    </div>
  )
}
