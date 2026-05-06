'use client'

import { motion } from 'framer-motion'

const steps = [
  { step: '01', title: 'Create Your Profile', description: 'Upload your resume. AI auto-parses skills, experience, and preferences. Set target countries and salary.' },
  { step: '02', title: 'AI Searches Globally', description: 'Our engine searches 50+ job portals, filters for last 14 days, detects visa sponsorship, and finds recruiter contacts.' },
  { step: '03', title: 'Get Matched & Scored', description: 'Each job gets a compatibility score, missing skills list, interview probability, and priority level based on your profile.' },
  { step: '04', title: 'Apply with One Click', description: 'CareerBot writes personalized cover letters, fills applications, and sends emails via Gmail/Outlook automatically.' },
  { step: '05', title: 'Ace Your Interviews', description: 'Get company-specific questions, best answers, mock interview practice, and salary negotiation scripts for every job.' },
]

export function HowItWorks() {
  return (
    <section className="py-24 px-4">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground">From signup to job offer in 5 steps</p>
        </motion.div>

        <div className="space-y-6">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-6 p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
            >
              <div className="text-5xl font-black gradient-text opacity-30 shrink-0 w-16">{step.step}</div>
              <div>
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
