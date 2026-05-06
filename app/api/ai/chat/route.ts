import { NextRequest, NextResponse } from 'next/server'
import { careerBotChat } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'
import { aggregateJobs } from '@/lib/jobs/aggregator'
import { enrichJobsWithMatches } from '@/lib/jobs/matcher'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { messages } = await request.json()
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || ''

    // Detect job search intent
    let jobs = undefined
    if (lastMessage.includes('find') || lastMessage.includes('search') || lastMessage.includes('apply')) {
      const queryMatch = lastMessage.match(/(?:find|search|apply to)\s+(.+?)(?:\s+in\s+(.+))?$/)
      if (queryMatch) {
        const query = queryMatch[1]
        const location = queryMatch[2] || ''
        const found = await aggregateJobs({ query, location, skills: profile?.skills || [] })
        jobs = profile ? enrichJobsWithMatches(found, profile).slice(0, 10) : found.slice(0, 10)
      }
    }

    const systemContext = profile
      ? `User profile: ${profile.full_name}, Skills: ${profile.skills?.join(', ')}, Experience: ${profile.experience_years} years, Looking for: ${profile.job_titles?.join(', ')}`
      : 'User not fully set up yet.'

    const reply = await careerBotChat(
      messages.map((m: { role: string; content: string }) => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      systemContext
    )

    return NextResponse.json({ reply, jobs })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
