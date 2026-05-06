'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

interface Filters {
  remote: boolean
  sponsorship: boolean
  country: string
  jobType: string
  minScore: number
}

interface Props { filters: Filters; onChange: (f: Filters) => void }

export function JobFilters({ filters, onChange }: Props) {
  function update(key: keyof Filters, value: unknown) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card p-5 space-y-5 sticky top-36">
      <h3 className="font-semibold text-sm">Filters</h3>
      <Separator />

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Work Mode</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.remote} onChange={e => update('remote', e.target.checked)} className="rounded" />
          <span className="text-sm">Remote only</span>
        </label>
      </div>

      <div className="space-y-3">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Visa</Label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={filters.sponsorship} onChange={e => update('sponsorship', e.target.checked)} className="rounded" />
          <span className="text-sm">Sponsorship available</span>
        </label>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Country</Label>
        <Select value={filters.country || 'all'} onValueChange={v => update('country', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any country" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any country</SelectItem>
            <SelectItem value="USA">USA</SelectItem>
            <SelectItem value="UK">United Kingdom</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Germany">Germany</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
            <SelectItem value="UAE">UAE / Dubai</SelectItem>
            <SelectItem value="Singapore">Singapore</SelectItem>
            <SelectItem value="Netherlands">Netherlands</SelectItem>
            <SelectItem value="Remote">Remote</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Job Type</Label>
        <Select value={filters.jobType || 'all'} onValueChange={v => update('jobType', v === 'all' ? '' : v)}>
          <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Any type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            <SelectItem value="full-time">Full-time</SelectItem>
            <SelectItem value="part-time">Part-time</SelectItem>
            <SelectItem value="contract">Contract</SelectItem>
            <SelectItem value="freelance">Freelance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground uppercase tracking-wide">Min Match Score</Label>
        <Select value={String(filters.minScore)} onValueChange={v => update('minScore', Number(v))}>
          <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="0">Any score</SelectItem>
            <SelectItem value="40">40%+</SelectItem>
            <SelectItem value="60">60%+</SelectItem>
            <SelectItem value="80">80%+ (Best matches)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
