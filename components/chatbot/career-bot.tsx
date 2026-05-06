'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Send, Bot, Loader2, Sparkles } from 'lucide-react'
import { ChatMessage, Job } from '@/types'
import { JobCard } from '@/components/jobs/job-card'
import axios from 'axios'

interface Props { onClose: () => void }

const SUGGESTIONS = [
  'Find QA jobs in Dubai with visa sponsorship',
  'Search remote Python developer jobs',
  'Apply to top 10 automation engineer roles',
  'Prepare me for a React interview',
  'Find freelance Playwright projects',
]

export function CareerBot({ onClose }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: '0',
    role: 'assistant',
    content: "Hi! I'm **CareerBot** 🤖 — your AI job search assistant.\n\nI can search jobs globally, help you apply, prep for interviews, and find freelance gigs.\n\nWhat would you like to do?",
    timestamp: new Date().toISOString(),
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function sendMessage(text = input) {
    if (!text.trim() || loading) return
    setInput('')
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: text, timestamp: new Date().toISOString() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const apiMessages = [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
      const { data } = await axios.post('/api/ai/chat', { messages: apiMessages })
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toISOString(),
        jobs: data.jobs,
      }
      setMessages(prev => [...prev, botMsg])
    } catch {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I need you to be logged in to search jobs. Please sign in first!',
        timestamp: new Date().toISOString(),
      }])
    }
    setLoading(false)
  }

  function renderContent(content: string) {
    // Split on bold markers and newlines, return React nodes instead of raw HTML
    const parts = content.split(/(\*\*.*?\*\*|\n)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      if (part === '\n') return <br key={i} />
      return part
    })
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 w-96 max-h-[80vh] flex flex-col rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/10"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 bg-primary/5">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <div className="font-semibold text-sm">CareerBot</div>
              <div className="text-xs text-green-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-green-400" /> Online
              </div>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-7 w-7">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4 space-y-3">
          <div className="space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-br-sm'
                    : 'bg-muted text-foreground rounded-bl-sm'
                }`}>
                  <div>{renderContent(msg.content)}</div>
                  {msg.jobs && msg.jobs.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <div className="text-xs opacity-70 mb-1">Found {msg.jobs.length} matching jobs:</div>
                      {msg.jobs.slice(0, 3).map(job => (
                        <div key={job.id} className="bg-background/50 rounded-xl p-2.5 cursor-pointer hover:bg-background transition-colors" onClick={() => setSelectedJob(job)}>
                          <div className="font-medium text-xs">{job.title}</div>
                          <div className="text-xs opacity-70">{job.company} · {job.country}</div>
                          {job.match_score && <div className="text-xs text-primary mt-0.5">{job.match_score}% match</div>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-3.5 py-2.5">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>

        {/* Suggestions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <div className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Try:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.slice(0, 3).map((s, i) => (
                <button key={i} onClick={() => sendMessage(s)} className="text-xs px-2.5 py-1 rounded-full border border-border/50 bg-muted hover:border-primary/30 hover:text-primary transition-colors text-left">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border/50">
          <form onSubmit={e => { e.preventDefault(); sendMessage() }} className="flex gap-2">
            <Input
              placeholder="Ask CareerBot anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              className="flex-1 h-9 text-sm"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="h-9 w-9 bg-primary hover:bg-primary/90" disabled={loading || !input.trim()}>
              <Send className="h-3.5 w-3.5" />
            </Button>
          </form>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
