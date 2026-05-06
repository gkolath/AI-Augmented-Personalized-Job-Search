'use client'

import { motion } from 'framer-motion'
import { Brain, Globe2, Mail, Bot, Mic, BarChart3, Shield, Zap } from 'lucide-react'

const features = [
  {
    icon: Brain,
    title: 'AI Job Matching',
    description: 'GPT-4 analyzes your profile and ranks every job by compatibility score, missing skills, and interview probability.',
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
  },
  {
    icon: Globe2,
    title: 'Global Job Aggregation',
    description: 'Searches 50+ portals: LinkedIn, Indeed, Glassdoor, Naukri, GulfTalent, RemoteOK, and more — all in one place.',
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
  },
  {
    icon: Shield,
    title: 'Visa Sponsorship Finder',
    description: 'Automatically detects and flags jobs offering visa sponsorship. Filter by your visa requirements instantly.',
    color: 'text-green-400',
    bg: 'bg-green-400/10',
  },
  {
    icon: Mail,
    title: 'One-Click Email Outreach',
    description: 'Find recruiter emails and send personalized applications via Gmail or Outlook with one click.',
    color: 'text-orange-400',
    bg: 'bg-orange-400/10',
  },
  {
    icon: Bot,
    title: 'CareerBot Auto Apply',
    description: 'Tell CareerBot "Apply to top 20 QA jobs in Dubai" and it finds, ranks, and prepares applications automatically.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
  },
  {
    icon: Mic,
    title: 'Interview Copilot',
    description: 'Get personalized interview questions, best answers, company tips, and mock interview practice for every job.',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
  },
  {
    icon: BarChart3,
    title: 'Career Intelligence',
    description: 'AI recommends which countries are easiest to get hired in, salary estimates, and skills to learn next.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
  },
  {
    icon: Zap,
    title: 'Freelance Hub',
    description: 'Separate module for Upwork, Toptal, Contra, and PeoplePerHour gigs matched to your skills and rates.',
    color: 'text-red-400',
    bg: 'bg-red-400/10',
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 px-4 bg-muted/10">
      <div className="mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Land Your Dream Job</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The most comprehensive AI-powered career platform ever built. Replace 15 tools with one.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all cursor-default"
            >
              <div className={`inline-flex p-3 rounded-xl ${feature.bg} mb-4`}>
                <feature.icon className={`h-5 w-5 ${feature.color}`} />
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
