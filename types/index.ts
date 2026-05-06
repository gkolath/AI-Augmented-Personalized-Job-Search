export interface UserProfile {
  id: string
  email: string
  full_name: string
  phone?: string
  linkedin_url?: string
  github_url?: string
  skills: string[]
  experience_years: number
  experience_level: 'entry' | 'mid' | 'senior' | 'lead' | 'executive'
  preferred_countries: string[]
  needs_visa: boolean
  expected_salary_min?: number
  expected_salary_max?: number
  salary_currency: string
  job_titles: string[]
  freelance_interest: boolean
  work_mode: ('remote' | 'hybrid' | 'onsite')[]
  resume_url?: string
  resume_text?: string
  summary?: string
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  title: string
  company: string
  company_logo?: string
  company_rating?: number
  location: string
  country: string
  salary_min?: number
  salary_max?: number
  salary_currency?: string
  work_mode: 'remote' | 'hybrid' | 'onsite'
  sponsorship: 'yes' | 'no' | 'possible' | 'unknown'
  posted_at: string
  apply_url: string
  description: string
  requirements: string[]
  skills_required: string[]
  hr_email?: string
  recruiter_name?: string
  source: string
  job_type: 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship'
  experience_level?: string
  match_score?: number
  missing_skills?: string[]
  priority?: 'apply-immediately' | 'good-match' | 'stretch-role' | 'ignore'
  interview_probability?: number
  why_matched?: string[]
  suggested_resume_edits?: string[]
  urgency_score?: number
  competitor_score?: number  // percentile vs other applicants
}

export interface FreelanceGig {
  id: string
  title: string
  company: string
  company_logo?: string
  client_rating?: number
  budget_min?: number
  budget_max?: number
  budget_type: 'fixed' | 'hourly'
  duration?: string
  skills_required: string[]
  description: string
  apply_url: string
  source: string
  posted_at: string
  match_score?: number
}

export interface Application {
  id: string
  user_id: string
  job_id?: string
  company: string
  position: string
  location?: string
  salary_offered?: number
  salary_currency?: string
  status: 'saved' | 'applied' | 'interview' | 'offer' | 'rejected' | 'withdrawn'
  applied_at?: string
  next_step?: string
  next_step_date?: string
  notes?: string
  job_url?: string
  contact_name?: string
  contact_email?: string
  created_at: string
  updated_at?: string
}

export interface InterviewPrep {
  job_title: string
  company: string
  questions: {
    category: string
    question: string
    answer: string
  }[]
  technical_topics: string[]
  company_tips: string[]
  salary_tips: string[]
  resources: {
    type: 'youtube' | 'blog' | 'course' | 'docs'
    title: string
    url: string
  }[]
}

export interface MockInterviewSession {
  id: string
  job_title: string
  company: string
  type: 'behavioral' | 'technical' | 'mixed'
  questions: MockInterviewQuestion[]
  overall_score?: number
  feedback?: string
  created_at: string
}

export interface MockInterviewQuestion {
  id: string
  question: string
  category: 'behavioral' | 'technical' | 'situational' | 'hr'
  difficulty: 'easy' | 'medium' | 'hard'
  hint?: string
  user_answer?: string
  ai_feedback?: string
  score?: number  // 0-100
  tone_score?: number
  confidence_score?: number
  suggested_answer?: string
  evaluation?: Record<string, unknown>
}

export interface ResumeAnalysis {
  overall_score: number  // 0-100
  ats_score: number
  sections: {
    name: string
    score: number
    issues: string[]
    suggestions: string[]
  }[]
  missing_keywords: string[]
  strong_points: string[]
  critical_fixes: string[]
  ats_tips: string[]
  word_count: number
  estimated_read_time: string
}

export interface TailoredResume {
  original_text: string
  tailored_text: string
  changes_made: string[]
  keywords_added: string[]
  match_improvement: number  // percentage improvement
}

export interface LearningPath {
  target_role: string
  skill_gaps: SkillGap[]
  learning_modules: LearningModule[]
  estimated_weeks: number
  daily_hours: number
  priority_skills: string[]
  job_readiness_score: number
}

export interface SkillGap {
  skill: string
  current_level: 'none' | 'beginner' | 'intermediate' | 'advanced'
  required_level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  importance: 'critical' | 'important' | 'nice-to-have'
  time_to_learn: string
}

export interface LearningModule {
  id: string
  title: string
  skill: string
  type: 'video' | 'course' | 'project' | 'reading' | 'practice'
  provider: string
  url: string
  duration: string
  is_free: boolean
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  description: string
}

export interface SalaryIntelligence {
  role: string
  location: string
  percentiles: {
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
  }
  currency: string
  yoe_adjustment: string
  remote_premium: string
  negotiation_scripts: NegotiationScript[]
  offer_comparison: OfferComparison | null
  benefits_value: BenefitItem[]
  market_trend: 'rising' | 'stable' | 'declining'
  top_paying_companies: { name: string; avg_salary: number }[]
}

export interface NegotiationScript {
  scenario: string
  script: string
  outcome: string
}

export interface OfferComparison {
  offers: {
    company: string
    base: number
    bonus?: number
    equity?: string
    benefits: string[]
    total_comp: number
    rating: number
  }[]
  recommendation: string
}

export interface BenefitItem {
  name: string
  estimated_value: number
  notes: string
}

export interface CoachingPlan {
  week_number: number
  theme: string
  goals: string[]
  daily_tasks: {
    day: string
    tasks: CoachingTask[]
  }[]
  metrics: { label: string; target: string }[]
  motivational_insight: string
  next_week_preview: string
}

export interface CoachingTask {
  id: string
  title: string
  description: string
  duration: string
  type: 'apply' | 'learn' | 'network' | 'practice' | 'research'
  priority: 'high' | 'medium' | 'low'
  completed?: boolean
  resource_url?: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  jobs?: Job[]
}

export interface DashboardStats {
  jobs_applied: number
  jobs_saved: number
  interviews_upcoming: number
  match_score_avg: number
  sponsorship_count: number
  freelance_count: number
  resume_strength: number
  top_countries: { country: string; count: number }[]
  skill_gaps: string[]
}

export interface RecruiterProfile {
  is_visible: boolean
  is_featured: boolean
  profile_views: number
  recruiter_contacts: number
  visibility_score: number
  headline: string
  availability: 'immediately' | 'two-weeks' | 'one-month' | 'not-looking'
  open_to: string[]
}
