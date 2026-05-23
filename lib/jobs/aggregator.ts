import { Job } from '@/types'
import { subDays, isAfter, parseISO } from 'date-fns'
import { getDeterministicId } from '@/lib/utils'

const FOURTEEN_DAYS_AGO = subDays(new Date(), 14)

function isRecent(dateStr: string): boolean {
  try {
    return isAfter(parseISO(dateStr), FOURTEEN_DAYS_AGO)
  } catch {
    return true // include if we can't parse
  }
}

// JSearch via RapidAPI - aggregates LinkedIn, Indeed, Glassdoor, ZipRecruiter
export async function searchJSearch(query: string, location: string, page = 1): Promise<Job[]> {
  const key = process.env.RAPIDAPI_KEY
  if (!key) return []

  try {
    // Build query string matching confirmed working format
    const searchQuery = location ? `${query} jobs in ${location}` : `${query} jobs`
    const params = new URLSearchParams({
      query: searchQuery,
      page: String(page),
      num_pages: '3',
      country: 'us',
      date_posted: 'all',
    })

    const res = await fetch(`https://jsearch.p.rapidapi.com/search?${params}`, {
      headers: {
        'X-RapidAPI-Key': key,
        'X-RapidAPI-Host': 'jsearch.p.rapidapi.com',
        'Content-Type': 'application/json',
      },
      next: { revalidate: 3600 },
    })

    if (!res.ok) {
      console.error('JSearch error:', res.status, await res.text())
      return []
    }
    const data = await res.json()

    return (data.data || [])
      .filter((j: Record<string, unknown>) => isRecent(j.job_posted_at_datetime_utc as string || new Date().toISOString()))
      .map((j: Record<string, unknown>): Job => ({
        id: `jsearch-${j.job_id}`,
        title: j.job_title as string,
        company: j.employer_name as string,
        company_logo: j.employer_logo as string | undefined,
        location: `${j.job_city || ''} ${j.job_state || ''} ${j.job_country || ''}`.trim(),
        country: j.job_country as string || 'Unknown',
        salary_min: j.job_min_salary as number | undefined,
        salary_max: j.job_max_salary as number | undefined,
        salary_currency: j.job_salary_currency as string || 'USD',
        work_mode: j.job_is_remote ? 'remote' : 'onsite',
        sponsorship: detectSponsorship(j.job_description as string || ''),
        posted_at: j.job_posted_at_datetime_utc as string || new Date().toISOString(),
        apply_url: j.job_apply_link as string || '',
        description: j.job_description as string || '',
        requirements: (j.job_highlights as Record<string, string[]> | undefined)?.Qualifications || [],
        skills_required: extractSkills(j.job_description as string || ''),
        source: 'JSearch',
        job_type: mapEmploymentType(j.job_employment_type as string),
        experience_level: j.job_required_experience ? (j.job_required_experience as Record<string, unknown>)?.no_experience_required ? 'Entry Level' : 'Mid Level' : undefined,
      }))
  } catch (e) {
    console.error('JSearch error:', e)
    return []
  }
}

