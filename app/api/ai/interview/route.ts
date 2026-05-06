import { NextRequest, NextResponse } from 'next/server'
import { generateInterviewPrep } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { job } = await request.json()

    const { data: profile } = await supabase.from('profiles').select('skills,experience_years,summary').eq('id', user.id).single()

    const prep = await generateInterviewPrep(
      { title: job.title, company: job.company, description: job.description, skills: job.skills_required || [] },
      { skills: profile?.skills || [], experience_years: profile?.experience_years || 0, summary: profile?.summary }
    )

    return NextResponse.json(prep)
  } catch (error) {
    console.error('Interview prep error:', error)
    return NextResponse.json({ error: 'Failed to generate interview prep' }, { status: 500 })
  }
}
