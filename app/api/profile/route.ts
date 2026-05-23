import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (error?.code === 'PGRST116') return NextResponse.json(null, { status: 404 })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const {
    full_name, phone, linkedin_url, github_url, skills, experience_years,
    experience_level, preferred_countries, needs_visa, expected_salary_min,
    expected_salary_max, salary_currency, job_titles, freelance_interest,
    work_mode, resume_url, resume_text, summary
  } = body

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name, phone, linkedin_url, github_url, skills, experience_years,
      experience_level, preferred_countries, needs_visa, expected_salary_min,
      expected_salary_max, salary_currency, job_titles, freelance_interest,
      work_mode, resume_url, resume_text, summary,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