// Adzuna API - free tier
export async function searchAdzuna(keywords: string, country = 'gb', page = 1): Promise<Job[]> {
  const appId = process.env.ADZUNA_APP_ID
  const apiKey = process.env.ADZUNA_API_KEY
  if (!appId || !apiKey) return []

  try {
    const countryCode = mapCountryToAdzuna(country)
    const params = new URLSearchParams({
      app_id: appId,
      app_key: apiKey,
      results_per_page: '20',
      what: keywords,
      'max-days-old': '14',
      sort_by: 'date',
      page: String(page),
    })

    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/${countryCode}/search/${page}?${params}`,
      { next: { revalidate: 3600 } }
    )
    if (!res.ok) return []
    const data = await res.json()

    return (data.results || []).map((j: Record<string, unknown>): Job => ({
      id: `adzuna-${j.id}`,
      title: j.title as string,
      company: (j.company as Record<string, string>)?.display_name || 'Unknown',
      location: (j.location as Record<string, unknown>)?.display_name as string || country,
      country: country,
      salary_min: j.salary_min as number | undefined,
      salary_max: j.salary_max as number | undefined,
      salary_currency: 'USD',
      work_mode: (j.title as string || '').toLowerCase().includes('remote') ? 'remote' : 'onsite',
      sponsorship: detectSponsorship(j.description as string || ''),
      posted_at: j.created as string || new Date().toISOString(),
      apply_url: j.redirect_url as string || '',
      description: j.description as string || '',
      requirements: [],
      skills_required: extractSkills(j.description as string || ''),
      source: 'Adzuna',
      job_type: 'full-time',
      company_rating: j.company_rating as number | undefined,
    }))
  } catch (e) {
    console.error('Adzuna error:', e)
    return []
  }
}

// RemoteOK - free public API
export async function searchRemoteOK(tags: string[]): Promise<Job[]> {
  try {
    const res = await fetch('https://remoteok.com/api', {
      headers: { 'User-Agent': 'AIJobHunter/1.0' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const data = await res.json()

    return data
      .slice(1) // first item is legal notice
      .filter((j: Record<string, unknown>) => {
        if (!isRecent(new Date((j.epoch as number) * 1000).toISOString())) return false
        if (tags.length === 0) return true
        const jobTags = ((j.tags as string[]) || []).map((t: string) => t.toLowerCase())
        return tags.some(t => jobTags.includes(t.toLowerCase()))
      })
      .slice(0, 30)
      .map((j: Record<string, unknown>): Job => ({
        id: `remoteok-${j.id}`,
        title: j.position as string,
        company: j.company as string,
        company_logo: j.company_logo as string | undefined,
        location: 'Remote (Worldwide)',
        country: 'Remote',
        salary_min: parseSalary(j.salary as string)[0],
        salary_max: parseSalary(j.salary as string)[1],
        salary_currency: 'USD',
        work_mode: 'remote',
        sponsorship: 'unknown',
        posted_at: new Date((j.epoch as number) * 1000).toISOString(),
        apply_url: j.apply_url as string || `https://remoteok.com/l/${j.id}`,
        description: stripHtml(j.description as string || ''),
        requirements: [],
        skills_required: (j.tags as string[]) || [],
        source: 'RemoteOK',
        job_type: 'full-time',
      }))
  } catch (e) {
    console.error('RemoteOK error:', e)
    return []
  }
}

// WeWorkRemotely RSS feed
export async function searchWeWorkRemotely(category = 'programming'): Promise<Job[]> {
  try {
    const res = await fetch(`https://weworkremotely.com/categories/remote-${category}-jobs.rss`, {
      next: { revalidate: 3600 },
    })
    if (!res.ok) return []
    const text = await res.text()
    const jobs = parseRSSFeed(text, 'WeWorkRemotely')
    return jobs.filter(j => isRecent(j.posted_at))
  } catch (e) {
    console.error('WeWorkRemotely error:', e)
    return []
  }
}

