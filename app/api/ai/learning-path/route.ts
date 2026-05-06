import { NextRequest, NextResponse } from 'next/server'
import { generateLearningPath } from '@/lib/openai/client'

const DEMO_PATH = {
  target_role: 'Senior Software Engineer',
  skill_gaps: [
    { skill: 'System Design', current_level: 'beginner', required_level: 'advanced', importance: 'critical', time_to_learn: '6 weeks' },
    { skill: 'TypeScript', current_level: 'intermediate', required_level: 'advanced', importance: 'critical', time_to_learn: '3 weeks' },
    { skill: 'Docker/Kubernetes', current_level: 'none', required_level: 'intermediate', importance: 'important', time_to_learn: '4 weeks' },
    { skill: 'CI/CD Pipelines', current_level: 'beginner', required_level: 'intermediate', importance: 'important', time_to_learn: '2 weeks' },
    { skill: 'AWS Services', current_level: 'beginner', required_level: 'intermediate', importance: 'important', time_to_learn: '5 weeks' },
  ],
  learning_modules: [
    { id: '1', title: 'System Design Interview Course', skill: 'System Design', type: 'course', provider: 'Educative', url: 'https://www.educative.io/courses/grokking-the-system-design-interview', duration: '20 hours', is_free: false, difficulty: 'advanced', description: 'Industry-standard system design preparation used by FAANG engineers.' },
    { id: '2', title: 'TypeScript Deep Dive', skill: 'TypeScript', type: 'reading', provider: 'GitBook', url: 'https://basarat.gitbook.io/typescript/', duration: '10 hours', is_free: true, difficulty: 'intermediate', description: 'Comprehensive free guide to TypeScript from basics to advanced patterns.' },
    { id: '3', title: 'Docker for Developers', skill: 'Docker/Kubernetes', type: 'video', provider: 'YouTube - TechWorld with Nana', url: 'https://www.youtube.com/watch?v=3c-iBn73dDE', duration: '3 hours', is_free: true, difficulty: 'beginner', description: 'Best free Docker crash course for developers.' },
    { id: '4', title: 'Kubernetes Complete Course', skill: 'Docker/Kubernetes', type: 'video', provider: 'YouTube - freeCodeCamp', url: 'https://www.youtube.com/watch?v=X48VuDVv0do', duration: '4 hours', is_free: true, difficulty: 'intermediate', description: 'Full Kubernetes tutorial from beginner to production.' },
    { id: '5', title: 'AWS Cloud Practitioner', skill: 'AWS Services', type: 'course', provider: 'AWS', url: 'https://aws.amazon.com/training/learn-about/cloud-practitioner/', duration: '15 hours', is_free: true, difficulty: 'beginner', description: 'Official AWS foundational training leading to certification.' },
    { id: '6', title: 'GitHub Actions CI/CD', skill: 'CI/CD Pipelines', type: 'course', provider: 'GitHub Skills', url: 'https://skills.github.com/', duration: '5 hours', is_free: true, difficulty: 'beginner', description: 'Interactive hands-on GitHub Actions course from GitHub.' },
    { id: '7', title: 'Build a Full-Stack App', skill: 'TypeScript', type: 'project', provider: 'Self', url: 'https://github.com/topics/nextjs-typescript', duration: '8 hours', is_free: true, difficulty: 'intermediate', description: 'Build a portfolio project using Next.js + TypeScript to demonstrate skills.' },
  ],
  estimated_weeks: 12,
  daily_hours: 2,
  priority_skills: ['System Design', 'TypeScript', 'Docker/Kubernetes'],
  job_readiness_score: 45,
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { currentSkills, targetRole, experienceYears, hoursPerDay } = body

    if (!targetRole) {
      return NextResponse.json({ error: 'Target role required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      return NextResponse.json({ path: { ...DEMO_PATH, target_role: targetRole, daily_hours: hoursPerDay || 2 } })
    }

    const path = await generateLearningPath(currentSkills || [], targetRole, experienceYears || 0, hoursPerDay || 2)
    return NextResponse.json({ path })
  } catch (error) {
    console.error('Learning path error:', error)
    return NextResponse.json({ error: 'Failed to generate learning path' }, { status: 500 })
  }
}
