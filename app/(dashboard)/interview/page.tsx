'use client'

import { useState, useRef, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Mic, MicOff, ChevronRight, RotateCcw, Star, Brain, MessageSquare, CheckCircle, TrendingUp } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { MockInterviewQuestion } from '@/types'

interface SessionState {
  jobTitle: string
  company: string
  type: 'behavioral' | 'technical' | 'mixed'
  round: number
  questions: MockInterviewQuestion[]
  currentQuestion: MockInterviewQuestion | null
  currentAnswer: string
  isLoadingQuestion: boolean
  isLoadingEval: boolean
  phase: 'setup' | 'answering' | 'feedback' | 'complete'
}

const TYPE_CONFIG = {
  behavioral: { label: 'Behavioral', desc: 'STAR method, soft skills, past experience', color: 'bg-blue-500/10 text-blue-400 border-blue-500/30' },
  technical: { label: 'Technical', desc: 'Algorithms, system design, coding concepts', color: 'bg-purple-500/10 text-purple-400 border-purple-500/30' },
  mixed: { label: 'Mixed', desc: 'Both behavioral and technical questions', color: 'bg-green-500/10 text-green-400 border-green-500/30' },
}

const SCORE_COLOR = (s: number) => s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'

export default function InterviewPage() {
  const [session, setSession] = useState<SessionState>({
    jobTitle: '', company: '', type: 'mixed', round: 0,
    questions: [], currentQuestion: null, currentAnswer: '',
    isLoadingQuestion: false, isLoadingEval: false, phase: 'setup',
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function update(patch: Partial<SessionState>) {
    setSession(s => ({ ...s, ...patch }))
  }

  async function startInterview() {
    if (!session.jobTitle.trim()) { toast.error('Enter a job title first'); return }
    update({ isLoadingQuestion: true, phase: 'answering', round: 1 })
    try {
      const { data } = await axios.post('/api/ai/mock-interview', {
        action: 'question',
        jobTitle: session.jobTitle,
        company: session.company || 'the company',
        type: session.type,
        previousQuestions: [],
        roundNumber: 1,
      })
      const q: MockInterviewQuestion = {
        id: '1',
        question: data.question.question,
        category: data.question.category,
        difficulty: data.question.difficulty,
        hint: data.question.hint,
      }
      update({ currentQuestion: q, isLoadingQuestion: false, currentAnswer: '' })
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch {
      toast.error('Failed to load question')
      update({ phase: 'setup', isLoadingQuestion: false })
    }
  }

  async function submitAnswer() {
    if (!session.currentAnswer.trim()) { toast.error('Type your answer first'); return }
    update({ isLoadingEval: true })
    try {
      const { data } = await axios.post('/api/ai/mock-interview', {
        action: 'evaluate',
        question: session.currentQuestion?.question,
        answer: session.currentAnswer,
        jobTitle: session.jobTitle,
        category: session.currentQuestion?.category,
      })
      const enriched = { ...session.currentQuestion!, user_answer: session.currentAnswer, ai_feedback: data.evaluation.feedback, score: data.evaluation.score, tone_score: data.evaluation.tone_score, confidence_score: data.evaluation.confidence_score, suggested_answer: data.evaluation.suggested_answer, evaluation: data.evaluation }
      update({ questions: [...session.questions, enriched], phase: 'feedback', isLoadingEval: false })
    } catch {
      toast.error('Evaluation failed')
      update({ isLoadingEval: false })
    }
  }

  async function nextQuestion() {
    if (session.round >= 10) { update({ phase: 'complete' }); return }
    const nextRound = session.round + 1
    update({ isLoadingQuestion: true, phase: 'answering', round: nextRound, currentAnswer: '' })
    try {
      const { data } = await axios.post('/api/ai/mock-interview', {
        action: 'question',
        jobTitle: session.jobTitle,
        company: session.company || 'the company',
        type: session.type,
        previousQuestions: session.questions.map(q => q.question),
        roundNumber: nextRound,
      })
      const q: MockInterviewQuestion = {
        id: String(nextRound),
        question: data.question.question,
        category: data.question.category,
        difficulty: data.question.difficulty,
        hint: data.question.hint,
      }
      update({ currentQuestion: q, isLoadingQuestion: false })
      setTimeout(() => textareaRef.current?.focus(), 100)
    } catch {
      toast.error('Failed to load question')
      update({ isLoadingQuestion: false })
    }
  }

  function reset() {
    setSession({ jobTitle: '', company: '', type: 'mixed', round: 0, questions: [], currentQuestion: null, currentAnswer: '', isLoadingQuestion: false, isLoadingEval: false, phase: 'setup' })
  }

  const avgScore = session.questions.length
    ? Math.round(session.questions.reduce((sum, q) => sum + (q.score || 0), 0) / session.questions.length)
    : 0

  const currentEval = session.questions[session.questions.length - 1]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">AI Mock Interviewer</h1>
          </div>
          <p className="text-muted-foreground">Real-time interview simulation with instant AI feedback on every answer</p>
        </div>

        {/* Setup Phase */}
        {session.phase === 'setup' && (
          <div className="space-y-6">
            <Card className="p-6 border-border/50">
              <h3 className="font-semibold mb-4">Interview Setup</h3>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Job Title *</label>
                  <input
                    className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Senior Software Engineer"
                    value={session.jobTitle}
                    onChange={e => update({ jobTitle: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-1 block">Company (optional)</label>
                  <input
                    className="w-full h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. Google, Stripe, startup"
                    value={session.company}
                    onChange={e => update({ company: e.target.value })}
                  />
                </div>
              </div>

              <label className="text-sm text-muted-foreground mb-2 block">Interview Type</label>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {Object.entries(TYPE_CONFIG).map(([k, cfg]) => (
                  <button
                    key={k}
                    onClick={() => update({ type: k as SessionState['type'] })}
                    className={`p-4 rounded-xl border text-left transition-all ${session.type === k ? 'border-primary bg-primary/10' : 'border-border/50 hover:border-primary/30'}`}
                  >
                    <div className="font-medium text-sm mb-1">{cfg.label}</div>
                    <div className="text-xs text-muted-foreground">{cfg.desc}</div>
                  </button>
                ))}
              </div>

              <Button onClick={startInterview} className="w-full bg-primary hover:bg-primary/90 h-12 text-base gap-2">
                <Mic className="h-5 w-5" /> Start Mock Interview (10 Questions)
              </Button>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { icon: '🎯', title: 'Realistic Questions', desc: 'Company-specific interview questions based on real hiring patterns' },
                { icon: '⚡', title: 'Instant Feedback', desc: 'Score on content, tone, and confidence after every answer' },
                { icon: '📈', title: 'Track Progress', desc: 'See improvement across sessions with detailed scoring' },
              ].map(f => (
                <Card key={f.title} className="p-5 border-border/50">
                  <div className="text-3xl mb-2">{f.icon}</div>
                  <h4 className="font-semibold mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Question Phase */}
        {(session.phase === 'answering' || session.phase === 'feedback') && (
          <div className="space-y-4">
            {/* Progress */}
            <Card className="p-4 border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Question {session.round} of 10</span>
                {session.questions.length > 0 && (
                  <span className={`text-sm font-bold ${SCORE_COLOR(avgScore)}`}>Avg: {avgScore}/100</span>
                )}
              </div>
              <Progress value={session.round * 10} className="h-2" />
            </Card>

            {/* Current Question */}
            {session.currentQuestion && (
              <Card className="p-6 border-primary/20 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <Badge className={`text-xs ${session.currentQuestion.difficulty === 'hard' ? 'bg-red-500/10 text-red-400 border-red-500/30' : session.currentQuestion.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'}`}>
                    {session.currentQuestion.difficulty}
                  </Badge>
                  <Badge variant="outline" className="text-xs">{session.currentQuestion.category}</Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{session.currentQuestion.question}</h3>
                {session.currentQuestion.hint && (
                  <p className="text-sm text-muted-foreground italic">💡 Hint: {session.currentQuestion.hint}</p>
                )}
              </Card>
            )}

            {session.isLoadingQuestion && (
              <Card className="p-12 border-border/50 text-center">
                <Brain className="h-10 w-10 mx-auto mb-3 text-primary animate-pulse" />
                <p className="text-muted-foreground">Generating your next question...</p>
              </Card>
            )}

            {/* Answer Area */}
            {session.phase === 'answering' && !session.isLoadingQuestion && (
              <>
                <textarea
                  ref={textareaRef}
                  className="w-full h-40 bg-muted/30 rounded-xl p-4 text-sm resize-none border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Type your answer here... (Use STAR method for behavioral questions: Situation, Task, Action, Result)"
                  value={session.currentAnswer}
                  onChange={e => update({ currentAnswer: e.target.value })}
                />
                <div className="flex gap-3">
                  <Button onClick={submitAnswer} disabled={session.isLoadingEval || !session.currentAnswer.trim()} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                    {session.isLoadingEval ? <><Brain className="h-4 w-4 animate-pulse" /> Evaluating...</> : <><ChevronRight className="h-4 w-4" /> Submit Answer</>}
                  </Button>
                  <Button variant="outline" onClick={reset}>End Session</Button>
                </div>
              </>
            )}

            {/* Feedback Phase */}
            {session.phase === 'feedback' && currentEval?.evaluation && (
              <div className="space-y-4">
                {/* Scores */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Content', value: currentEval.score || 0 },
                    { label: 'Tone', value: currentEval.tone_score || 0 },
                    { label: 'Confidence', value: currentEval.confidence_score || 0 },
                  ].map(s => (
                    <Card key={s.label} className="p-4 border-border/50 text-center">
                      <div className={`text-3xl font-bold mb-1 ${SCORE_COLOR(s.value)}`}>{s.value}</div>
                      <div className="text-xs text-muted-foreground">{s.label}</div>
                    </Card>
                  ))}
                </div>

                <Card className="p-4 border-border/50">
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> AI Feedback</h4>
                  <p className="text-sm text-muted-foreground mb-3">{currentEval.ai_feedback}</p>

                  {(currentEval.evaluation as Record<string, string[]>)?.strengths?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-green-400 mb-1">✓ Strengths</div>
                      {((currentEval.evaluation as Record<string, string[]>).strengths || []).map((s: string, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground">• {s}</div>
                      ))}
                    </div>
                  )}

                  {(currentEval.evaluation as Record<string, string[]>)?.improvements?.length > 0 && (
                    <div className="mb-3">
                      <div className="text-xs font-medium text-yellow-400 mb-1">⚡ Improvements</div>
                      {((currentEval.evaluation as Record<string, string[]>).improvements || []).map((s: string, i: number) => (
                        <div key={i} className="text-sm text-muted-foreground">• {s}</div>
                      ))}
                    </div>
                  )}

                  {currentEval.suggested_answer && (
                    <div className="bg-muted/30 rounded-lg p-3">
                      <div className="text-xs font-medium text-primary mb-1">💡 Stronger Answer</div>
                      <p className="text-sm text-muted-foreground italic">{currentEval.suggested_answer}</p>
                    </div>
                  )}
                </Card>

                <div className="flex gap-3">
                  <Button onClick={nextQuestion} className="flex-1 bg-primary hover:bg-primary/90 gap-2">
                    {session.round >= 10 ? <><CheckCircle className="h-4 w-4" /> View Results</> : <><ChevronRight className="h-4 w-4" /> Next Question</>}
                  </Button>
                  <Button variant="outline" onClick={reset}>End Session</Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Complete Phase */}
        {session.phase === 'complete' && (
          <div className="space-y-6">
            <Card className="p-8 border-border/50 text-center">
              <div className="text-5xl mb-3">🎉</div>
              <h2 className="text-2xl font-bold mb-2">Interview Complete!</h2>
              <p className="text-muted-foreground mb-4">You answered {session.questions.length} questions for {session.jobTitle}</p>
              <div className={`text-6xl font-bold mb-1 ${SCORE_COLOR(avgScore)}`}>{avgScore}</div>
              <div className="text-sm text-muted-foreground mb-6">Overall Score</div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{Math.round(session.questions.reduce((s, q) => s + (q.tone_score || 0), 0) / session.questions.length)}</div>
                  <div className="text-xs text-muted-foreground">Avg Tone</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-400">{Math.round(session.questions.reduce((s, q) => s + (q.confidence_score || 0), 0) / session.questions.length)}</div>
                  <div className="text-xs text-muted-foreground">Avg Confidence</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-400">{session.questions.filter(q => (q.score || 0) >= 75).length}</div>
                  <div className="text-xs text-muted-foreground">Strong Answers</div>
                </div>
              </div>
              <div className="flex gap-3 justify-center">
                <Button onClick={reset} className="bg-primary hover:bg-primary/90 gap-2"><RotateCcw className="h-4 w-4" /> Practice Again</Button>
              </div>
            </Card>

            {/* Question Recap */}
            <div className="space-y-3">
              {session.questions.map((q, i) => (
                <Card key={q.id} className="p-4 border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs text-muted-foreground">Q{i + 1}</span>
                        <Badge variant="outline" className="text-xs">{q.category}</Badge>
                      </div>
                      <p className="text-sm font-medium mb-1">{q.question}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{q.ai_feedback}</p>
                    </div>
                    <div className={`text-2xl font-bold shrink-0 ${SCORE_COLOR(q.score || 0)}`}>{q.score}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
