'use client'

import { useState, useEffect } from 'react'
import { Navbar } from '@/components/layout/navbar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Briefcase, Plus, Search, ExternalLink, Edit2, Trash2,
  Calendar, Mail, TrendingUp, Clock, CheckCircle, XCircle,
  AlertCircle, Star
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'
import type { Application } from '@/types'

const STATUS_CONFIG = {
  saved:      { label: 'Saved',      color: 'bg-gray-500/10 text-gray-400 border-gray-500/30',      icon: Star },
  applied:    { label: 'Applied',    color: 'bg-blue-500/10 text-blue-400 border-blue-500/30',       icon: Briefcase },
  interview:  { label: 'Interview',  color: 'bg-purple-500/10 text-purple-400 border-purple-500/30', icon: Calendar },
  offer:      { label: 'Offer 🎉',   color: 'bg-green-500/10 text-green-400 border-green-500/30',    icon: CheckCircle },
  rejected:   { label: 'Rejected',   color: 'bg-red-500/10 text-red-400 border-red-500/30',          icon: XCircle },
  withdrawn:  { label: 'Withdrawn',  color: 'bg-orange-500/10 text-orange-400 border-orange-500/30', icon: AlertCircle },
}

const DEMO_APPS: Application[] = [
  { id: '1', user_id: 'demo', company: 'Stripe', position: 'Senior Software Engineer', location: 'Remote', status: 'interview', applied_at: new Date(Date.now() - 5 * 86400000).toISOString(), next_step: 'Technical interview', next_step_date: new Date(Date.now() + 2 * 86400000).toISOString(), notes: 'Referred by Sarah. Great culture fit.', job_url: 'https://stripe.com/jobs', contact_name: 'Alex Chen', contact_email: 'alex@stripe.com', created_at: new Date().toISOString() },
  { id: '2', user_id: 'demo', company: 'Linear', position: 'Frontend Engineer', location: 'Remote', status: 'applied', applied_at: new Date(Date.now() - 2 * 86400000).toISOString(), notes: 'Dream company. Used their design system as reference.', job_url: 'https://linear.app/careers', created_at: new Date().toISOString() },
  { id: '3', user_id: 'demo', company: 'Vercel', position: 'Staff Engineer', location: 'Remote', status: 'offer', applied_at: new Date(Date.now() - 14 * 86400000).toISOString(), salary_offered: 195000, salary_currency: 'USD', next_step: 'Review offer by Friday', notes: 'Fantastic team. Offer deadline this week.', created_at: new Date().toISOString() },
  { id: '4', user_id: 'demo', company: 'Figma', position: 'React Engineer', location: 'San Francisco', status: 'rejected', applied_at: new Date(Date.now() - 20 * 86400000).toISOString(), notes: 'No feedback given. Try again in 6 months.', created_at: new Date().toISOString() },
  { id: '5', user_id: 'demo', company: 'Notion', position: 'Full Stack Developer', location: 'Remote', status: 'saved', notes: 'Strong match. Apply when resume is updated.', job_url: 'https://notion.so/careers', created_at: new Date().toISOString() },
]

const EMPTY_APP: Partial<Application> = {
  company: '', position: '', location: '', status: 'applied', notes: '', job_url: '', contact_name: '', contact_email: ''
}

