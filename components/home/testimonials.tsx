'use client'

import { motion } from 'framer-motion'

const testimonials = [
  { name: 'Arjun Sharma', role: 'Senior QA Engineer', company: 'Got hired at Amazon Dubai', avatar: 'AS', quote: 'Found a visa-sponsored QA role in Dubai within 2 weeks. The AI match score was spot-on — 89% compatibility and I got an offer!' },
  { name: 'Maria Santos', role: 'Full Stack Developer', company: 'Now at Shopify Canada', avatar: 'MS', quote: 'The interview prep feature is insane. Generated exact questions that were asked in my technical round. Highly recommend.' },
  { name: 'Li Wei', role: 'ML Engineer', company: 'Joined a Berlin startup', avatar: 'LW', quote: 'CareerBot applied to 30 jobs in Germany overnight. Woke up to 5 interview requests. This platform is a game changer.' },
  { name: 'Fatima Al-Zahrawi', role: 'Product Manager', company: 'Relocated to London', avatar: 'FA', quote: 'As someone who needed visa sponsorship, the sponsorship filter saved me hundreds of hours. Found my dream role in 3 weeks.' },
]

export function TestimonialsSection() {
  return (
    <section className="py-24 px-4 bg-muted/10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Real Results, Real Stories</h2>
          <p className="text-lg text-muted-foreground">Join thousands who landed their dream jobs globally</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border/50 bg-card"
            >
              <p className="text-muted-foreground mb-6 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role} · {t.company}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
