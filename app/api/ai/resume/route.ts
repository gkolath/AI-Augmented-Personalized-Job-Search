import { NextRequest, NextResponse } from 'next/server'
import { analyzeResume, tailorResumeToJob } from '@/lib/openai/client'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, resumeText, targetRole, jobTitle, jobDescription, requiredSkills } = body

    if (!resumeText) {
      return NextResponse.json({ error: 'Resume text required' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      // Return demo data when no API key
      if (action === 'analyze') {
        return NextResponse.json({
          analysis: {
            overall_score: 72,
            ats_score: 65,
            sections: [
              { name: 'Summary', score: 80, issues: ['Too generic'], suggestions: ['Add specific metrics and target role keywords'] },
              { name: 'Experience', score: 75, issues: ['Bullet points lack quantification'], suggestions: ['Add numbers: "Improved performance by X%", "Managed team of X"'] },
              { name: 'Skills', score: 70, issues: ['Skills not categorized'], suggestions: ['Group by category: Programming, Tools, Soft Skills'] },
              { name: 'Formatting', score: 65, issues: ['Inconsistent date format', 'No ATS-friendly template'], suggestions: ['Use standard date format MM/YYYY', 'Avoid tables and columns'] },
            ],
            missing_keywords: ['TypeScript', 'CI/CD', 'Agile', 'REST APIs'],
            strong_points: ['Clear work history', 'Relevant education', 'Good skills breadth'],
            critical_fixes: ['Add a professional summary targeting your desired role', 'Quantify at least 3 achievements with numbers'],
            ats_tips: ['Use standard section headers', 'Avoid graphics/images', 'Save as .docx or simple PDF'],
            word_count: 450,
            estimated_read_time: '45 seconds',
          }
        })
      }
      return NextResponse.json({
        tailored: {
          tailored_text: resumeText,
          changes_made: ['Summary rewritten to target ' + (jobTitle || 'role'), 'Added relevant keywords', 'Highlighted matching experience'],
          keywords_added: requiredSkills?.slice(0, 4) || ['TypeScript', 'React', 'Node.js'],
          match_improvement: 28,
        }
      })
    }

    if (action === 'analyze') {
      const analysis = await analyzeResume(resumeText, targetRole)
      return NextResponse.json({ analysis })
    }

    if (action === 'tailor') {
      const tailored = await tailorResumeToJob(resumeText, jobTitle, jobDescription, requiredSkills || [])
      return NextResponse.json({ tailored })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Resume API error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
