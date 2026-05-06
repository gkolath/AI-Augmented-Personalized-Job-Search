'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles } from 'lucide-react'

export function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-12 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-blue-500/5 to-cyan-500/10"
        >
          <Sparkles className="h-12 w-12 text-primary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Find Your Dream Job?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Start free. No credit card. Access 2M+ jobs from 140+ countries with AI-powered matching.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="gap-2 h-12 px-8 bg-primary hover:bg-primary/90">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/jobs">
              <Button size="lg" variant="outline" className="h-12 px-8 border-border/50">
                Browse Jobs
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
