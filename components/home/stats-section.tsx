'use client'

import { motion } from 'framer-motion'

const stats = [
  { value: '2M+', label: 'Jobs Aggregated', description: 'From 50+ global portals' },
  { value: '140+', label: 'Countries Covered', description: 'Global opportunities' },
  { value: '95%', label: 'Match Accuracy', description: 'AI-powered precision' },
  { value: '3x', label: 'Faster Job Search', description: 'vs manual searching' },
]

export function StatsSection() {
  return (
    <section className="py-20 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-colors"
            >
              <div className="text-4xl font-bold gradient-text mb-1">{stat.value}</div>
              <div className="font-semibold text-foreground mb-1">{stat.label}</div>
              <div className="text-sm text-muted-foreground">{stat.description}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
