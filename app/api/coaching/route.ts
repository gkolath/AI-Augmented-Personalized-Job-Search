import { NextRequest, NextResponse } from 'next/server'
import { generateWeeklyCoachingPlan } from '@/lib/openai/client'

const DEMO_PLAN = {
  week_number: 1,
  theme: 'Foundation & First Applications',
  goals: [
    'Submit 10 targeted job applications',
    'Optimize LinkedIn profile with keywords',
    'Complete 2 coding practice sessions',
  ],
  daily_tasks: [
    {
      day: 'Monday',
      tasks: [
        { id: '1', title: 'Update LinkedIn headline & summary', description: 'Add your target role keywords and a compelling summary that speaks to hiring managers', duration: '45 min', type: 'network', priority: 'high', completed: false, resource_url: 'https://www.linkedin.com/in/' },
        { id: '2', title: 'Apply to 3 jobs on JSearch results', description: 'Focus on roles with 70%+ match score. Customize your cover letter for each.', duration: '1 hour', type: 'apply', priority: 'high', completed: false },
        { id: '3', title: 'Research 5 target companies', description: 'Visit their careers page, check Glassdoor reviews, note tech stack', duration: '30 min', type: 'research', priority: 'medium', completed: false },
      ]
    },
    {
      day: 'Tuesday',
      tasks: [
        { id: '4', title: 'Solve 2 LeetCode problems', description: 'Focus on arrays and strings (Easy/Medium level)', duration: '1 hour', type: 'practice', priority: 'high', completed: false, resource_url: 'https://leetcode.com/problemset/' },
        { id: '5', title: 'Apply to 3 more jobs', description: 'Target remote positions with sponsorship available', duration: '1 hour', type: 'apply', priority: 'high', completed: false },
        { id: '6', title: 'Connect with 5 engineers on LinkedIn', description: 'Send personalized connection requests to people at your target companies', duration: '30 min', type: 'network', priority: 'medium', completed: false },
      ]
    },
    {
      day: 'Wednesday',
      tasks: [
        { id: '7', title: 'Practice behavioral interview answers', description: 'Prepare STAR answers for: leadership, conflict, failure, achievement', duration: '45 min', type: 'practice', priority: 'high', completed: false },
        { id: '8', title: 'Apply to 2 jobs + 1 stretch role', description: 'The stretch role builds confidence — you might surprise yourself', duration: '1 hour', type: 'apply', priority: 'high', completed: false },
        { id: '9', title: 'Learn one new skill (30 min module)', description: 'Pick the top skill from your learning path and start the first module', duration: '30 min', type: 'learn', priority: 'medium', completed: false },
      ]
    },
    {
      day: 'Thursday',
      tasks: [
        { id: '10', title: 'Follow up on applications from Day 1', description: 'Send a brief, professional follow-up email to companies you applied to Monday', duration: '30 min', type: 'network', priority: 'high', completed: false },
        { id: '11', title: 'Mock interview practice', description: 'Use the AI mock interviewer for 20 minutes — focus on first impressions', duration: '30 min', type: 'practice', priority: 'high', completed: false },
        { id: '12', title: 'Research salary ranges for target roles', description: 'Use the Salary Intelligence tool to know your market value before interviews', duration: '30 min', type: 'research', priority: 'medium', completed: false },
      ]
    },
    {
      day: 'Friday',
      tasks: [
        { id: '13', title: 'Apply to 2 final jobs this week', description: 'Hit your 10-application goal to finish the week strong', duration: '1 hour', type: 'apply', priority: 'high', completed: false },
        { id: '14', title: 'Weekly review: what worked?', description: 'Track response rates. Which job sources and titles got replies? Adjust strategy.', duration: '30 min', type: 'research', priority: 'medium', completed: false },
        { id: '15', title: 'Plan weekend skill learning', description: 'Schedule 2 hours of learning path modules for the weekend', duration: '15 min', type: 'learn', priority: 'low', completed: false },
      ]
    },
  ],
  metrics: [
    { label: 'Applications Submitted', target: '10 this week' },
    { label: 'Response Rate', target: '10-20% is healthy' },
    { label: 'LinkedIn Connections', target: '20 new this week' },
    { label: 'Practice Hours', target: '3 hours' },
  ],
  motivational_insight: 'The first week sets the foundation. Consistency beats intensity — 10 targeted applications beats 50 random ones every time. Focus on match score ≥70% and you\'ll see results by week 3.',
  next_week_preview: 'Week 2: Networking deep-dive + interview preparation as responses start coming in.',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { profile, weekNumber, applicationsThisWeek, interviewsScheduled } = body

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      return NextResponse.json({ plan: { ...DEMO_PLAN, week_number: weekNumber || 1 } })
    }

    const plan = await generateWeeklyCoachingPlan(
      profile || { skills: [], job_titles: ['Software Engineer'], experience_years: 3 },
      weekNumber || 1,
      applicationsThisWeek || 0,
      interviewsScheduled || 0
    )
    return NextResponse.json({ plan })
  } catch (error) {
    console.error('Coaching API error:', error)
    return NextResponse.json({ plan: DEMO_PLAN })
  }
}
