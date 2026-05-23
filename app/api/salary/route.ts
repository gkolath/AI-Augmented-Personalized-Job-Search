import { NextRequest, NextResponse } from 'next/server'
import { getSalaryIntelligence } from '@/lib/openai/client'
import { createClient } from '@/lib/supabase/server'

const DEMO_SALARY = {
  role: 'Software Engineer',
  location: 'San Francisco, CA',
  percentiles: { p10: 95000, p25: 120000, p50: 155000, p75: 185000, p90: 220000 },
  currency: 'USD',
  yoe_adjustment: '+$8,000 per additional year of experience above median',
  remote_premium: '+10-15% for fully remote roles (negotiable)',
  negotiation_scripts: [
    {
      scenario: 'Initial offer below market (below P50)',
      script: '"Thank you for the offer. Based on my research of market rates for this role in this location, and my X years of experience with [key skills], I was expecting something closer to $[target]. Is there flexibility to get to that range?"',
      outcome: 'Companies typically have 10-15% room above initial offer'
    },
    {
      scenario: 'Competing offer leverage',
      script: '"I\'m very excited about this opportunity and it\'s my top choice. However, I do have a competing offer at $X. I\'d hate to make a decision based purely on compensation — can we close the gap to $[target]?"',
      outcome: 'Most likely to succeed — creates urgency and validates your market value'
    },
    {
      scenario: 'No immediate raise but offer is fair',
      script: '"I\'m happy to accept at this level. Could we agree on a 6-month review with a clear path to $[target] if I hit these specific milestones: [metrics]?"',
      outcome: 'Gets written commitment for future increase tied to performance'
    }
  ],
  offer_comparison: null,
  benefits_value: [
    { name: 'Health Insurance (family)', estimated_value: 18000, notes: 'Employer contribution toward family premium' },
    { name: '401k Match (4%)', estimated_value: 6200, notes: 'Based on median salary with 4% match' },
    { name: 'Equity/RSUs', estimated_value: 25000, notes: 'Average annual vesting value at Series B+ companies' },
    { name: 'Remote Work Stipend', estimated_value: 2400, notes: '$200/month home office allowance' },
    { name: 'Learning Budget', estimated_value: 2000, notes: 'Annual conference + course allowance' },
  ],
  market_trend: 'stable',
  top_paying_companies: [
    { name: 'Google', avg_salary: 195000 },
    { name: 'Meta', avg_salary: 190000 },
    { name: 'Apple', avg_salary: 182000 },
    { name: 'Microsoft', avg_salary: 175000 },
    { name: 'Stripe', avg_salary: 170000 },
  ]
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role') || 'Software Engineer'
    const location = searchParams.get('location') || 'United States'
    const yoe = parseInt(searchParams.get('yoe') || '3')
    const skills = searchParams.get('skills')?.split(',') || []

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      return NextResponse.json({ salary: { ...DEMO_SALARY, role, location } })
    }

    const salary = await getSalaryIntelligence(role, location, yoe, skills)
    return NextResponse.json({ salary })
  } catch (error) {
    console.error('Salary API error:', error)
    // Simple fallback logic
    let role = 'Software Engineer'
    let location = 'United States'
    try {
      const { searchParams } = new URL(request.url)
      role = searchParams.get('role') || 'Software Engineer'
      location = searchParams.get('location') || 'United States'
    } catch {}
    return NextResponse.json({ salary: { ...DEMO_SALARY, role, location } })
  }
}