export default function ApplicationsPage() {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  const [apps, setApps] = useState<Application[]>(DEMO_APPS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [formData, setFormData] = useState<Partial<Application>>(EMPTY_APP)

  const filtered = apps.filter(a => {
    const matchSearch = !search || a.company.toLowerCase().includes(search.toLowerCase()) || a.position.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || a.status === filterStatus
    return matchSearch && matchStatus
  })

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    interviews: apps.filter(a => a.status === 'interview').length,
    offers: apps.filter(a => a.status === 'offer').length,
    responseRate: apps.length ? Math.round((apps.filter(a => ['interview','offer'].includes(a.status)).length / apps.filter(a => a.status !== 'saved').length) * 100) || 0 : 0,
  }

  function handleSave() {
    if (!formData.company || !formData.position) { toast.error('Company and position required'); return }
    if (editingApp) {
      setApps(apps.map(a => a.id === editingApp.id ? { ...a, ...formData } : a))
      toast.success('Application updated')
    } else {
      const newApp: Application = {
        ...EMPTY_APP,
        ...formData,
        id: Date.now().toString(),
        user_id: 'demo',
        created_at: new Date().toISOString(),
        applied_at: formData.status !== 'saved' ? new Date().toISOString() : undefined,
      } as Application
      setApps([newApp, ...apps])
      toast.success('Application added')
    }
    setShowForm(false)
    setEditingApp(null)
    setFormData(EMPTY_APP)
  }

  function handleEdit(app: Application) {
    setEditingApp(app)
    setFormData(app)
    setShowForm(true)
  }

  function handleDelete(id: string) {
    setApps(apps.filter(a => a.id !== id))
    toast.success('Removed')
  }

  function handleStatusChange(id: string, status: Application['status']) {
    setApps(apps.map(a => a.id === id ? { ...a, status, applied_at: status !== 'saved' && !a.applied_at ? new Date().toISOString() : a.applied_at } : a))
  }

  function generateFollowUp(app: Application) {
    const subject = encodeURIComponent(`Following up on ${app.position} application`)
    const body = encodeURIComponent(`Hi${app.contact_name ? ` ${app.contact_name}` : ''},\n\nI hope this message finds you well. I wanted to follow up on my application for the ${app.position} position at ${app.company}.\n\nI remain very excited about this opportunity and would love to learn about next steps.\n\nBest regards`)
    if (app.contact_email) {
      window.open(`https://mail.google.com/mail/?view=cm&to=${app.contact_email}&su=${subject}&body=${body}`, '_blank')
    } else {
      navigator.clipboard.writeText(decodeURIComponent(body))
      toast.success('Follow-up email copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-24 px-4 pb-16 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-primary/10">
                <Briefcase className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-3xl font-bold">Application Copilot</h1>
            </div>
            <p className="text-muted-foreground">Track every application, follow-up, and offer in one place</p>
          </div>
          <Button onClick={() => { setShowForm(true); setEditingApp(null); setFormData(EMPTY_APP) }} className="bg-primary hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" /> Add Application
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { label: 'Total', value: stats.total, icon: Briefcase, color: 'text-foreground' },
            { label: 'Applied', value: stats.applied, icon: TrendingUp, color: 'text-blue-400' },
            { label: 'Interviews', value: stats.interviews, icon: Calendar, color: 'text-purple-400' },
            { label: 'Offers', value: stats.offers, icon: CheckCircle, color: 'text-green-400' },
            { label: 'Response Rate', value: `${stats.responseRate}%`, icon: TrendingUp, color: 'text-primary' },
          ].map(s => (
            <Card key={s.label} className="p-4 border-border/50 text-center">
              <s.icon className={`h-4 w-4 mx-auto mb-1 ${s.color}`} />
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </Card>
          ))}
        </div>

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="p-5 border-primary/30 mb-6">
            <h3 className="font-semibold mb-4">{editingApp ? 'Edit Application' : 'Add New Application'}</h3>
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              <Input placeholder="Company *" value={formData.company || ''} onChange={e => setFormData(f => ({ ...f, company: e.target.value }))} />
              <Input placeholder="Position *" value={formData.position || ''} onChange={e => setFormData(f => ({ ...f, position: e.target.value }))} />
              <Input placeholder="Location" value={formData.location || ''} onChange={e => setFormData(f => ({ ...f, location: e.target.value }))} />
              <Input placeholder="Job URL" value={formData.job_url || ''} onChange={e => setFormData(f => ({ ...f, job_url: e.target.value }))} />
              <Input placeholder="Contact Name" value={formData.contact_name || ''} onChange={e => setFormData(f => ({ ...f, contact_name: e.target.value }))} />
              <Input placeholder="Contact Email" value={formData.contact_email || ''} onChange={e => setFormData(f => ({ ...f, contact_email: e.target.value }))} />
              <Input placeholder="Next Step" value={formData.next_step || ''} onChange={e => setFormData(f => ({ ...f, next_step: e.target.value }))} />
              <Input type="date" value={formData.next_step_date?.split('T')[0] || ''} onChange={e => setFormData(f => ({ ...f, next_step_date: e.target.value }))} />
              <select
                className="h-10 bg-muted/30 rounded-lg px-3 text-sm border border-border/50 focus:outline-none"
                value={formData.status || 'applied'}
                onChange={e => setFormData(f => ({ ...f, status: e.target.value as Application['status'] }))}
              >
                {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
            <textarea
              className="w-full h-20 bg-muted/30 rounded-lg p-3 text-sm resize-none border border-border/50 focus:outline-none mb-3"
              placeholder="Notes..."
              value={formData.notes || ''}
              onChange={e => setFormData(f => ({ ...f, notes: e.target.value }))}
            />
            <div className="flex gap-3">
              <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save</Button>
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingApp(null) }}>Cancel</Button>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9 h-9 w-56" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          {['all', ...Object.keys(STATUS_CONFIG)].map(s => (
            <Button
              key={s}
              size="sm"
              variant={filterStatus === s ? 'default' : 'outline'}
              className={filterStatus === s ? 'bg-primary' : ''}
              onClick={() => setFilterStatus(s)}
            >
              {s === 'all' ? 'All' : STATUS_CONFIG[s as keyof typeof STATUS_CONFIG].label}
            </Button>
          ))}
        </div>

        {/* Applications List */}
        <div className="space-y-3">
          {filtered.length === 0 ? (
            <Card className="p-12 border-dashed border-border/50 text-center">
              <Briefcase className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p className="text-muted-foreground">No applications yet. Add your first one!</p>
            </Card>
          ) : filtered.map(app => {
            const cfg = STATUS_CONFIG[app.status]
            const StatusIcon = cfg.icon
            return (
              <Card key={app.id} className="p-4 border-border/50 hover:border-primary/20 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <Badge className={`text-xs border ${cfg.color}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {cfg.label}
                      </Badge>
                      {app.salary_offered && (
                        <Badge variant="outline" className="text-xs text-green-400 border-green-500/30">
                          ${app.salary_offered.toLocaleString()} {app.salary_currency}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">{app.position}</h3>
                    <p className="text-sm text-muted-foreground">{app.company}{app.location ? ` · ${app.location}` : ''}</p>

                    {app.next_step && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-purple-400">
                        <Clock className="h-3 w-3" />
                        {app.next_step}{app.next_step_date ? ` · ${new Date(app.next_step_date).toLocaleDateString()}` : ''}
                      </div>
                    )}

                    {app.notes && (
                      <p className="text-xs text-muted-foreground mt-1.5 line-clamp-1">{app.notes}</p>
                    )}

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      {app.applied_at && <span>Applied {mounted ? formatDistanceToNow(new Date(app.applied_at), { addSuffix: true }) : new Date(app.applied_at).toLocaleDateString()}</span>}
                      {app.contact_name && <span className="flex items-center gap-1"><Mail className="h-3 w-3" /> {app.contact_name}</span>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status quick-change */}
                    <select
                      className="text-xs h-8 bg-muted/30 rounded-lg px-2 border border-border/50 focus:outline-none"
                      value={app.status}
                      onChange={e => handleStatusChange(app.id, e.target.value as Application['status'])}
                    >
                      {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                    </select>
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => generateFollowUp(app)} title="Draft follow-up email">
                      <Mail className="h-3.5 w-3.5" />
                    </Button>
                    {app.job_url && (
                      <a href={app.job_url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="h-8 w-8"><ExternalLink className="h-3.5 w-3.5" /></Button>
                      </a>
                    )}
                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(app)}>
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-400" onClick={() => handleDelete(app.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
