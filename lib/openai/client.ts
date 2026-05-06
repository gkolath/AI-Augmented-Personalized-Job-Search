import Anthropic from '@anthropic-ai/sdk'

// Lazy-init to avoid crash when ANTHROPIC_API_KEY is not set
let _client: Anthropic | null = null
function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  }
  return _client
}

const MODEL = 'claude-haiku-4-5'

async function ask(prompt: string, maxTokens = 1500): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [{ role: 'user', content: prompt }],
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : ''
}

async function askJSON<T>(prompt: string, maxTokens = 2000): Promise<T> {
  const text = await ask(prompt + '\n\nRespond with valid JSON only. No markdown, no code fences.', maxTokens)
  // Strip any accidental markdown fences
  const clean = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim()
  try {
    return JSON.parse(clean) as T
  } catch {
    // Response may have been truncated — attempt to auto-close the JSON
    const repaired = repairJSON(clean)
    return JSON.parse(repaired) as T
  }
}

/** Best-effort repair for truncated JSON responses */
function repairJSON(s: string): string {
  // Count open brackets/braces and close them
  let result = s
  // Remove trailing comma before closing
  result = result.replace(/,\s*$/, '')
  const opens = (result.match(/\[/g) || []).length - (result.match(/\]/g) || []).length
  const braces = (result.match(/\{/g) || []).length - (result.match(/\}/g) || []).length
  // Close any open string
  if ((result.match(/"/g) || []).length % 2 !== 0) result += '"'
  for (let i = 0; i < opens; i++) result += ']'
  for (let i = 0; i < braces; i++) result += '}'
  return result
}

// ── Interview Prep ──────────────────────────────────────────────────────────

export async function generateInterviewPrep(
  job: { title: string; company: string; description: string; skills: string[] },
  userProfile: { skills: string[]; experience_years: number; summary?: string }
) {
  return askJSON(
    `You are an expert career coach. Generate comprehensive interview preparation for:

Job: ${job.title} at ${job.company}
Job Description: ${job.description.slice(0, 800)}
Required Skills: ${job.skills.join(', ')}

Candidate:
- Skills: ${userProfile.skills.join(', ')}
- Experience: ${userProfile.experience_years} years
- Summary: ${userProfile.summary || 'Not provided'}

Return JSON:
{
  "questions": [{"category": "Technical|Behavioral|HR|Situational", "question": "...", "answer": "..."}],
  "technical_topics": ["topic1"],
  "company_tips": ["tip1"],
  "salary_tips": ["tip1"],
  "resources": [{"type": "youtube|blog|course|docs", "title": "...", "url": "..."}]
}

Generate 10 questions, 5 technical topics, 5 company tips, 3 salary tips, 5 resources.`,
    2000
  )
}

// ── Mock Interview ───────────────────────────────────────────────────────────

export async function generateMockInterviewQuestion(
  jobTitle: string,
  company: string,
  type: 'behavioral' | 'technical' | 'mixed',
  previousQuestions: string[],
  roundNumber: number
): Promise<{ question: string; category: string; difficulty: string; hint?: string }> {
  return askJSON(
    `You are a senior interviewer at ${company} conducting a ${type} interview for ${jobTitle}.
Round: ${roundNumber}/10.
Previous questions: ${previousQuestions.slice(-3).join(' | ')}

Generate the NEXT interview question. Return JSON:
{
  "question": "...",
  "category": "behavioral|technical|situational|hr",
  "difficulty": "easy|medium|hard",
  "hint": "what a great answer should include (1 sentence)"
}

Make it realistic, progressively harder, and don't repeat topics.`,
    300
  )
}

export async function evaluateMockAnswer(
  question: string,
  answer: string,
  jobTitle: string,
  category: string
): Promise<{ score: number; tone_score: number; confidence_score: number; feedback: string; suggested_answer: string; strengths: string[]; improvements: string[] }> {
  return askJSON(
    `Evaluate this interview answer for ${jobTitle}:

Question (${category}): ${question}
Candidate Answer: ${answer}

Return JSON:
{
  "score": 0-100,
  "tone_score": 0-100,
  "confidence_score": 0-100,
  "feedback": "2-3 sentences of actionable feedback",
  "suggested_answer": "A stronger version of their answer (2-3 sentences)",
  "strengths": ["what they did well"],
  "improvements": ["specific things to improve"]
}`,
    600
  )
}

// ── Resume Tools ─────────────────────────────────────────────────────────────

export async function analyzeResume(
  resumeText: string,
  targetRole?: string
): Promise<import('@/types').ResumeAnalysis> {
  return askJSON(
    `You are an expert ATS consultant and career coach. Analyze this resume${targetRole ? ` for the role of ${targetRole}` : ''}.

Resume:
${resumeText.slice(0, 3500)}

Return JSON:
{
  "overall_score": 0-100,
  "ats_score": 0-100,
  "sections": [
    {
      "name": "Summary|Experience|Skills|Education|Formatting",
      "score": 0-100,
      "issues": ["issue1"],
      "suggestions": ["suggestion1"]
    }
  ],
  "missing_keywords": ["keyword1"],
  "strong_points": ["point1"],
  "critical_fixes": ["fix1"],
  "ats_tips": ["tip1"],
  "word_count": 0,
  "estimated_read_time": "X seconds"
}

Keep each string value concise (under 100 chars) to avoid truncation.`,
    4000
  )
}

export async function tailorResumeToJob(
  resumeText: string,
  jobTitle: string,
  jobDescription: string,
  requiredSkills: string[]
): Promise<import('@/types').TailoredResume> {
  return askJSON(
    `You are an expert resume writer. Tailor this resume for the job below.

Target Job: ${jobTitle}
Job Description: ${jobDescription.slice(0, 1000)}
Required Skills: ${requiredSkills.join(', ')}

Original Resume:
${resumeText.slice(0, 3000)}

Rewrite the summary, emphasize relevant experience, add missing keywords naturally, and optimize for ATS.

Return JSON:
{
  "original_text": "first 200 chars of original",
  "tailored_text": "full rewritten resume",
  "changes_made": ["change1", "change2"],
  "keywords_added": ["keyword1"],
  "match_improvement": 0-100
}

Keep the tailored_text concise but complete.`,
    5000
  )
}

// ── Cover Letter ─────────────────────────────────────────────────────────────

export async function generateCoverLetter(
  job: { title: string; company: string; description: string },
  profile: { full_name: string; skills: string[]; experience_years: number; summary?: string }
): Promise<string> {
  return ask(
    `Write a compelling, personalized cover letter for ${profile.full_name} applying for ${job.title} at ${job.company}.
Job Description: ${job.description.slice(0, 500)}
Candidate: ${profile.experience_years} years experience, skills: ${profile.skills.slice(0, 8).join(', ')}, ${profile.summary || ''}
Make it professional, specific, and under 300 words. Start with "Dear Hiring Manager,"`,
    500
  )
}

// ── Learning Path ─────────────────────────────────────────────────────────────

export async function generateLearningPath(
  currentSkills: string[],
  targetRole: string,
  experienceYears: number,
  hoursPerDay: number
): Promise<import('@/types').LearningPath> {
  return askJSON(
    `Create a personalized learning path to become a ${targetRole}.

Current Skills: ${currentSkills.join(', ')}
Experience: ${experienceYears} years
Available Hours/Day: ${hoursPerDay}

Return JSON:
{
  "target_role": "${targetRole}",
  "skill_gaps": [
    {
      "skill": "skill name",
      "current_level": "none|beginner|intermediate|advanced",
      "required_level": "beginner|intermediate|advanced|expert",
      "importance": "critical|important|nice-to-have",
      "time_to_learn": "e.g. 2 weeks"
    }
  ],
  "learning_modules": [
    {
      "id": "1",
      "title": "course title",
      "skill": "skill it teaches",
      "type": "video|course|project|reading|practice",
      "provider": "Udemy|Coursera|YouTube|freeCodeCamp|etc",
      "url": "real url",
      "duration": "e.g. 8 hours",
      "is_free": true,
      "difficulty": "beginner|intermediate|advanced",
      "description": "1 sentence"
    }
  ],
  "estimated_weeks": 0,
  "daily_hours": ${hoursPerDay},
  "priority_skills": ["top 3 skills to learn first"],
  "job_readiness_score": 0-100
}

Include 5-8 skill gaps and 8-12 learning modules with real resources.`,
    2000
  )
}

// ── Salary Intelligence ───────────────────────────────────────────────────────

export async function getSalaryIntelligence(
  role: string,
  location: string,
  experienceYears: number,
  skills: string[]
): Promise<import('@/types').SalaryIntelligence> {
  return askJSON(
    `Provide salary intelligence for:
Role: ${role}
Location: ${location}
Experience: ${experienceYears} years
Key Skills: ${skills.slice(0, 6).join(', ')}

Return JSON with realistic 2024/2025 market data:
{
  "role": "${role}",
  "location": "${location}",
  "percentiles": { "p10": 0, "p25": 0, "p50": 0, "p75": 0, "p90": 0 },
  "currency": "USD",
  "yoe_adjustment": "e.g. +$5k per year above median",
  "remote_premium": "e.g. +10-15% for remote roles",
  "negotiation_scripts": [
    {
      "scenario": "e.g. Initial offer below market",
      "script": "exact words to say",
      "outcome": "expected result"
    }
  ],
  "offer_comparison": null,
  "benefits_value": [
    { "name": "benefit name", "estimated_value": 0, "notes": "context" }
  ],
  "market_trend": "rising|stable|declining",
  "top_paying_companies": [
    { "name": "company name", "avg_salary": 0 }
  ]
}

Include 3 negotiation scripts, 5 benefits, 5 top companies.`,
    1500
  )
}

// ── Career Coaching ───────────────────────────────────────────────────────────

export async function generateWeeklyCoachingPlan(
  profile: { skills: string[]; job_titles: string[]; experience_years: number },
  weekNumber: number,
  applicationsThisWeek: number,
  interviewsScheduled: number
): Promise<import('@/types').CoachingPlan> {
  return askJSON(
    `Create Week ${weekNumber} job search coaching plan for:
Profile: ${profile.experience_years} years exp, targeting ${profile.job_titles.join(', ')}
Skills: ${profile.skills.slice(0, 8).join(', ')}
This week: ${applicationsThisWeek} applications, ${interviewsScheduled} interviews scheduled

Return JSON:
{
  "week_number": ${weekNumber},
  "theme": "week theme in 5 words",
  "goals": ["goal1", "goal2", "goal3"],
  "daily_tasks": [
    {
      "day": "Monday",
      "tasks": [
        {
          "id": "1",
          "title": "task title",
          "description": "what to do",
          "duration": "30 min",
          "type": "apply|learn|network|practice|research",
          "priority": "high|medium|low",
          "completed": false,
          "resource_url": "optional url"
        }
      ]
    }
  ],
  "metrics": [{ "label": "metric name", "target": "target value" }],
  "motivational_insight": "personalized insight for this week",
  "next_week_preview": "what comes next"
}

Include Mon-Fri with 3-4 tasks per day.`,
    2000
  )
}

// ── Resume Parser ─────────────────────────────────────────────────────────────

export async function parseResume(resumeText: string): Promise<Partial<{ skills: string[]; experience_years: number; summary: string; job_titles: string[] }>> {
  return askJSON(
    `Parse this resume and extract: skills (array), experience_years (number), summary (2 sentences), job_titles (array of roles held or wanted).

Resume:
${resumeText.slice(0, 3000)}`,
    800
  )
}

// ── CareerBot ─────────────────────────────────────────────────────────────────

export async function careerBotChat(
  messages: { role: 'user' | 'assistant'; content: string }[],
  systemContext: string
): Promise<string> {
  const msg = await getClient().messages.create({
    model: MODEL,
    max_tokens: 1000,
    system: `You are CareerBot, an expert AI job search assistant for AI Global Job Hunter.
${systemContext}

Help users: search jobs, tailor resumes, prepare for interviews, find freelance gigs, get career advice. Be concise and actionable.`,
    messages: messages.map(m => ({ role: m.role, content: m.content })),
  })
  const block = msg.content[0]
  return block.type === 'text' ? block.text : "I couldn't process that. Please try again."
}

// ── AI Career Recommendations ─────────────────────────────────────────────────

export async function getAICareerRecommendations(profile: {
  skills: string[]
  experience_years: number
  preferred_countries: string[]
  job_titles: string[]
}): Promise<{
  easiest_countries: string[]
  salary_estimate: string
  skills_to_learn: string[]
  linkedin_tips: string[]
  best_apply_time: string
}> {
  return askJSON(
    `Based on this profile, provide career intelligence:
Skills: ${profile.skills.join(', ')}
Experience: ${profile.experience_years} years
Roles: ${profile.job_titles.join(', ')}
Countries: ${profile.preferred_countries.join(', ')}

Return JSON: { "easiest_countries": [], "salary_estimate": "string", "skills_to_learn": [], "linkedin_tips": [], "best_apply_time": "string" }`,
    600
  )
}
