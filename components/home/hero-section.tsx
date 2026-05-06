'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Globe, Sparkles, ArrowRight, MapPin } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

const floatingBadges = [
  { text: '🌍 Global Jobs', delay: 0 },
  { text: '🤖 AI Matching', delay: 0.5 },
  { text: '✈️ Visa Sponsorship', delay: 1 },
  { text: '💼 Auto Apply', delay: 1.5 },
  { text: '🎯 Interview Prep', delay: 2 },
]

export function HeroSection() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams({ q: query, location })
    router.push(`/jobs?${params}`)
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/10 blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-blue-600/10 blur-3xl animate-float" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-cyan-600/5 blur-3xl" />
        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Top badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-muted/50 px-4 py-1.5 text-sm mb-8"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-muted-foreground">Powered by GPT-4 AI</span>
          <span className="h-1 w-1 rounded-full bg-green-500" />
          <span className="text-green-500 text-xs">Live</span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
        >
          Find Your Dream Job
          <br />
          <span className="gradient-text">Anywhere in the World</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
        >
          AI-powered job matching from 50+ global portals. Auto-apply, interview prep, visa sponsorship finder, and career intelligence — all in one platform.
        </motion.p>

        {/* Search bar */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          onSubmit={handleSearch}
          className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-8"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Job title, skills, or keywords..."
              className="pl-10 h-12 bg-card border-border/50 text-base"
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div className="relative flex-1">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Location or Remote..."
              className="pl-10 h-12 bg-card border-border/50 text-base"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8 bg-primary hover:bg-primary/90 gap-2">
            <Sparkles className="h-4 w-4" />
            AI Search
          </Button>
        </motion.form>

        {/* Floating badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-wrap justify-center gap-2 mb-12"
        >
          {floatingBadges.map((badge, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + badge.delay * 0.1 }}
              className="inline-flex items-center rounded-full border border-border/50 bg-muted/30 px-3 py-1 text-sm text-muted-foreground"
            >
              {badge.text}
            </motion.span>
          ))}
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link href="/signup">
            <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 h-12 px-8">
              Start Free Today
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/jobs">
            <Button size="lg" variant="outline" className="h-12 px-8 gap-2 border-border/50">
              <Globe className="h-4 w-4" />
              Browse All Jobs
            </Button>
          </Link>
        </motion.div>

        {/* Social proof */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Join <strong className="text-foreground">10,000+</strong> professionals finding jobs globally · No credit card required
        </motion.p>
      </div>
    </section>
  )
}