// Aggregate all sources
export async function aggregateJobs(params: {
  query: string
  location?: string
  skills?: string[]
  remote?: boolean
  country?: string
}): Promise<Job[]> {
  const { query, location = '', skills = [], remote } = params
  const tags = skills.slice(0, 5).map(s => s.toLowerCase())

  // Extract keyword tags from query for RemoteOK matching
  const queryTags = query.toLowerCase().split(/\s+/).filter(w => w.length > 2)
  const allTags = [...new Set([...tags, ...queryTags])]

  const sources = await Promise.allSettled([
    searchJSearch(query, location),
    searchAdzuna(query, params.country || 'gb'),
    searchAdzuna(query, 'us'),
    searchRemoteOK(allTags),      // always run — no API key needed
    searchWeWorkRemotely(),       // always run — RSS feed, free
  ])

  const allJobs: Job[] = []
  for (const result of sources) {
    if (result.status === 'fulfilled') {
      allJobs.push(...result.value)
    }
  }

  // Deduplicate by title+company
  const seen = new Set<string>()
  return allJobs.filter(job => {
    const key = `${job.title}-${job.company}`.toLowerCase()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

// Helpers
function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&nbsp;/g, ' ')
    .replace(/[\u0080-\u009F]/g, '')   // remove mojibake control chars
    .replace(/â€[™œ]/g, "'").replace(/â€"/g, '–').replace(/â€¦/g, '...')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

function detectSponsorship(description: string): Job['sponsorship'] {
  const lower = description.toLowerCase()
  if (lower.includes('visa sponsor') || lower.includes('sponsorship provided') || lower.includes('work authorization')) return 'yes'
  if (lower.includes('no sponsorship') || lower.includes('must be authorized') || lower.includes('us citizen only')) return 'no'
  if (lower.includes('may sponsor') || lower.includes('sponsorship considered')) return 'possible'
  return 'unknown'
}

const SKILL_KEYWORDS = [
  'javascript','typescript','python','java','react','node.js','sql','aws','docker','kubernetes',
  'git','graphql','rest','api','agile','scrum','selenium','playwright','cypress','jest','pytest',
  'terraform','ci/cd','linux','postgresql','mongodb','redis','vue','angular','next.js','express',
  'django','flask','spring','golang','rust','swift','kotlin','flutter','react native','figma',
]

function extractSkills(text: string): string[] {
  const lower = text.toLowerCase()
  return SKILL_KEYWORDS.filter(skill => lower.includes(skill))
}

function mapEmploymentType(type: string): Job['job_type'] {
  const map: Record<string, Job['job_type']> = {
    FULLTIME: 'full-time', PARTTIME: 'part-time', CONTRACTOR: 'contract', INTERN: 'internship',
  }
  return map[type] || 'full-time'
}

function mapCountryToAdzuna(country: string): string {
  const map: Record<string, string> = {
    'usa': 'us', 'uk': 'gb', 'canada': 'ca', 'australia': 'au', 'germany': 'de',
    'france': 'fr', 'india': 'in', 'singapore': 'sg', 'netherlands': 'nl', 'us': 'us', 'gb': 'gb',
  }
  return map[country.toLowerCase()] || 'gb'
}

function parseSalary(salary?: string): [number | undefined, number | undefined] {
  if (!salary) return [undefined, undefined]
  const nums = salary.match(/\d+/g)?.map(Number)
  if (!nums || nums.length === 0) return [undefined, undefined]
  return [nums[0] * 1000, (nums[1] || nums[0]) * 1000]
}

function parseRSSFeed(xml: string, source: string): Job[] {
  const items = xml.match(/<item>([\s\S]*?)<\/item>/g) || []
  return items.slice(0, 20).map((item, i) => {
    const title = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || 'Unknown'
    const link = item.match(/<link>(.*?)<\/link>/)?.[1] || ''
    const description = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] || ''
    const pubDate = item.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || new Date().toISOString()
    const company = title.includes(' at ') ? title.split(' at ').pop() || '' : ''
    const position = title.includes(' at ') ? title.split(' at ')[0] : title

    return {
      id: getDeterministicId(source.toLowerCase(), link || `${title}-${company}`),
      title: position.trim(),
      company: company.trim() || 'Unknown',
      location: 'Remote',
      country: 'Remote',
      work_mode: 'remote' as const,
      sponsorship: 'unknown' as const,
      posted_at: new Date(pubDate).toISOString(),
      apply_url: link,
      description: description.replace(/<[^>]+>/g, ''),
      requirements: [],
      skills_required: extractSkills(description),
      source,
      job_type: 'full-time' as const,
    }
  })
}
