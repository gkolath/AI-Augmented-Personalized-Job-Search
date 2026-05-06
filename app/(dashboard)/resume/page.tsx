'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  FileText, Zap, CheckCircle, AlertCircle, Target,
  Search, Sparkles, Copy, RefreshCw, TrendingUp
} from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { ResumeAnalysis, TailoredResume } from '@/types'

type Tab = 'analyze' | 'tailor' | 'tips'

const SCORE_COLOR = (s: number) =>
  s >= 80 ? 'text-green-400' : s >= 60 ? 'text-yellow-400' : 'text-red-400'

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState<Tab>('analyze')
  const [resumeText, setResumeText] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [jobTitle, setJobTitle] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null)
  const [tailored, setTailored] = useState<TailoredResume | null>(null)
  const [loadingAnalysis, setLoadingAnalysis] = useState(false)
  const [loadingTailor, setLoadingTailor] = useState(false)

  async function handleAnalyze() {
    if (!resumeText.trim()) { toast.error('Paste your resume text first'); return }
    setLoadingAnalysis(true)
    try {
      const { data } = await axios.post('/api/ai/resume', { action: 'analyze', resumeText, targetRole })
      setAnalysis(data.analysis)
      toast.success('Resume analyzed!')
    } catch { toast.error('Analysis failed') }
    setLoadingAnalysis(false)
  }

  async function handleTailor() {
    if (!resumeText.trim()) { toast.error('Paste your resume text first'); return }
    if (!jobTitle.trim()) { toast.error('Enter the job title'); return }
    setLoadingTailor(true)
    try {
      const { data } = await axios.post('/api/ai/resume', {
        action: 'tailor', resumeText, jobTitle, jobDescription,
        requiredSkills: jobDescription.toLowerCase().split(/\W+/).filter(w => w.length > 3).slice(0, 10)
      })
      setTailored(data.tailored)
      toast.success('Resume tailored!')
    } catch { toast.error('Tailoring failed') }
    setLoadingTailor(false)
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'analyze', label: '📊 Analyze & Score' },
    { key: 'tailor', label: '🎯 Tailor to Job' },
    { key: 'tips', label: '💡 ATS Tips' },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 px-4 pb-16 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">AI Resume Studio</h1>
          </div>
          <p className="text-muted-foreground text-sm ml-12">
            ATS optimization, instant scoring, and job-tailored rewrites
          </p>
        </div>

        {/* Tab Bar */}
        <div className="flex gap-1 p-1 bg-muted/40 rounded-xl mb-8 w-fit">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === t.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ── Analyze Tab ── */}
        {activeTab === 'analyze' && (
          <div className="space-y-6">
            {/* Input area */}
            <Card className="p-6 border-border/50">
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
                Step 1 — Paste your resume
              </h3>
              <textarea
                className="w-full h-52 bg-muted/30 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary border border-border/50 placeholder:text-muted-foreground/50 leading-relaxed"
                placeholder="Paste your resume here as plain text. Tip: copy from your Word doc or PDF viewer."
                value={resumeText}
                onChange={e => setResumeText(e.target.value)}
              />
              <div className="flex items-center gap-3 mt-4">
                <input
                  className="flex-1 h-10 bg-muted/30 rounded-lg px-4 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Target role — optional (e.g. Senior React Developer)"
                  value={targetRole}
                  onChange={e => setTargetRole(e.target.value)}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={loadingAnalysis}
                  className="bg-primary hover:bg-primary/90 gap-2 px-6 h-10 shrink-0"
                >
                  {loadingAnalysis
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Analyzing…</>
                    : <><Zap className="h-4 w-4" /> Analyze Resume</>}
                </Button>
              </div>
            </Card>

            {/* Results */}
            {loadingAnalysis && (
              <div className="grid md:grid-cols-2 gap-4">
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-36 rounded-2xl" />
                <Skeleton className="h-48 rounded-2xl md:col-span-2" />
              </div>
            )}

            {analysis && !loadingAnalysis && (
              <div className="space-y-4">
                {/* Score row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Overall Score', value: analysis.overall_score },
                    { label: 'ATS Score', value: analysis.ats_score },
                    { label: 'Word Count', value: analysis.word_count, suffix: '' },
                    { label: 'Read Time', value: analysis.estimated_read_time, isText: true },
                  ].map(item => (
                    <Card key={item.label} className="p-5 border-border/50 text-center">
                      {'isText' in item && item.isText ? (
                        <div className="text-2xl font-bold text-primary mb-1">{item.value}</div>
                      ) : (
                        <>
                          <div className={`text-4xl font-bold mb-1 ${SCORE_COLOR(Number(item.value))}`}>
                            {item.value}
                          </div>
                          <Progress value={Number(item.value)} className="h-1 mt-2 mb-1" />
                        </>
                      )}
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </Card>
                  ))}
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* Section breakdown */}
                  <Card className="p-5 border-border/50">
                    <h4 className="font-semibold mb-4 text-sm">Section Breakdown</h4>
                    <div className="space-y-4">
                      {analysis.sections?.map(section => (
                        <div key={section.name}>
                          <div className="flex justify-between text-sm mb-1.5">
                            <span className="font-medium">{section.name}</span>
                            <span className={`font-semibold ${SCORE_COLOR(section.score)}`}>{section.score}/100</span>
                          </div>
                          <Progress value={section.score} className="h-1.5 mb-1.5" />
                          {section.suggestions?.[0] && (
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              💡 {section.suggestions[0]}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="space-y-4">
                    {/* Critical fixes */}
                    {analysis.critical_fixes?.length > 0 && (
                      <Card className="p-5 border-red-500/20 bg-red-500/5">
                        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-red-400">
                          <AlertCircle className="h-4 w-4" /> Critical Fixes
                        </h4>
                        <ul className="space-y-2">
                          {analysis.critical_fixes.map((fix, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                              <span className="text-red-400 mt-0.5 shrink-0">•</span> {fix}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}

                    {/* Strengths */}
                    {analysis.strong_points?.length > 0 && (
                      <Card className="p-5 border-green-500/20 bg-green-500/5">
                        <h4 className="font-semibold mb-3 text-sm flex items-center gap-2 text-green-400">
                          <CheckCircle className="h-4 w-4" /> Strengths
                        </h4>
                        <ul className="space-y-2">
                          {analysis.strong_points.map((p, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                              <span className="text-green-400 mt-0.5 shrink-0">✓</span> {p}
                            </li>
                          ))}
                        </ul>
                      </Card>
                    )}
                  </div>
                </div>

                {/* Missing keywords */}
                {analysis.missing_keywords?.length > 0 && (
                  <Card className="p-5 border-border/50">
                    <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
                      <Search className="h-4 w-4 text-yellow-400" /> Missing Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.missing_keywords.map(kw => (
                        <Badge key={kw} className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/30 border">
                          + {kw}
                        </Badge>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            )}

            {!analysis && !loadingAnalysis && (
              <Card className="p-12 border-border/50 border-dashed text-center">
                <FileText className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground text-sm">
                  Paste your resume above and click <strong>Analyze Resume</strong> to get your score
                </p>
              </Card>
            )}
          </div>
        )}

        {/* ── Tailor Tab ── */}
        {activeTab === 'tailor' && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 border-border/50">
                <h3 className="font-semibold mb-1 text-sm uppercase tracking-wide text-muted-foreground">
                  Step 1 — Job Details
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Tell us what role you're applying for</p>
                <div className="space-y-3">
                  <input
                    className="w-full h-10 bg-muted/30 rounded-lg px-4 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Job title *  (e.g. Senior React Developer)"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                  />
                  <textarea
                    className="w-full h-40 bg-muted/30 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary border border-border/50 leading-relaxed"
                    placeholder="Paste the job description here…"
                    value={jobDescription}
                    onChange={e => setJobDescription(e.target.value)}
                  />
                </div>
              </Card>

              <Card className="p-6 border-border/50">
                <h3 className="font-semibold mb-1 text-sm uppercase tracking-wide text-muted-foreground">
                  Step 2 — Your Resume
                </h3>
                <p className="text-xs text-muted-foreground mb-4">Paste the resume you want tailored</p>
                <textarea
                  className="w-full h-40 bg-muted/30 rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-primary border border-border/50 leading-relaxed"
                  placeholder="Paste your current resume text here…"
                  value={resumeText}
                  onChange={e => setResumeText(e.target.value)}
                />
                <Button
                  onClick={handleTailor}
                  disabled={loadingTailor}
                  className="mt-4 w-full bg-primary hover:bg-primary/90 gap-2 h-10"
                >
                  {loadingTailor
                    ? <><RefreshCw className="h-4 w-4 animate-spin" /> Tailoring…</>
                    : <><Sparkles className="h-4 w-4" /> Tailor Resume to This Job</>}
                </Button>
              </Card>
            </div>

            {loadingTailor && (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-2xl" />
                <Skeleton className="h-64 rounded-2xl" />
              </div>
            )}

            {tailored && !loadingTailor && (
              <div className="space-y-4">
                <Card className="p-5 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm text-green-400 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" /> Match Improvement
                    </h4>
                    <span className="text-3xl font-bold text-green-400">+{tailored.match_improvement}%</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {tailored.keywords_added?.map(kw => (
                      <Badge key={kw} className="text-xs bg-green-500/10 text-green-400 border-green-500/30 border">
                        + {kw}
                      </Badge>
                    ))}
                  </div>
                </Card>

                <Card className="p-5 border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-sm">Tailored Resume</h4>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { navigator.clipboard.writeText(tailored.tailored_text); toast.success('Copied!') }}
                      className="gap-1.5 text-xs h-8"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy All
                    </Button>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 text-xs text-muted-foreground whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed border border-border/50">
                    {tailored.tailored_text}
                  </div>
                </Card>

                {tailored.changes_made?.length > 0 && (
                  <Card className="p-5 border-border/50">
                    <h4 className="font-semibold text-sm mb-3">Changes Made</h4>
                    <ul className="space-y-2">
                      {tailored.changes_made.map((c, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2 leading-relaxed">
                          <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" /> {c}
                        </li>
                      ))}
                    </ul>
                  </Card>
                )}
              </div>
            )}

            {!tailored && !loadingTailor && (
              <Card className="p-12 border-border/50 border-dashed text-center">
                <Target className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p className="text-muted-foreground text-sm">
                  Fill in the job details and your resume, then click <strong>Tailor Resume</strong>
                </p>
              </Card>
            )}
          </div>
        )}

        {/* ── ATS Tips Tab ── */}
        {activeTab === 'tips' && (
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                title: '📄 Format for ATS',
                items: [
                  'Use standard headers: Experience, Education, Skills',
                  'Avoid tables, columns, text boxes, and graphics',
                  'Use standard fonts: Arial, Calibri, Times New Roman',
                  'Save as .docx (most compatible) or a simple single-column PDF',
                  'Keep margins between 0.5" and 1"',
                  'Use consistent date format: MM/YYYY throughout',
                ]
              },
              {
                title: '🔑 Keyword Optimization',
                items: [
                  'Mirror exact phrases from the job description',
                  'Include both acronyms and full forms (e.g. "AI (Artificial Intelligence)")',
                  'Place keywords in context, not just a bare skills list',
                  'Add keywords to both your summary and experience bullets',
                  'Use industry-standard tool names precisely (TypeScript, not "type script")',
                  'Match the required vs. preferred skills ratio from the posting',
                ]
              },
              {
                title: '📈 Quantify Achievements',
                items: [
                  'Replace duties with wins: "Built X that improved Y by Z%"',
                  'Add revenue impact: "contributed to $2M pipeline growth"',
                  'Include team scale: "led team of 8 engineers"',
                  'Show volume: "processed 10K+ requests/day"',
                  'Time metrics: "reduced load time from 4s to 800ms"',
                  'Use ranges when exact numbers are confidential',
                ]
              },
              {
                title: '✍️ Summary Section',
                items: [
                  'Put your most important keywords in the first 50 words',
                  'Mention your target role title exactly as it appears in the posting',
                  'Include years of experience and key tech stack up front',
                  'Lead with your biggest career achievement',
                  'Keep to 3–4 sentences maximum',
                  'Customize this section for every single application',
                ]
              },
            ].map(section => (
              <Card key={section.title} className="p-6 border-border/50">
                <h3 className="font-semibold mb-4">{section.title}</h3>
                <ul className="space-y-2.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-muted-foreground leading-relaxed">
                      <CheckCircle className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
