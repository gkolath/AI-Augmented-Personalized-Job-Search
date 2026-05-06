import { NextRequest, NextResponse } from 'next/server'
import { generateMockInterviewQuestion, evaluateMockAnswer } from '@/lib/openai/client'

const DEMO_QUESTIONS = [
  { question: 'Tell me about yourself and your background in software development.', category: 'hr', difficulty: 'easy', hint: 'Cover your experience, key skills, and why you want this role.' },
  { question: 'Describe a challenging technical problem you solved. Walk me through your approach.', category: 'behavioral', difficulty: 'medium', hint: 'Use STAR method: Situation, Task, Action, Result.' },
  { question: 'How do you handle conflicting priorities when multiple deadlines are approaching?', category: 'situational', difficulty: 'medium', hint: 'Show your prioritization and communication skills.' },
  { question: 'Explain the difference between synchronous and asynchronous programming.', category: 'technical', difficulty: 'medium', hint: 'Include real-world examples and use cases.' },
  { question: 'Where do you see yourself in 5 years?', category: 'hr', difficulty: 'easy', hint: 'Align your growth with the company and role.' },
]

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, jobTitle, company, type, previousQuestions, roundNumber, question, answer, category } = body

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key') {
      if (action === 'question') {
        const q = DEMO_QUESTIONS[(roundNumber - 1) % DEMO_QUESTIONS.length]
        return NextResponse.json({ question: q })
      }
      if (action === 'evaluate') {
        return NextResponse.json({
          evaluation: {
            score: Math.floor(Math.random() * 20) + 70,
            tone_score: Math.floor(Math.random() * 15) + 75,
            confidence_score: Math.floor(Math.random() * 20) + 65,
            feedback: 'Good structure and relevant points. Consider adding specific metrics or examples to strengthen your answer.',
            suggested_answer: `A stronger answer would include a specific example from your experience, quantify the impact, and connect it directly to what this role requires. Your core content was solid.`,
            strengths: ['Clear communication', 'Relevant experience mentioned'],
            improvements: ['Add specific numbers or metrics', 'Connect answer more directly to this role'],
          }
        })
      }
    }

    if (action === 'question') {
      const result = await generateMockInterviewQuestion(jobTitle, company, type, previousQuestions || [], roundNumber || 1)
      return NextResponse.json({ question: result })
    }

    if (action === 'evaluate') {
      const evaluation = await evaluateMockAnswer(question, answer, jobTitle, category)
      return NextResponse.json({ evaluation })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Mock interview error:', error)
    return NextResponse.json({ error: 'Interview session failed' }, { status: 500 })
  }
}
