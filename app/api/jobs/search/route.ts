import { NextRequest, NextResponse } from 'next/server'
import { aggregateJobs } from '@/lib/jobs/aggregator'
import { enrichJobsWithMatches } from '@/lib/jobs/matcher'

const SUPABASE_CONFIGURED = !!(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_URL !== 'your_supabase_project_url' &&
  process.env.NEXT_PUBLIC_SUPABASE_URL.startsWith('https://')
)

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || ''
  const location = searchParams.get('location') || ''
  const country = searchParams.get('country') || ''
  const remote = searchParams.get('remote') === 'true'
  const sponsorship = searchParams.get('sponsorship') === 'true'

  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  try {
    // Fetch jobs from all sources
    let jobs = await aggregateJobs({ query, location, country, remote })

    // Apply sponsorship filter
    let filtered = sponsorship
      ? jobs.filter(j => j.sponsorship === 'yes' || j.sponsorship === 'possible')
      : jobs

    // Try Supabase cache + profile enrichment only if configured
    if (SUPABASE_CONFIGURED) {
      try {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const cacheKey = `jobs:${query}:${location}:${country}:${remote}`

        const { data: cached } = await supabase
          .from('job_cache').select('data')
          .eq('cache_key', cacheKey)
          .gt('expires_at', new Date().toISOString())
          .single()

        if (cached?.data) {
          jobs = cached.data as typeof jobs
          filtered = sponsorship ? jobs.filter(j => j.sponsorship === 'yes' || j.sponsorship === 'possible') : jobs
        } else {
          await supabase.from('job_cache').upsert({
            cache_key: cacheKey,
            data: jobs,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          })
        }

        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
          if (profile) filtered = enrichJobsWithMatches(filtered, profile)
        }
      } catch {
        // Supabase errors are non-fatal — return jobs without cache/enrichment
      }
    }

    return NextResponse.json({ jobs: filtered, total: filtered.length })
  } catch (error) {
    console.error('Job search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
