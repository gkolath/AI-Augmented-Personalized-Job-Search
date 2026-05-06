import { NextRequest, NextResponse } from 'next/server'
import { generateCoverLetter } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { job } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('full_name,skills,experience_years,summary').eq('id', user.id).single()

    const letter = await generateCoverLetter(
      { title: job.title, company: job.company, description: job.description },
      { full_name: profile?.full_name || 'Candidate', skills: profile?.skills || [], experience_years: profile?.experience_years || 0, summary: profile?.summary }
    )

    return NextResponse.json({ cover_letter: letter })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate cover letter' }, { status: 500 })
  }
}
