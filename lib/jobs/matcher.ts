import { Job, UserProfile } from '@/types'

export interface MatchResult {
  score: number
  matched_skills: string[]
  missing_skills: string[]
  priority: Job['priority']
  interview_probability: number
  urgency_score: number
  why_matched: string[]
  suggested_resume_edits: string[]
}

export function matchJobToProfile(job: Job, profile: UserProfile): MatchResult {
  const userSkills = profile.skills.map(s => s.toLowerCase())
  const jobSkills = job.skills_required.map(s => s.toLowerCase())

  // Skill match (40% weight)
  const matched_skills = jobSkills.filter(s => userSkills.includes(s))
  const missing_skills = jobSkills.filter(s => !userSkills.includes(s))
  const skillScore = jobSkills.length > 0 ? (matched_skills.length / jobSkills.length) * 100 : 50

  // Title match (25% weight)
  const userTitles = profile.job_titles.map(t => t.toLowerCase())
  const titleMatch = userTitles.some(t =>
    job.title.toLowerCase().includes(t) || t.includes(job.title.toLowerCase().split(' ')[0])
  )
  const titleScore = titleMatch ? 100 : 40

  // Location/remote match (15% weight)
  const wantedRemote = profile.work_mode.includes('remote')
  const locationScore =
    job.work_mode === 'remote' && wantedRemote ? 100
    : profile.preferred_countries.some(c => job.country.toLowerCase().includes(c.toLowerCase())) ? 80
    : 40

  // Sponsorship match (10% weight)
  const sponsorScore = profile.needs_visa
    ? job.sponsorship === 'yes' ? 100 : job.sponsorship === 'possible' ? 60 : 20
    : 100

  // Experience match (10% weight)
  const expScore = matchExperienceLevel(profile.experience_level, job.experience_level)

  const score = Math.round(
    skillScore * 0.4 + titleScore * 0.25 + locationScore * 0.15 + sponsorScore * 0.1 + expScore * 0.1
  )

  const priority: Job['priority'] =
    score >= 80 ? 'apply-immediately'
    : score >= 60 ? 'good-match'
    : score >= 40 ? 'stretch-role'
    : 'ignore'

  const interview_probability = Math.min(95, Math.round(score * 0.85 + (matched_skills.length * 2)))
  const urgency_score = calculateUrgency(job)

  const why_matched: string[] = []
  if (matched_skills.length > 0) why_matched.push(`${matched_skills.length} matching skills: ${matched_skills.slice(0, 3).join(', ')}`)
  if (titleMatch) why_matched.push('Job title aligns with your preferences')
  if (job.work_mode === 'remote' && wantedRemote) why_matched.push('Remote work available')
  if (job.sponsorship === 'yes' && profile.needs_visa) why_matched.push('Visa sponsorship available')

  const suggested_resume_edits: string[] = missing_skills.slice(0, 3).map(s =>
    `Add ${s} experience or mention related projects`
  )

  return {
    score,
    matched_skills,
    missing_skills,
    priority,
    interview_probability,
    urgency_score,
    why_matched,
    suggested_resume_edits,
  }
}

function matchExperienceLevel(userLevel: string, jobLevel?: string): number {
  if (!jobLevel) return 75
  const levels = ['entry', 'mid', 'senior', 'lead', 'executive']
  const userIdx = levels.findIndex(l => userLevel.includes(l))
  const jobIdx = levels.findIndex(l => jobLevel.toLowerCase().includes(l))
  if (jobIdx === -1) return 75
  const diff = Math.abs(userIdx - jobIdx)
  return diff === 0 ? 100 : diff === 1 ? 70 : 30
}

function calculateUrgency(job: Job): number {
  const daysSincePosted = Math.floor(
    (Date.now() - new Date(job.posted_at).getTime()) / (1000 * 60 * 60 * 24)
  )
  const recencyScore = Math.max(0, 100 - daysSincePosted * 7)
  return Math.round(recencyScore)
}

export function enrichJobsWithMatches(jobs: Job[], profile: UserProfile): Job[] {
  const enriched = jobs.map(job => {
    const match = matchJobToProfile(job, profile)
    // Competitor score: estimate percentile vs anonymous applicants
    // Factors: skill match, recency (apply early = better), experience fit
    const competitorScore = Math.min(99, Math.round(
      match.score * 0.6 +
      (match.urgency_score > 70 ? 20 : 10) +  // bonus for applying early
      (match.matched_skills.length >= 3 ? 20 : 10)
    ))
    return {
      ...job,
      match_score: match.score,
      missing_skills: match.missing_skills,
      priority: match.priority,
      interview_probability: match.interview_probability,
      urgency_score: match.urgency_score,
      why_matched: match.why_matched,
      suggested_resume_edits: match.suggested_resume_edits,
      competitor_score: competitorScore,
    }
  })
  return enriched.sort((a, b) => (b.match_score || 0) - (a.match_score || 0))
}
