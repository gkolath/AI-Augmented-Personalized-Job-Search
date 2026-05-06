import { NextRequest, NextResponse } from 'next/server'
import { Job } from '@/types'
import { subDays, isAfter } from 'date-fns'

const FOURTEEN_DAYS_AGO = subDays(new Date(), 14)

function isRecent(dateStr: string) {
  try { return isAfter(new Date(dateStr), FOURTEEN_DAYS_AGO) } catch { return true }
}

function stripHtml(html: string) {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/[\u0080-\u009F]/g, '')
    .replace(/â€[™œ]/g, "'").replace(/â€"/g, '–').replace(/â€¦/g, '...')
    .replace(/\s{2,}/g, ' ').trim()
}

const SKILL_KEYWORDS = [
  'javascript','typescript','python','java','react','node.js','sql','aws','docker','kubernetes',
  'git','graphql','rest','api','selenium','playwright','cypress','jest','pytest','ci/cd',
  'linux','postgresql','mongodb','redis','vue','angular','next.js','express','django','flask',
  'golang','rust','swift','kotlin','flutter','react native','figma','testing','qa','automation',
]

function extractSkills(text: string) {
  const lower = text.toLowerCase()
  return SKILL_KEYWORDS.filter(s => lower.includes(s))
}

// RemoteOK filtered for contract/freelance roles
async function fetchRemoteOKFreelance(tags: string[]) {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'AIJobHunter/1.0' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()

    const freelanceTags = ['contract', 'freelance', 'part-time', 'consultant', ...tags.map(t => t.toLowerCase())]

    return data
      .slice(1)
      .filter((j: Record<string, unknown>) => {
        if (!isRecent(new Date((j.epoch as number) * 1000).toISOString())) return false
        const jobTags = ((j.tags as string[]) || []).map(t => t.toLowerCase())
        const titleLower = ((j.position as string) || '').toLowerCase()
        // match if has freelance-related tag OR matches user skill tags OR has contract in title
        return freelanceTags.some(t => jobTags.includes(t)) ||
               tags.some(t => jobTags.includes(t.toLowerCase())) ||
               titleLower.includes('contract') || titleLower.includes('freelance')
      })
      .slice(0, 25)
      .map((j: Record<string, unknown>) => ({
        id: `rok-fl-${j.id}`,
        title: j.position as string,
        company: j.company as string,
        company_logo: j.company_logo as string,
        budget_min: undefined as number | undefined,
        budget_max: undefined as number | undefined,
        budget_type: 'fixed' as const,
        duration: 'Contract',
        skills_required: (j.tags as string[]) || [],
        description: stripHtml(j.description as string || ''),
        apply_url: (j.apply_url as string) || `https://remoteok.com/l/${j.id}`,
        source: 'RemoteOK',
        posted_at: new Date((j.epoch as number) * 1000).toISOString(),
        client_rating: undefined as number | undefined,
        match_score: undefined as number | undefined,
      }))
  } catch (e) {
    console.error('RemoteOK freelance error:', e)
    return []
  }
}

// WeWorkRemotely contract RSS
async function fetchWWRContract() {
  try {
    const res = await fetch('https://weworkremotely.com/categories/remote-contract-jobs.rss', {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const text = await res.text()
    const items = text.match(/<item>([\s\S]*?)<\/item>/g) || []

    return items.slice(0, 20).map((item, i) => {
      const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || ''
      const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
      const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || ''
      const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
      const cleanDesc = stripHtml(description)
      const parts = title.split(': ')
      const company = parts[0] || 'Unknown'
      const position = parts.slice(1).join(': ') || title

      return {
        id: `wwr-fl-${i}-${Date.now()}`,
        title: position.trim(),
        company: company.trim(),
        budget_min: undefined as number | undefined,
        budget_max: undefined as number | undefined,
        budget_type: 'fixed' as const,
        duration: 'Contract',
        skills_required: extractSkills(cleanDesc),
        description: cleanDesc.slice(0, 300),
        apply_url: link,
        source: 'WeWorkRemotely',
        posted_at: new Date(pubDate).toISOString(),
        client_rating: undefined as number | undefined,
        match_score: undefined as number | undefined,
      }
    }).filter(j => isRecent(j.posted_at))
  } catch (e) {
    console.error('WWR freelance error:', e)
    return []
  }
}

// JSearch for contract roles (if API key present)
async function fetchJSearchContract(query: string) {
  const key = process.env.RAPIDAPI_KEY
  if (!key) return []
  try {
    const params = new URLSearchParams({
      query: `${query} contract freelance`,
      page: '1',
      num_pages: '2',
      employment_types: 'CONTRACTOR,PARTTIME',
      date_posted: 'month',
    })
    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': 'jsearch.p.rapidapi.com' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data.data || []).map((j: Record<string, unknown>) => ({
      id: `jsfl-${j.job_id}`,
      title: j.job_title as string,
      company: j.employer_name as string,
      budget_min: j.job_min_salary as number | undefined,
      budget_max: j.job_max_salary as number | undefined,
      budget_type: 'fixed' as const,
      duration: 'Contract',
      skills_required: ((j.job_highlights as Record<string, string[]> | undefined)?.Qualifications || []).slice(0, 6),
      description: stripHtml((j.job_description as string || '').slice(0, 400)),
      apply_url: j.job_apply_link as string || '',
      source: 'JSearch',
      posted_at: j.job_posted_at_datetime_utc as string || new Date().toISOString(),
      client_rating: undefined as number | undefined,
      match_score: undefined as number | undefined,
    }))
  } catch { return [] }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'developer'
  const skillTags = searchParams.get('skills')?.split(',').filter(Boolean) || []

  try {
    const [remoteOK, wwr, jsearch] = await Promise.all([
      fetchRemoteOKFreelance(skillTags),
      fetchWWRContract(),
      fetchJSearchContract(query),
    ])

    const all = [...jsearch, ...remoteOK, ...wwr]

    // Deduplicate
    const seen = new Set<string>()
    const deduped = all.filter(g => {
      const key = `${g.title}-${g.company}`.toLowerCase()
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    return NextResponse.json({ gigs: deduped, total: deduped.length })
  } catch (error) {
    console.error('Freelance fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch freelance gigs' }, { status: 500 })
  }
}
