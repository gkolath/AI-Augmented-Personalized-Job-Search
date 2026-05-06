'use client'

import { useState } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { DollarSign, TrendingUp, TrendingDown, Minus, RefreshCw, Copy, Building } from 'lucide-react'
import axios from 'axios'
import toast from 'react-hot-toast'
import type { SalaryIntelligence } from '@/types'

const TREND_CONFIG = {
  rising: { icon: TrendingUp, color: 'text-green-400', label: 'Rising Market' },
  stable: { icon: Minus, color: 'text-yellow-400', label: 'Stable Market' },
  declining: { icon: TrendingDown, color: 'text-red-400', label: 'Declining Market' },
}

export default function SalaryPage() {
  const [role, setRole] = useState('')
  const [location, setLocation] = useState('')
  const [yoe, setYoe] = useState('3')
  const [skills, setSkills] = useState('')
  const [data, setData] = useState<SalaryIntelligence | null>(null)
  const [loading, setLoading] = useState(false)

  async function fetchSalary() {
    if (!role.trim()) { toast.error('Enter a job role first'); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({ role, location: location || 'United States', yoe, skills })
      const res = await axios.get(`/api/salary?${params}`)
      setData(res.data.salary)
    } catch { toast.error('Failed to fetch salary data') }
    setLoading(false)
  }

  function copyScript(text: string) {
    navigator.clipboard.writeText(text)
    toast.success('Script copied!')
  }

  const totalBenefitsValue = data?.benefits_value?.reduce((sum, b) => sum + b.estimated_value, 0) || 0

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Salary & Offer Intelligence</h1>
          </div>
          <p className="text-muted-foreground">Know your market value, compare offers, and negotiate with confidence</p>
        </div>

        {/* Search Form */}
        <Card className="p-5 border-border/50 mb-8">
          <div className="grid md:grid-cols-4 gap-3 mb-3">
            <input
              className="h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Job role *"
              value={role}
              onChange={e => setRole(e.target.value)}
            />
            <input
              className="h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Location (e.g. San Francisco, Remote)"
              value={location}
              onChange={e => setLocation(e.target.value)}
            />
            <select
              className="h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none"
              value={yoe}
              onChange={e => setYoe(e.target.value)}
            >
              {['0','1','2','3','5','7','10'].map(y => <option key={y} value={y}>{y === '0' ? '< 1 year' : `${y}+ years`}</option>)}
            </select>
            <Button onClick={fetchSalary} disabled={loading} className="bg-primary hover:bg-primary/90 gap-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <DollarSign className="h-4 w-4" />}
              Get Salary Data
            </Button>
          </div>
          <input
            className="w-full h-9 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none focus:ring-1 focus:ring-primary"
            placeholder="Key skills (optional, comma-separated, e.g. React, AWS, TypeScript)"
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
        </Card>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-64 rounded-2xl" />
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Salary Percentiles */}
            <Card className="p-6 border-border/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">{data.role} — {data.location}</h3>
                {data.market_trend && (() => {
                  const cfg = TREND_CONFIG[data.market_trend]
                  return <span className={`flex items-center gap-1.5 text-sm ${cfg.color}`}><cfg.icon className="h-4 w-4" /> {cfg.label}</span>
                })()}
              </div>

              {/* Visual salary bar */}
              <div className="mb-6">
                <div className="relative h-12 bg-muted/30 rounded-xl overflow-hidden mb-2">
                  <div className="absolute inset-y-0 left-[10%] right-[10%] bg-gradient-to-r from-blue-500/20 via-primary/30 to-green-500/20 rounded-lg" />
                  {[
                    { p: data.percentiles.p50, label: 'Median', color: 'bg-primary' },
                    { p: data.percentiles.p75, label: '75th', color: 'bg-green-500' },
                  ].map(marker => {
                    const min = data.percentiles.p10
                    const max = data.percentiles.p90
                    const pct = ((marker.p - min) / (max - min)) * 80 + 10
                    return (
                      <div key={marker.label} className="absolute top-1 bottom-1 w-0.5" style={{ left: `${pct}%` }}>
                        <div className={`w-full h-full ${marker.color} rounded-full`} />
                      </div>
                    )
                  })}
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { label: '10th %ile', value: data.percentiles.p10, color: 'text-muted-foreground' },
                    { label: '25th %ile', value: data.percentiles.p25, color: 'text-blue-400' },
                    { label: 'Median', value: data.percentiles.p50, color: 'text-primary' },
                    { label: '75th %ile', value: data.percentiles.p75, color: 'text-green-400' },
                    { label: '90th %ile', value: data.percentiles.p90, color: 'text-purple-400' },
                  ].map(item => (
                    <div key={item.label} className="text-center">
                      <div className={`text-lg font-bold ${item.color}`}>${(item.value / 1000).toFixed(0)}k</div>
                      <div className="text-xs text-muted-foreground">{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Experience Adjustment</div>
                  <div className="text-sm">{data.yoe_adjustment}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="text-xs text-muted-foreground mb-1">Remote Premium</div>
                  <div className="text-sm">{data.remote_premium}</div>
                </div>
              </div>
            </Card>

            {/* Negotiation Scripts */}
            <Card className="p-5 border-border/50">
              <h3 className="font-semibold mb-4">💬 Negotiation Scripts</h3>
              <div className="space-y-4">
                {data.negotiation_scripts?.map((s, i) => (
                  <div key={i} className="p-4 rounded-xl border border-border/50">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">{s.scenario}</Badge>
                      <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={() => copyScript(s.script)}>
                        <Copy className="h-3 w-3" /> Copy
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground italic mb-2">&ldquo;{s.script}&rdquo;</p>
                    <p className="text-xs text-green-400">✓ {s.outcome}</p>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Benefits Value */}
              <Card className="p-5 border-border/50">
                <h3 className="font-semibold mb-3">🎁 Benefits Value Calculator</h3>
                <p className="text-xs text-muted-foreground mb-3">Estimated annual value of common benefits</p>
                <div className="space-y-2 mb-4">
                  {data.benefits_value?.map((b, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{b.name}</span>
                      <span className="font-medium text-green-400">+${b.estimated_value.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border/50 pt-3 flex justify-between">
                  <span className="font-semibold text-sm">Total Benefits Value</span>
                  <span className="font-bold text-green-400">${totalBenefitsValue.toLocaleString()}/yr</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Add this to base salary for true total compensation</p>
              </Card>

              {/* Top Paying Companies */}
              <Card className="p-5 border-border/50">
                <h3 className="font-semibold mb-3 flex items-center gap-2"><Building className="h-4 w-4 text-primary" /> Top Paying Companies</h3>
                <div className="space-y-2">
                  {data.top_paying_companies?.map((co, i) => (
                    <div key={co.name} className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground w-5">#{i + 1}</span>
                      <div className="flex-1 bg-muted/30 rounded-full h-2 overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(co.avg_salary / (data.top_paying_companies[0]?.avg_salary || 1)) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-28 text-right">{co.name}</span>
                      <span className="text-sm text-green-400 w-20 text-right">${(co.avg_salary / 1000).toFixed(0)}k</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { icon: '📊', title: 'Market Benchmarks', desc: 'Real salary percentiles for any role, location, and experience level based on 2024-25 market data' },
              { icon: '💬', title: 'Negotiation Scripts', desc: 'Exact words to say in salary negotiations, tailored to your situation — tested and proven effective' },
              { icon: '🎁', title: 'Total Comp Calculator', desc: 'Calculate the true value of an offer including equity, benefits, bonuses, and perks' },
            ].map(f => (
              <Card key={f.title} className="p-5 border-border/50">
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-semibold mb-1">{f.title}</h4>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
